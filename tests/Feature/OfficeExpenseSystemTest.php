<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\DailyClosing;
use App\Models\Expense;
use App\Models\FundAllocation;
use App\Models\FundRequest;
use App\Models\FundReturn;
use App\Models\Project;
use App\Models\ProjectAllocation;
use App\Models\ProjectSettlement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OfficeExpenseSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $accounts;
    protected User $employee;
    protected Category $travelCategory;
    protected Category $otherCategory;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup default Users
        $this->admin = User::create([
            'employee_id' => 'ADM-001',
            'name' => 'তাহমিদ জামান',
            'email' => 'admin@company.com',
            'role' => 'admin',
            'status' => 'approved',
            'password' => Hash::make('password123'),
        ]);

        $this->accounts = User::create([
            'employee_id' => 'ACC-002',
            'name' => 'করিম চৌধুরী',
            'email' => 'accounts@company.com',
            'role' => 'accounts_manager',
            'status' => 'approved',
            'password' => Hash::make('password123'),
        ]);

        $this->employee = User::create([
            'employee_id' => 'EMP-101',
            'name' => 'রহিম আহমেদ',
            'email' => 'rahim@company.com',
            'role' => 'employee',
            'status' => 'approved',
            'department' => 'Operations',
            'designation' => 'Executive',
            'password' => Hash::make('password123'),
        ]);

        // 2. Setup default Categories
        $this->travelCategory = Category::create([
            'name' => 'Travel & Commute',
            'name_bn' => 'যাতায়াত খরচ',
            'icon' => 'Car',
            'is_default' => true,
        ]);

        $this->otherCategory = Category::create([
            'name' => 'Miscellaneous',
            'name_bn' => 'অন্যান্য খরচ',
            'icon' => 'Layers',
            'is_default' => true,
        ]);
    }

    /**
     * Test 1: Fund Request lifecycle (Creation by employee, Review by admin).
     */
    public function test_fund_request_lifecycle(): void
    {
        // Employee creates a fund request
        $response = $this->actingAs($this->employee)->post('/fund-requests', [
            'requested_amount' => 5000,
            'purpose' => 'ফিল্ড ভিজিট ও সাইট খরচ',
            'details' => 'চট্টগ্রাম প্রজেক্ট সাইটে ৩ দিনের ভিজিট',
            'needed_date' => Carbon::tomorrow()->toDateString(),
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('fund_requests', [
            'user_id' => $this->employee->id,
            'requested_amount' => 5000,
            'status' => 'pending',
            'purpose' => 'ফিল্ড ভিজিট ও সাইট খরচ',
        ]);

        $fundRequest = FundRequest::where('user_id', $this->employee->id)->first();

        // Admin partially approves the fund request
        $reviewResponse = $this->actingAs($this->admin)->post("/fund-requests/{$fundRequest->id}/review", [
            'action' => 'partially_approve',
            'approved_amount' => 4000,
            'rejection_reason' => 'বাজেট সীমাবদ্ধতা হেতু ৪,০০০ টাকা অনুমোদিত',
        ]);

        $reviewResponse->assertSessionHas('success');
        $fundRequest->refresh();
        $this->assertEquals('partially_approved', $fundRequest->status);
        $this->assertEquals(4000, $fundRequest->approved_amount);
    }

    /**
     * Test 2: Fund Allocation and Employee Receipt Confirmation.
     */
    public function test_fund_allocation_and_confirmation(): void
    {
        // Accounts manager disburses fund
        $response = $this->actingAs($this->accounts)->post('/fund-allocations', [
            'user_id' => $this->employee->id,
            'amount' => 4000,
            'money_provider' => 'করিম চৌধুরী (অ্যাকাউন্টস)',
            'payment_method' => 'Cash',
            'notes' => 'ফিল্ড অগ্রিম',
            'instant_confirm' => false,
        ]);

        $response->assertSessionHas('success');

        $allocation = FundAllocation::where('user_id', $this->employee->id)->first();
        $this->assertFalse((bool) $allocation->is_received_by_employee);

        // Before confirmation, employee balance does not yet include unconfirmed allocation
        $balanceBefore = $this->employee->getBalanceSummary();
        $this->assertEquals(0, $balanceBefore['total_received']);

        // Employee confirms receipt
        $confirmResponse = $this->actingAs($this->employee)->post("/fund-allocations/{$allocation->id}/confirm");
        $confirmResponse->assertSessionHas('success');

        $allocation->refresh();
        $this->assertTrue((bool) $allocation->is_received_by_employee);

        // After confirmation, total_received and remaining_office_funds are 4000
        $balanceAfter = $this->employee->getBalanceSummary();
        $this->assertEquals(4000, $balanceAfter['total_received']);
        $this->assertEquals(4000, $balanceAfter['remaining_office_funds']);
    }

    /**
     * Test 3: Daily Expense entry, validation rule for 'Other Category', and real-time balance deduction.
     */
    public function test_expense_entry_and_balance_deduction(): void
    {
        // Give 3000 advance first
        FundAllocation::create([
            'user_id' => $this->employee->id,
            'amount' => 3000,
            'money_provider' => 'অ্যাকাউন্টস',
            'payment_method' => 'Cash',
            'disbursed_at' => Carbon::now(),
            'is_received_by_employee' => true,
            'received_at' => Carbon::now(),
            'transaction_ref' => 'TXN-TEST-101',
        ]);

        $this->assertEquals(3000, $this->employee->getBalanceSummary()['remaining_office_funds']);

        // 1. Validation test: Other Category without other_reason must fail
        $failResponse = $this->actingAs($this->employee)->post('/expenses', [
            'category_id' => $this->otherCategory->id,
            'amount' => 500,
            'expense_date' => Carbon::today()->toDateString(),
            'description' => 'জরুরি অফিস কেনাকাটা',
            // other_reason omitted!
        ]);
        $failResponse->assertSessionHasErrors(['other_reason']);

        // 2. Valid expense entry with other_reason
        $expenseResponse = $this->actingAs($this->employee)->post('/expenses', [
            'category_id' => $this->otherCategory->id,
            'amount' => 500,
            'expense_date' => Carbon::today()->toDateString(),
            'description' => 'জরুরি অফিস সরঞ্জাম কেনাকাটা',
            'other_reason' => 'বিদ্যুৎ চলে যাওয়ায় ব্যাকআপ ব্যাটারি ক্রয়',
        ]);
        $expenseResponse->assertSessionHas('success');

        $this->assertDatabaseHas('expenses', [
            'user_id' => $this->employee->id,
            'amount' => 500,
            'status' => 'draft',
            'fund_source' => 'office_advance',
            'other_reason' => 'বিদ্যুৎ চলে যাওয়ায় ব্যাকআপ ব্যাটারি ক্রয়',
        ]);

        // Real-time deduction: 3000 - 500 = 2500
        $summary = $this->employee->getBalanceSummary();
        $this->assertEquals(2500, $summary['remaining_office_funds']);
        $this->assertEquals(500, $summary['total_draft_expenses']);
        $this->assertFalse($summary['is_overspent']);

        // 3. Deleting a draft expense restores the balance immediately
        $expense = Expense::where('user_id', $this->employee->id)->first();
        $deleteResponse = $this->actingAs($this->employee)->delete("/expenses/{$expense->id}");
        $deleteResponse->assertSessionHas('success');

        $summaryAfterDelete = $this->employee->getBalanceSummary();
        $this->assertEquals(3000, $summaryAfterDelete['remaining_office_funds']);
        $this->assertEquals(0, $summaryAfterDelete['total_draft_expenses']);
    }

    /**
     * Test 4: End-to-end daily expense lifecycle:
     * Draft -> Submit Day -> Admin Revision -> Employee Edit & Resubmit -> Admin Approve -> Pay -> Confirm Received.
     */
    public function test_complete_expense_approval_and_payment_lifecycle(): void
    {
        // Disburse 2000
        FundAllocation::create([
            'user_id' => $this->employee->id,
            'amount' => 2000,
            'money_provider' => 'অ্যাকাউন্টস',
            'payment_method' => 'Cash',
            'disbursed_at' => Carbon::now(),
            'is_received_by_employee' => true,
            'received_at' => Carbon::now(),
            'transaction_ref' => 'TXN-TEST-102',
        ]);

        $today = Carbon::today()->toDateString();

        // Employee adds 2 expenses today
        $this->actingAs($this->employee)->post('/expenses', [
            'category_id' => $this->travelCategory->id,
            'amount' => 800,
            'expense_date' => $today,
            'description' => 'উবার ভাড়া',
        ]);

        $this->actingAs($this->employee)->post('/expenses', [
            'category_id' => $this->travelCategory->id,
            'amount' => 400,
            'expense_date' => $today,
            'description' => 'সিএনজি ভাড়া',
        ]);

        $this->assertEquals(2, Expense::where('user_id', $this->employee->id)->where('status', 'draft')->count());

        // 1. Submit Day's Expenses
        $submitDayResponse = $this->actingAs($this->employee)->post('/expenses/submit-day', [
            'expense_date' => $today,
            'user_id' => $this->employee->id,
        ]);
        $submitDayResponse->assertSessionHas('success');

        $this->assertEquals(2, Expense::where('user_id', $this->employee->id)->where('status', 'pending')->count());

        // 2. Admin returns day's expenses for Revision
        $revisionResponse = $this->actingAs($this->admin)->post('/expenses/revision-day', [
            'user_id' => $this->employee->id,
            'expense_date' => $today,
            'revision_notes' => 'অনুগ্রহ করে রাইডের ডিজিটাল ইনভয়েস সংযুক্ত করুন',
        ]);
        $revisionResponse->assertSessionHas('success');

        $this->assertEquals(2, Expense::where('user_id', $this->employee->id)->where('status', 'revision')->count());

        // 3. Employee edits the revision expense and resubmits
        $firstExpense = Expense::where('user_id', $this->employee->id)->first();
        $editResponse = $this->actingAs($this->employee)->post("/expenses/{$firstExpense->id}/update", [
            'category_id' => $this->travelCategory->id,
            'amount' => 800,
            'expense_date' => $today,
            'description' => 'উবার প্রিমিয়াম ভাড়া (ইনভয়েস সংযুক্ত)',
            'resubmit' => true,
        ]);
        $editResponse->assertSessionHas('success');

        $firstExpense->refresh();
        $this->assertEquals('pending', $firstExpense->status);
        $this->assertEquals('উবার প্রিমিয়াম ভাড়া (ইনভয়েস সংযুক্ত)', $firstExpense->description);

        // 4. Admin approves day's expenses
        // First resubmit the remaining item
        Expense::where('user_id', $this->employee->id)->where('status', 'revision')->update(['status' => 'pending']);

        $approveDayResponse = $this->actingAs($this->admin)->post('/expenses/approve-day', [
            'user_id' => $this->employee->id,
            'expense_date' => $today,
        ]);
        $approveDayResponse->assertSessionHas('success');

        $this->assertEquals(2, Expense::where('user_id', $this->employee->id)->where('status', 'approved')->count());

        // 5. Admin pays reimbursement / claim
        $payResponse = $this->actingAs($this->admin)->post("/expenses/{$firstExpense->id}/pay", [
            'payment_method' => 'bKash',
            'payment_ref' => 'TRX-BKASH-789',
        ]);
        $payResponse->assertSessionHas('success');

        $firstExpense->refresh();
        $this->assertEquals('paid', $firstExpense->status);
        $this->assertTrue((bool) $firstExpense->is_paid);

        // 6. Employee confirms receipt
        $confirmExpResponse = $this->actingAs($this->employee)->post("/expenses/{$firstExpense->id}/confirm-received");
        $confirmExpResponse->assertSessionHas('success');

        $firstExpense->refresh();
        $this->assertEquals('received', $firstExpense->status);
        $this->assertTrue((bool) $firstExpense->is_received_by_employee);

        // VERIFY: 'received' and 'paid' expenses are properly counted in approved totals!
        $summary = $this->employee->getBalanceSummary();
        $this->assertEquals(1200, $summary['total_approved_expenses']);
        $this->assertEquals(800, $summary['remaining_office_funds']);
    }

    /**
     * Test 5: Project Management & Strict Isolation between Project Funds and Daily Office Funds.
     */
    public function test_project_management_and_fund_isolation(): void
    {
        // Initial state: Employee has 1,000 daily office advance
        FundAllocation::create([
            'user_id' => $this->employee->id,
            'amount' => 1000,
            'money_provider' => 'অ্যাকাউন্টস',
            'payment_method' => 'Cash',
            'disbursed_at' => Carbon::now(),
            'is_received_by_employee' => true,
            'received_at' => Carbon::now(),
            'transaction_ref' => 'TXN-DAILY-001',
        ]);

        $initialDailyBalance = $this->employee->getBalanceSummary()['remaining_office_funds'];
        $this->assertEquals(1000, $initialDailyBalance);

        // 1. Admin creates a project with budget and assigns employee with 10,000 project fund
        $createProjResponse = $this->actingAs($this->admin)->post('/projects', [
            'name' => 'ঢাকা কনভেনশন এক্সপো ২০২৬',
            'code' => 'EXP-2026',
            'description' => 'আন্তর্জাতিক প্রদর্শনী প্যাভিলিয়ন নির্মাণ',
            'budget' => 50000,
            'start_date' => Carbon::today()->toDateString(),
            'employee_id' => $this->employee->id,
            'allocated_amount' => 10000,
            'payment_method' => 'Bank Transfer',
        ]);
        $createProjResponse->assertSessionHas('success');

        $project = Project::where('code', 'EXP-2026')->first();
        $this->assertNotNull($project);

        $projAllocation = ProjectAllocation::where('project_id', $project->id)->where('user_id', $this->employee->id)->first();
        $this->assertEquals(10000, $projAllocation->allocated_amount);

        // CRITICAL CHECK: Daily Office Fund must REMAIN 1,000 (NOT changed by project allocation)
        $dailySummary1 = $this->employee->getBalanceSummary();
        $this->assertEquals(1000, $dailySummary1['remaining_office_funds']);

        // 2. Employee enters a Project Expense of 6,000
        $projExpResponse = $this->actingAs($this->employee)->post('/expenses', [
            'project_id' => $project->id,
            'category_id' => $this->travelCategory->id,
            'amount' => 6000,
            'expense_date' => Carbon::today()->toDateString(),
            'description' => 'এক্সপো স্টল সামগ্রী পরিবহন',
        ]);
        $projExpResponse->assertSessionHas('success');

        // Project summary must show 10,000 allocated, 6,000 spent, 4,000 remaining
        $projectSummary = $project->getSummaryForUser($this->employee->id);
        $this->assertEquals(10000, $projectSummary['allocated_amount']);
        $this->assertEquals(6000, $projectSummary['total_spent']);
        $this->assertEquals(4000, $projectSummary['remaining_balance']);

        // CRITICAL CHECK: Daily Office Fund must STILL REMAIN 1,000! (Isolated from project expense)
        $dailySummary2 = $this->employee->getBalanceSummary();
        $this->assertEquals(1000, $dailySummary2['remaining_office_funds']);

        // 3. Employee finishes project
        $finishResponse = $this->actingAs($this->employee)->post("/projects/{$project->id}/finish", [
            'notes' => 'স্টল সম্পন্ন হয়েছে, বাকি ৪,০০০ টাকা ফেরতযোগ্য।',
        ]);
        $finishResponse->assertSessionHas('success');

        $settlement = ProjectSettlement::where('project_id', $project->id)->where('user_id', $this->employee->id)->first();
        $this->assertEquals('refund_to_office', $settlement->settlement_type);
        $this->assertEquals(4000, $settlement->balance_amount);

        // 4. Admin approves settlement
        $settleReviewResponse = $this->actingAs($this->admin)->post("/projects/settlements/{$settlement->id}/review", [
            'action' => 'approve',
            'admin_notes' => 'হিসাব যথাযথ হয়েছে, সমাপ্ত।',
        ]);
        $settleReviewResponse->assertSessionHas('success');

        // Project return is recorded with project_id
        $this->assertDatabaseHas('fund_returns', [
            'user_id' => $this->employee->id,
            'project_id' => $project->id,
            'amount' => 4000,
        ]);

        // CRITICAL CHECK: Daily Office Fund must STILL BE 1,000! (Project return did not subtract from daily fund)
        $dailySummaryFinal = $this->employee->getBalanceSummary();
        $this->assertEquals(1000, $dailySummaryFinal['remaining_office_funds']);
    }

    /**
     * Test 6: Fund Return (Recovery) of unused daily cash advance.
     */
    public function test_daily_fund_return(): void
    {
        // Employee has 2,000 advance
        FundAllocation::create([
            'user_id' => $this->employee->id,
            'amount' => 2000,
            'money_provider' => 'অ্যাকাউন্টস',
            'payment_method' => 'Cash',
            'disbursed_at' => Carbon::now(),
            'is_received_by_employee' => true,
            'received_at' => Carbon::now(),
            'transaction_ref' => 'TXN-RET-101',
        ]);

        // Employee spent 1,200 (approved)
        Expense::create([
            'user_id' => $this->employee->id,
            'category_id' => $this->travelCategory->id,
            'amount' => 1200,
            'expense_date' => Carbon::today()->toDateString(),
            'description' => 'ফিল্ড যাতায়াত',
            'status' => 'approved',
            'transaction_ref' => 'EXP-RET-101',
        ]);

        // Balance before return: 2000 - 1200 = 800
        $this->assertEquals(800, $this->employee->getBalanceSummary()['remaining_office_funds']);

        // Accounts manager recovers 800 unused money
        $returnResponse = $this->actingAs($this->accounts)->post('/fund-returns', [
            'user_id' => $this->employee->id,
            'amount' => 800,
            'return_date' => Carbon::today()->toDateString(),
            'received_by' => 'করিম চৌধুরী (অ্যাকাউন্টস)',
            'payment_method' => 'Cash',
            'reason' => 'কাজ শেষে অবশিষ্ট টাকা জমা',
        ]);
        $returnResponse->assertSessionHas('success');

        // Balance after return: 2000 - 1200 - 800 = 0 (হিসাব সমান)
        $summary = $this->employee->getBalanceSummary();
        $this->assertEquals(0, $summary['remaining_office_funds']);
        $this->assertEquals(800, $summary['total_returned']);
        $this->assertFalse($summary['is_overspent']);
    }

    /**
     * Test 7: Category Management (Create, Update, Delete with safety check).
     */
    public function test_category_management(): void
    {
        // 1. Admin creates new category
        $createResponse = $this->actingAs($this->admin)->post('/categories', [
            'name_bn' => 'বিজ্ঞাপন ও প্রমোশন',
            'name' => 'Advertising & PR',
            'icon' => 'Share2',
            'description' => 'সোশ্যাল মিডিয়া ও বিলবোর্ড প্রচার',
        ]);
        $createResponse->assertSessionHas('success');

        $category = Category::where('name_bn', 'বিজ্ঞাপন ও প্রমোশন')->first();
        $this->assertNotNull($category);

        // 2. Admin updates category
        $updateResponse = $this->actingAs($this->admin)->put("/categories/{$category->id}", [
            'name_bn' => 'বিজ্ঞাপন, ব্র্যান্ডিং ও প্রমোশন',
            'name' => 'Advertising & Branding',
            'icon' => 'Sparkles',
        ]);
        $updateResponse->assertSessionHas('success');
        $category->refresh();
        $this->assertEquals('বিজ্ঞাপন, ব্র্যান্ডিং ও প্রমোশন', $category->name_bn);

        // 3. Safety check: Cannot delete category if expenses are linked to it
        Expense::create([
            'user_id' => $this->employee->id,
            'category_id' => $category->id,
            'amount' => 300,
            'expense_date' => Carbon::today()->toDateString(),
            'description' => 'বুস্টিং বিল',
            'status' => 'approved',
            'transaction_ref' => 'EXP-CAT-01',
        ]);

        $blockedDelete = $this->actingAs($this->admin)->delete("/categories/{$category->id}");
        $blockedDelete->assertSessionHas('error');
        $this->assertDatabaseHas('categories', ['id' => $category->id]);

        // Remove expense, then deletion must succeed
        Expense::where('category_id', $category->id)->delete();
        $successDelete = $this->actingAs($this->admin)->delete("/categories/{$category->id}");
        $successDelete->assertSessionHas('success');
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    /**
     * Test 8: Daily Closing calculation and snapshot.
     */
    public function test_daily_closing_generation(): void
    {
        $today = Carbon::today()->toDateString();

        // Disburse 5,000 today
        FundAllocation::create([
            'user_id' => $this->employee->id,
            'amount' => 5000,
            'money_provider' => 'অ্যাকাউন্টস',
            'payment_method' => 'Cash',
            'disbursed_at' => Carbon::today(),
            'is_received_by_employee' => true,
            'received_at' => Carbon::today(),
            'transaction_ref' => 'TXN-CLS-01',
        ]);

        // Approve 2,000 expenses today
        Expense::create([
            'user_id' => $this->employee->id,
            'category_id' => $this->travelCategory->id,
            'amount' => 2000,
            'expense_date' => $today,
            'description' => 'সাইট ভিজিট',
            'status' => 'approved',
            'transaction_ref' => 'EXP-CLS-01',
        ]);

        // Return 500 today
        FundReturn::create([
            'user_id' => $this->employee->id,
            'amount' => 500,
            'return_date' => $today,
            'received_by' => 'করিম চৌধুরী',
            'payment_method' => 'Cash',
            'is_confirmed' => true,
            'transaction_ref' => 'RET-CLS-01',
        ]);

        // Admin generates daily closing
        $response = $this->actingAs($this->admin)->post('/daily-closing', [
            'date' => $today,
            'notes' => 'ক্যাশ ড্রয়ার গুনে হিসাব ক্লোজ করা হলো।',
        ]);
        $response->assertSessionHas('success');

        $closing = DailyClosing::whereDate('date', $today)->first();
        $this->assertNotNull($closing);
        $this->assertEquals(5000, $closing->total_disbursed);
        $this->assertEquals(2000, $closing->total_approved_expenses);
        $this->assertEquals(500, $closing->total_returned);
    }
}
