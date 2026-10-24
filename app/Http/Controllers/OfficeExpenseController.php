<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\DailyClosing;
use App\Models\Expense;
use App\Models\FundAllocation;
use App\Models\FundRequest;
use App\Models\FundReturn;
use App\Models\Project;
use App\Models\ProjectAllocation;
use App\Models\ProjectDocument;
use App\Models\ProjectDocumentRequest;
use App\Models\ProjectSettlement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Mail\EmployeeApprovedMail;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OfficeExpenseController extends Controller
{
    /**
     * Display the primary unified Office Expense & Fund Management dashboard.
     */
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $authUser = Auth::user();
        $isEmployee = ($authUser->role === 'employee');

        if ($isEmployee) {
            // ==========================================
            // STRICT EMPLOYEE DATA ACCESS CONTROL
            // ==========================================
            // An employee can ONLY access their own records.
            $activeUser = $authUser;
            $activeRole = 'employee';

            // Scoped entities strictly belonging to this employee
            $fundRequests = FundRequest::with('user', 'allocation')
                ->where('user_id', $authUser->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $fundAllocations = FundAllocation::with('user', 'fundRequest')
                ->where('user_id', $authUser->id)
                ->orderBy('disbursed_at', 'desc')
                ->get();

            $expenses = Expense::with('user', 'category')
                ->where('user_id', $authUser->id)
                ->orderBy('expense_date', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            $fundReturns = FundReturn::with('user')
                ->where('user_id', $authUser->id)
                ->orderBy('return_date', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            $categories = Category::withCount('expenses')->orderBy('name_bn', 'asc')->get();

            $auditLogs = AuditLog::with('user')
                ->where('user_id', $authUser->id)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Daily closings are managerial only; hidden from employees
            $dailyClosings = collect([]);

            // Only the authenticated employee is sent to the client
            $userSummary = $authUser->getBalanceSummary();
            $authUser->balance_summary = $userSummary;
            $usersWithBalances = collect([$authUser]);

            $activeUserBalance = $userSummary;

            $activeUserPendingAllocations = FundAllocation::where('user_id', $authUser->id)
                ->where('is_received_by_employee', false)
                ->get();

            $projects = Project::with([
                'allocations' => fn ($q) => $q->where('user_id', $authUser->id)->with('user'),
                'expenses' => fn ($q) => $q->where('user_id', $authUser->id)->with('category', 'user'),
                'documentRequests' => fn ($q) => $q->where('user_id', $authUser->id)->with('requester', 'expense'),
                'documents' => fn ($q) => $q->where('user_id', $authUser->id),
                'settlements' => fn ($q) => $q->where('user_id', $authUser->id)->with('approver'),
            ])
            ->whereHas('allocations', fn ($q) => $q->where('user_id', $authUser->id))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) use ($authUser) {
                $p->financial_summary = $p->getSummaryForUser($authUser->id);
                return $p;
            });

            $pendingProjectDocsCount = ProjectDocumentRequest::where('user_id', $authUser->id)
                ->where('status', 'pending')
                ->count();

            // Personal summary metrics only (zero leak of company totals or other employees)
            $officeSummary = [
                'is_employee_view' => true,
                'total_employees_count' => 1,
                'pending_users_count' => 0,
                'total_confirmed_disbursed' => $userSummary['total_received'],
                'total_approved_expenses' => $userSummary['total_approved_expenses'],
                'total_confirmed_returned' => $userSummary['total_returned'],
                'total_remaining_in_employee_hands' => $userSummary['remaining_office_funds'],
                'total_employee_payables' => $userSummary['employee_payable'],
                'total_pending_claims' => $userSummary['pending_claims'],
                'today_disbursed' => 0,
                'today_approved_expenses' => 0,
                'today_returned' => 0,
                'opening_balance' => 0,
                'closing_balance' => 0,
                'pending_fund_requests_count' => $authUser->fundRequests()->where('status', 'pending')->count(),
                'pending_expenses_count' => $authUser->expenses()->where('status', 'pending')->count(),
                'unconfirmed_allocations_count' => $activeUserPendingAllocations->count(),
                'pending_project_docs_count' => $pendingProjectDocsCount,
                'pending_settlements_count' => 0,
                'pending_doc_reviews_count' => 0,
            ];

            // Category breakdown for employee's own approved daily office expenses
            $categoryBreakdown = Category::with(['expenses' => function ($q) use ($authUser) {
                $q->whereNull('project_id')->where('user_id', $authUser->id)->whereIn('status', ['approved', 'paid', 'received']);
            }])->get()->map(function ($c) {
                return [
                    'name' => $c->name_bn,
                    'name_en' => $c->name,
                    'amount' => (float) $c->expenses->sum('amount'),
                    'count' => $c->expenses->count(),
                ];
            })->filter(fn ($c) => $c['amount'] > 0)->values();

            // 7-day trend for this employee only (strictly daily office funds)
            $trendData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i)->toDateString();
                $disbursed = (float) FundAllocation::where('user_id', $authUser->id)
                    ->where('is_received_by_employee', true)
                    ->whereDate('disbursed_at', $date)
                    ->sum('amount');
                $expense = (float) Expense::whereNull('project_id')
                    ->where('user_id', $authUser->id)
                    ->whereIn('status', ['approved', 'paid', 'received'])
                    ->whereDate('expense_date', $date)
                    ->sum('amount');
                $returned = (float) FundReturn::where('user_id', $authUser->id)
                    ->whereNull('project_id')
                    ->where('is_confirmed', true)
                    ->whereDate('return_date', $date)
                    ->sum('amount');

                $trendData[] = [
                    'date' => Carbon::parse($date)->format('d M'),
                    'full_date' => $date,
                    'disbursed' => $disbursed,
                    'expense' => $expense,
                    'returned' => $returned,
                ];
            }
        } else {
            // ==========================================
            // ADMIN / ACCOUNTS MANAGER OVERVIEW
            // ==========================================
            $allUsers = User::orderBy('name', 'asc')->get();
            $employees = $allUsers->where('role', 'employee')->values();
            $approvedEmployees = $employees->where('status', 'approved')->values();

            $selectedUserId = $request->query('user_id', $authUser->id);
            $activeUser = User::find($selectedUserId) ?? $authUser;
            $activeRole = $request->query('role', ($activeUser?->role === 'admin' ? 'admin' : 'employee'));

            // Load all entities with relationships
            $fundRequests = FundRequest::with('user', 'allocation')->orderBy('created_at', 'desc')->get();
            $fundAllocations = FundAllocation::with('user', 'fundRequest')->orderBy('disbursed_at', 'desc')->get();
            $expenses = Expense::with('user', 'category')->orderBy('expense_date', 'desc')->orderBy('id', 'desc')->get();
            $fundReturns = FundReturn::with('user')->orderBy('return_date', 'desc')->orderBy('id', 'desc')->get();
            $categories = Category::withCount('expenses')->orderBy('name_bn', 'asc')->get();
            $auditLogs = AuditLog::with('user')->orderBy('created_at', 'desc')->limit(60)->get();
            $dailyClosings = DailyClosing::orderBy('date', 'desc')->get();

            // Compute balances for every user
            $usersWithBalances = $allUsers->map(function ($u) {
                $summary = $u->getBalanceSummary();
                $u->balance_summary = $summary;
                return $u;
            });

            // Compute Office Summary
            $totalConfirmedDisbursed = (float) FundAllocation::where('is_received_by_employee', true)->sum('amount');
            $totalApprovedExpenses = (float) Expense::whereNull('project_id')->whereIn('status', ['approved', 'paid', 'received'])->sum('amount');
            $totalConfirmedReturned = (float) FundReturn::whereNull('project_id')->where('is_confirmed', true)->sum('amount');

            $today = Carbon::today()->toDateString();
            $todayDisbursed = (float) FundAllocation::where('is_received_by_employee', true)
                ->whereDate('disbursed_at', $today)
                ->sum('amount');
            $todayApprovedExpenses = (float) Expense::whereNull('project_id')
                ->whereIn('status', ['approved', 'paid', 'received'])
                ->whereDate('expense_date', $today)
                ->sum('amount');
            $todayReturned = (float) FundReturn::whereNull('project_id')
                ->where('is_confirmed', true)
                ->whereDate('return_date', $today)
                ->sum('amount');

            $totalRemainingInEmployeeHands = $usersWithBalances->where('role', 'employee')->sum(function ($u) {
                return $u->balance_summary['remaining_office_funds'];
            });

            $totalEmployeePayables = $usersWithBalances->where('role', 'employee')->sum(function ($u) {
                return $u->balance_summary['employee_payable'];
            });

            $totalPendingClaims = (float) Expense::whereNull('project_id')->where('status', 'pending')->sum('amount');

            $pendingFundRequestsCount = FundRequest::where('status', 'pending')->count();
            $pendingExpensesCount = Expense::whereNull('project_id')->where('status', 'pending')->count();
            $pendingUsersCount = User::where('status', 'pending')->count();
            $unconfirmedAllocationsCount = FundAllocation::where('is_received_by_employee', false)->count();

            $latestClosing = DailyClosing::orderBy('date', 'desc')->first();
            $openingBalance = $latestClosing ? (float) $latestClosing->closing_balance : 40000.00;
            $closingBalance = $openingBalance + $todayReturned - $todayDisbursed;

            $projects = Project::with([
                'allocations.user',
                'expenses.category',
                'expenses.user',
                'documentRequests.user',
                'documentRequests.requester',
                'documentRequests.expense',
                'documents.user',
                'settlements.user',
                'settlements.approver',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) {
                $p->financial_summary = $p->getSummaryForUser();
                return $p;
            });

            $pendingSettlementsCount = ProjectSettlement::where('status', 'pending_approval')->count();
            $pendingDocReviewsCount = ProjectDocumentRequest::where('status', 'submitted')->count();

            $officeSummary = [
                'is_employee_view' => false,
                'total_employees_count' => $approvedEmployees->count(),
                'pending_users_count' => $pendingUsersCount,
                'total_confirmed_disbursed' => $totalConfirmedDisbursed,
                'total_approved_expenses' => $totalApprovedExpenses,
                'total_confirmed_returned' => $totalConfirmedReturned,
                'total_remaining_in_employee_hands' => $totalRemainingInEmployeeHands,
                'total_employee_payables' => $totalEmployeePayables,
                'total_pending_claims' => $totalPendingClaims,
                'today_disbursed' => $todayDisbursed,
                'today_approved_expenses' => $todayApprovedExpenses,
                'today_returned' => $todayReturned,
                'opening_balance' => $openingBalance,
                'closing_balance' => $closingBalance,
                'pending_fund_requests_count' => $pendingFundRequestsCount,
                'pending_expenses_count' => $pendingExpensesCount,
                'unconfirmed_allocations_count' => $unconfirmedAllocationsCount,
                'pending_project_docs_count' => 0,
                'pending_settlements_count' => $pendingSettlementsCount,
                'pending_doc_reviews_count' => $pendingDocReviewsCount,
            ];

            $activeUserBalance = $activeUser ? $activeUser->getBalanceSummary() : null;

            $activeUserPendingAllocations = $activeUser ? FundAllocation::where('user_id', $activeUser->id)
                ->where('is_received_by_employee', false)
                ->get() : [];

            $categoryBreakdown = Category::with(['expenses' => function ($q) {
                $q->whereNull('project_id')->whereIn('status', ['approved', 'paid', 'received']);
            }])->get()->map(function ($c) {
                return [
                    'name' => $c->name_bn,
                    'name_en' => $c->name,
                    'amount' => (float) $c->expenses->sum('amount'),
                    'count' => $c->expenses->count(),
                ];
            })->filter(fn ($c) => $c['amount'] > 0)->values();

            $trendData = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i)->toDateString();
                $disbursed = (float) FundAllocation::where('is_received_by_employee', true)
                    ->whereDate('disbursed_at', $date)
                    ->sum('amount');
                $expense = (float) Expense::whereNull('project_id')
                    ->whereIn('status', ['approved', 'paid', 'received'])
                    ->whereDate('expense_date', $date)
                    ->sum('amount');
                $returned = (float) FundReturn::whereNull('project_id')
                    ->where('is_confirmed', true)
                    ->whereDate('return_date', $date)
                    ->sum('amount');

                $trendData[] = [
                    'date' => Carbon::parse($date)->format('d M'),
                    'full_date' => $date,
                    'disbursed' => $disbursed,
                    'expense' => $expense,
                    'returned' => $returned,
                ];
            }
        }

        return Inertia::render('OfficeExpense', [
            'is_employee' => $isEmployee,
            'users' => $usersWithBalances,
            'active_user' => $activeUser ? array_merge($activeUser->toArray(), ['balance_summary' => $activeUserBalance]) : null,
            'active_role' => $activeRole,
            'office_summary' => $officeSummary,
            'projects' => $projects,
            'fund_requests' => $fundRequests,
            'fund_allocations' => $fundAllocations,
            'expenses' => $expenses,
            'fund_returns' => $fundReturns,
            'categories' => $categories,
            'audit_logs' => $auditLogs,
            'daily_closings' => $dailyClosings,
            'active_user_pending_allocations' => $activeUserPendingAllocations,
            'mail_settings' => [
                'sender' => config('mail.from.address', 'rafidul.labar.bd@gmail.com'),
                'is_configured' => !empty(env('MAIL_PASSWORD')) && env('MAIL_PASSWORD') !== 'null',
                'status_text' => (!empty(env('MAIL_PASSWORD')) && env('MAIL_PASSWORD') !== 'null') ? 'সংযুক্ত ও সক্রিয় (Connected)' : 'কনফিগার করা হয়নি',
            ],
            'chart_data' => [
                'category_breakdown' => $categoryBreakdown,
                'trend_data' => $trendData,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store a new Fund Request from an employee.
     */
    public function storeFundRequest(Request $request)
    {
        $authUser = Auth::user();

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'requested_amount' => 'required|numeric|min:1',
            'purpose' => 'required|string|max:255',
            'details' => 'nullable|string|max:2000',
            'needed_date' => 'nullable|date',
            'quotation_doc' => 'nullable|string',
        ]);

        // Security: If the logged-in user is an employee, force their own user ID
        $targetUserId = ($authUser->role === 'employee') ? $authUser->id : ($validated['user_id'] ?? $authUser->id);
        $user = User::findOrFail($targetUserId);
        $balance = $user->getBalanceSummary();

        $fundRequest = FundRequest::create([
            'user_id' => $user->id,
            'requested_amount' => $validated['requested_amount'],
            'purpose' => $validated['purpose'],
            'details' => $validated['details'] ?? null,
            'needed_date' => $validated['needed_date'] ?? Carbon::today(),
            'quotation_doc' => $validated['quotation_doc'] ?? null,
            'previous_remaining' => $balance['remaining_office_funds'],
            'status' => 'pending',
        ]);

        AuditLog::create([
            'transaction_id' => 'REQ-' . date('Ymd') . '-' . str_pad($fundRequest->id, 4, '0', STR_PAD_LEFT),
            'user_id' => $user->id,
            'action_type' => 'fund_request_created',
            'entity_type' => 'FundRequest',
            'entity_id' => $fundRequest->id,
            'amount' => $validated['requested_amount'],
            'balance_before' => $balance['remaining_office_funds'],
            'balance_after' => $balance['remaining_office_funds'],
            'remarks' => "৳{$validated['requested_amount']} ফান্ডের জন্য আবেদন করেছেন: {$validated['purpose']}",
            'actor_name' => $user->name,
        ]);

        return redirect()->back()->with('success', 'ফান্ডের আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে।');
    }

    /**
     * Admin review for a Fund Request (Approve, Partially Approve, Reject).
     */
    public function reviewFundRequest(Request $request, FundRequest $fundRequest)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'ফান্ড রিকোয়েস্ট অনুমোদন বা বাতিল করার অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,partially_approve,reject',
            'approved_amount' => 'nullable|numeric|min:1',
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $actor = $authUser ?? User::where('role', 'admin')->first();

        if ($validated['action'] === 'approve') {
            $fundRequest->status = 'approved';
            $fundRequest->approved_amount = $validated['approved_amount'] ?? $fundRequest->requested_amount;
            $msg = 'ফান্ড রিকোয়েস্ট সফলভাবে সম্পূর্ণ অনুমোদন করা হয়েছে!';
        } elseif ($validated['action'] === 'partially_approve') {
            $fundRequest->status = 'partially_approved';
            $fundRequest->approved_amount = $validated['approved_amount'];
            $fundRequest->rejection_reason = $validated['rejection_reason'] ?? 'আংশিক অনুমোদন করা হয়েছে';
            $msg = 'ফান্ড রিকোয়েস্ট আংশিক অনুমোদন করা হয়েছে!';
        } else {
            $fundRequest->status = 'rejected';
            $fundRequest->rejection_reason = $validated['rejection_reason'] ?? 'প্রয়োজনীয় তথ্যের অভাব বা বাজেট সীমাবদ্ধতা';
            $msg = 'ফান্ড রিকোয়েস্ট বাতিল করা হয়েছে।';
        }

        $fundRequest->save();

        AuditLog::create([
            'transaction_id' => 'REV-' . date('Ymd') . '-' . str_pad($fundRequest->id, 4, '0', STR_PAD_LEFT),
            'user_id' => $fundRequest->user_id,
            'action_type' => 'fund_request_' . $fundRequest->status,
            'entity_type' => 'FundRequest',
            'entity_id' => $fundRequest->id,
            'amount' => $fundRequest->approved_amount ?? $fundRequest->requested_amount,
            'remarks' => "অ্যাডমিন কর্তৃক আবেদন পর্যালোচনা: স্ট্যাটাস - {$fundRequest->status}",
            'actor_name' => $actor ? $actor->name : 'অ্যাডমিন',
        ]);

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Admin disburses fund and assigns Money Provider.
     */
    public function disburseFund(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'ফান্ড বরাদ্দ ও বিতরণ করার অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'fund_request_id' => 'nullable|exists:fund_requests,id',
            'user_id' => 'required|exists:users,id',
            'allocation_type' => 'nullable|string|in:office,project',
            'project_id' => 'nullable|required_if:allocation_type,project|exists:projects,id',
            'amount' => 'required|numeric|min:1',
            'money_provider' => 'required|string|max:255',
            'payment_method' => 'required|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'instant_confirm' => 'nullable|boolean',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $allocationType = $validated['allocation_type'] ?? 'office';

        // 1. Specific Project Allocation (100% Isolated from Office Expense)
        if ($allocationType === 'project' && !empty($validated['project_id'])) {
            $project = Project::findOrFail($validated['project_id']);
            $txnRef = 'PRJ-ALC-' . strtoupper(bin2hex(random_bytes(3)));

            $existingAllocation = ProjectAllocation::where('project_id', $project->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingAllocation) {
                $existingAllocation->allocated_amount += $validated['amount'];
                if (!empty($validated['notes'])) {
                    $existingAllocation->notes = ($existingAllocation->notes ? $existingAllocation->notes . " | " : "") . $validated['notes'];
                }
                $existingAllocation->payment_method = $validated['payment_method'];
                $existingAllocation->save();
                $allocation = $existingAllocation;
            } else {
                $allocation = ProjectAllocation::create([
                    'project_id' => $project->id,
                    'user_id' => $user->id,
                    'allocated_amount' => $validated['amount'],
                    'payment_method' => $validated['payment_method'],
                    'notes' => $validated['notes'] ?? 'প্রজেক্ট বরাদ্দ',
                    'status' => 'active',
                    'allocated_by' => $authUser->id,
                    'transaction_ref' => $txnRef,
                ]);
            }

            if (!empty($validated['fund_request_id'])) {
                $req = FundRequest::find($validated['fund_request_id']);
                if ($req) {
                    $req->status = 'paid';
                    $req->save();
                }
            }

            AuditLog::create([
                'transaction_id' => $txnRef,
                'user_id' => $user->id,
                'action_type' => 'project_fund_allocated',
                'entity_type' => 'ProjectAllocation',
                'entity_id' => $allocation->id,
                'amount' => $validated['amount'],
                'remarks' => "প্রজেক্ট [{$project->name}] এর জন্য {$user->name} কে ৳{$validated['amount']} বরাদ্দ করা হয়েছে ({$validated['payment_method']})",
                'actor_name' => $authUser->name,
            ]);

            return redirect()->back()->with('success', "প্রজেক্ট '{$project->name}'-এর জন্য {$user->name}-কে ৳{$validated['amount']} সফলভাবে বরাদ্দ করা হয়েছে!");
        }

        // 2. Daily Office Expense Allocation
        $txnRef = 'TXN-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

        $allocation = FundAllocation::create([
            'fund_request_id' => $validated['fund_request_id'] ?? null,
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'money_provider' => $validated['money_provider'],
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
            'disbursed_at' => Carbon::now(),
            'is_received_by_employee' => !empty($validated['instant_confirm']),
            'received_at' => !empty($validated['instant_confirm']) ? Carbon::now() : null,
            'transaction_ref' => $txnRef,
        ]);

        if (!empty($validated['fund_request_id'])) {
            $req = FundRequest::find($validated['fund_request_id']);
            if ($req) {
                $req->status = 'paid';
                $req->save();
            }
        }

        AuditLog::create([
            'transaction_id' => $txnRef,
            'user_id' => $user->id,
            'action_type' => 'fund_disbursed',
            'entity_type' => 'FundAllocation',
            'entity_id' => $allocation->id,
            'amount' => $validated['amount'],
            'remarks' => "অফিসের দৈনিক খরচের জন্য টাকা প্রদান করেছেন {$validated['money_provider']} ({$validated['payment_method']}) প্রাপক: {$user->name}",
            'actor_name' => $validated['money_provider'],
        ]);

        return redirect()->back()->with('success', "অফিসের দৈনন্দিন খরচের ফান্ডে {$user->name}-এর জন্য ৳{$validated['amount']} সফলভাবে বরাদ্দ করা হয়েছে!");
    }

    /**
     * Employee confirms fund receipt.
     */
    public function confirmFundReceipt(Request $request, FundAllocation $fundAllocation)
    {
        $authUser = Auth::user();

        // Security: An employee can ONLY confirm their own allocation
        if ($authUser->role === 'employee' && $fundAllocation->user_id !== $authUser->id) {
            abort(403, 'অন্য কর্মচারীর ফান্ড প্রাপ্তি নিশ্চিত করার অনুমতি নেই।');
        }

        $fundAllocation->is_received_by_employee = true;
        $fundAllocation->received_at = Carbon::now();
        $fundAllocation->save();

        $user = $fundAllocation->user;
        $balance = $user ? $user->getBalanceSummary() : null;

        AuditLog::create([
            'transaction_id' => $fundAllocation->transaction_ref . '-CONF',
            'user_id' => $fundAllocation->user_id,
            'action_type' => 'fund_receipt_confirmed',
            'entity_type' => 'FundAllocation',
            'entity_id' => $fundAllocation->id,
            'amount' => $fundAllocation->amount,
            'balance_after' => $balance ? $balance['remaining_office_funds'] : 0,
            'remarks' => "কর্মচারী {$user?->name} টাকা প্রাপ্তি নিশ্চিত করেছেন",
            'actor_name' => $user?->name,
        ]);

        return redirect()->back()->with('success', 'টাকা প্রাপ্তি সফলভাবে নিশ্চিত করা হয়েছে! আপনার অফিস ব্যালেন্স আপডেট হয়েছে।');
    }

    /**
     * Store a Daily Expense entry by Employee.
     */
    public function storeExpense(Request $request)
    {
        $authUser = Auth::user();

        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
            'expense_date' => 'required|date',
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|max:1000',
            'fund_source' => 'nullable|string|in:office_advance,own_pocket,auto',
            'receipt_image' => 'nullable|string',
            'is_draft' => 'nullable|boolean',
        ]);

        // Security: If the logged-in user is an employee, force their own user ID
        $targetUserId = ($authUser->role === 'employee') ? $authUser->id : ($validated['user_id'] ?? $authUser->id);
        $user = User::findOrFail($targetUserId);
        $category = Category::findOrFail($validated['category_id']);
        $txnRef = 'EXP-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

        // Special Rule: অন্যান্য খরচ (Other Expense) requires mandatory specific reason
        $isOtherCategory = (
            str_contains(mb_strtolower($category->name_bn), 'অন্যান্য') || 
            str_contains(strtolower($category->name), 'other') || 
            str_contains(strtolower($category->name), 'miscellaneous')
        );

        $otherReason = null;
        if ($isOtherCategory) {
            $otherValidated = $request->validate([
                'other_reason' => 'required|string|min:3|max:1000',
            ], [
                'other_reason.required' => 'খরচের ধরন হিসেবে "অন্যান্য খরচ" নির্বাচন করলে খরচের সুনির্দিষ্ট কারণ বা উদ্দেশ্য উল্লেখ করা বাধ্যতামূলক।',
                'other_reason.min' => 'অন্যান্য খরচের কারণ কমপক্ষে ৩ অক্ষরের হতে হবে।',
            ]);
            $otherReason = trim($otherValidated['other_reason']);
        } else {
            $otherReason = $request->input('other_reason') ? trim($request->input('other_reason')) : null;
        }

        $project = null;
        $projectAllocation = null;

        // Strict Project Isolation Check
        if (!empty($validated['project_id'])) {
            $project = Project::findOrFail($validated['project_id']);
            if ($project->status === 'completed') {
                return redirect()->back()->with('error', 'এই প্রজেক্টটির কাজ ইতিমধ্যে সম্পন্ন হয়েছে। নতুন খরচ যোগ করা যাবে না।');
            }

            $projectAllocation = ProjectAllocation::where('project_id', $project->id)
                ->where('user_id', $user->id)
                ->first();

            if (!$projectAllocation) {
                return redirect()->back()->with('error', "কর্মচারী {$user->name} এই প্রজেক্টের সাথে যুক্ত নন। অন্য প্রজেক্টের টাকা থেকে খরচ সমন্বয় করা যাবে না।");
            }
        }

        // Fund Source and Split Calculation (অফিস ফান্ড বনাম নিজের পকেটের টাকা)
        $amount = (float) $validated['amount'];
        $userBalance = $user->getBalanceSummary();
        $remainingOffice = (float) ($userBalance['remaining_office_funds'] ?? 0);
        $reqFundSource = $validated['fund_source'] ?? 'auto';

        if ($reqFundSource === 'own_pocket') {
            $ownPocketAmount = $amount;
            $officeFundAmount = 0.00;
            $finalFundSource = 'own_pocket';
        } elseif ($reqFundSource === 'office_advance') {
            if ($remainingOffice >= $amount) {
                $officeFundAmount = $amount;
                $ownPocketAmount = 0.00;
                $finalFundSource = 'office_advance';
            } else {
                $officeFundAmount = max(0, $remainingOffice);
                $ownPocketAmount = $amount - $officeFundAmount;
                $finalFundSource = ($officeFundAmount > 0) ? 'split' : 'own_pocket';
            }
        } else { // auto
            if ($remainingOffice >= $amount) {
                $officeFundAmount = $amount;
                $ownPocketAmount = 0.00;
                $finalFundSource = 'office_advance';
            } else {
                $officeFundAmount = max(0, $remainingOffice);
                $ownPocketAmount = $amount - $officeFundAmount;
                $finalFundSource = ($officeFundAmount > 0) ? 'split' : 'own_pocket';
            }
        }

        $isDraft = ($authUser->role === 'employee') ? true : (array_key_exists('is_draft', $validated) ? (bool)$validated['is_draft'] : false);
        $status = $isDraft ? 'draft' : 'pending';
        $isSubmitted = !$isDraft;
        $submittedAt = $isSubmitted ? Carbon::now() : null;

        $expense = Expense::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'project_id' => $project?->id,
            'project_allocation_id' => $projectAllocation?->id,
            'expense_date' => $validated['expense_date'],
            'amount' => $amount,
            'fund_source' => $finalFundSource,
            'office_fund_amount' => $officeFundAmount,
            'own_pocket_amount' => $ownPocketAmount,
            'category_name' => $category->name_bn,
            'description' => $validated['description'],
            'other_reason' => $otherReason,
            'receipt_image' => $validated['receipt_image'] ?? null,
            'status' => $status,
            'is_submitted' => $isSubmitted,
            'submitted_at' => $submittedAt,
            'transaction_ref' => $txnRef,
        ]);

        $projectLabel = $project ? " [প্রজেক্ট: {$project->name}]" : "";
        $otherLabel = $otherReason ? " (অন্যান্য কারণ: {$otherReason})" : "";

        AuditLog::create([
            'transaction_id' => $txnRef,
            'user_id' => $user->id,
            'action_type' => $isDraft ? 'expense_draft_saved' : 'expense_submitted',
            'entity_type' => 'Expense',
            'entity_id' => $expense->id,
            'amount' => $amount,
            'remarks' => "নতুন খরচের এন্ট্রি{$projectLabel}: {$category->name_bn}{$otherLabel} (৳{$amount}) - {$validated['description']} [উৎস: {$finalFundSource}]",
            'actor_name' => $user->name,
        ]);

        $fundTarget = $project ? "{$project->name} প্রজেক্ট ফান্ড" : "দৈনিক অফিস ফান্ড";
        $successMsg = $isDraft 
            ? "খরচ সফলভাবে যুক্ত হয়েছে এবং {$fundTarget} থেকে তাৎক্ষণিকভাবে বাদ দেওয়া হয়েছে। দিনের শেষে সম্পূর্ণ দৈনিক রিপোর্ট চূড়ান্ত সাবমিট করুন।" 
            : "খরচ সফলভাবে সংরক্ষিত ও জমা দেওয়া হয়েছে।";
        return redirect()->back()->with('success', $successMsg);
    }

    /**
     * Submit Day's Expenses (বিল জমা দিন) by Employee for a specific date.
     */
    public function submitDayExpenses(Request $request)
    {
        $authUser = Auth::user();
        $validated = $request->validate([
            'expense_date' => 'required|date',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $targetUserId = ($authUser->role === 'employee') ? $authUser->id : ($validated['user_id'] ?? $authUser->id);
        
        $updated = Expense::where('user_id', $targetUserId)
            ->whereDate('expense_date', $validated['expense_date'])
            ->whereIn('status', ['draft', 'revision'])
            ->update([
                'is_submitted' => true,
                'status' => 'pending',
                'submitted_at' => Carbon::now(),
            ]);

        $dateFormatted = Carbon::parse($validated['expense_date'])->format('d M, Y');
        return redirect()->back()->with('success', "{$dateFormatted} তারিখের সম্পূর্ণ বিল ({$updated}টি আইটেম) সফলভাবে অ্যাডমিনের কাছে জমা দেওয়া হয়েছে!");
    }

    /**
     * Approve entire Day's Expenses for an Employee by Admin.
     */
    public function approveDayExpenses(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'খরচ অনুমোদন করার অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'user_id' => 'required|exists:users,id',
        ]);

        $employee = User::findOrFail($validated['user_id']);
        $actorName = $authUser ? $authUser->name : 'অ্যাডমিন';

        $updated = Expense::where('user_id', $employee->id)
            ->whereDate('expense_date', $validated['expense_date'])
            ->where('status', 'pending')
            ->update([
                'status' => 'approved',
                'verified_by' => $actorName,
                'verified_at' => Carbon::now(),
                'rejection_reason' => null,
                'revision_notes' => null,
            ]);

        $dateFormatted = Carbon::parse($validated['expense_date'])->format('d M, Y');
        return redirect()->back()->with('success', "{$employee->name}-এর {$dateFormatted} তারিখের সম্পূর্ণ বিল ({$updated}টি খরচ) সফলভাবে অনুমোদন করা হয়েছে!");
    }

    /**
     * Send entire Day's Expenses back for Revision to Employee by Admin.
     */
    public function revisionDayExpenses(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'সংশোধনে ফেরত পাঠানোর অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'user_id' => 'required|exists:users,id',
            'revision_notes' => 'required|string|min:3|max:1000',
        ]);

        $employee = User::findOrFail($validated['user_id']);
        $actorName = $authUser ? $authUser->name : 'অ্যাডমিন';

        $updated = Expense::where('user_id', $employee->id)
            ->whereDate('expense_date', $validated['expense_date'])
            ->whereIn('status', ['pending', 'approved'])
            ->update([
                'status' => 'revision',
                'returned_by' => $actorName,
                'returned_at' => Carbon::now(),
                'revision_notes' => $validated['revision_notes'],
            ]);

        $dateFormatted = Carbon::parse($validated['expense_date'])->format('d M, Y');
        return redirect()->back()->with('success', "{$employee->name}-এর {$dateFormatted} তারিখের সম্পূর্ণ বিল ({$updated}টি খরচ) সংশোধনের জন্য ফেরত পাঠানো হয়েছে।");
    }

    /**
     * Submit single Expense to Admin.
     */
    public function submitExpense(Request $request, Expense $expense)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee' && $expense->user_id !== $authUser->id) {
            abort(403);
        }

        $expense->is_submitted = true;
        $expense->status = 'pending';
        $expense->submitted_at = Carbon::now();
        $expense->save();

        return redirect()->back()->with('success', 'বিলটি অনুমোদনের জন্য অ্যাডমিনের কাছে জমা দেওয়া হয়েছে!');
    }

    /**
     * Update an Expense (for Drafts and Revisions).
     */
    public function updateExpense(Request $request, Expense $expense)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            if ($expense->user_id !== $authUser->id) {
                abort(403, 'অন্য কর্মচারীর খরচ সংশোধন করার অনুমতি নেই।');
            }
            if (!in_array($expense->status, ['draft', 'revision'])) {
                return redirect()->back()->with('error', 'অনুমোদনের জন্য জমা দেওয়া বা অনুমোদিত খরচ সরাসরি পরিবর্তন করা সম্ভব নয়।');
            }
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:1',
            'expense_date' => 'required|date',
            'description' => 'required|string|max:1000',
            'other_reason' => 'nullable|string|max:1000',
            'receipt_image' => 'nullable|string',
            'resubmit' => 'nullable|boolean',
        ]);

        $category = Category::findOrFail($validated['category_id']);
        
        $isOtherCategory = (
            str_contains(mb_strtolower($category->name_bn), 'অন্যান্য') || 
            str_contains(strtolower($category->name), 'other') || 
            str_contains(strtolower($category->name), 'miscellaneous')
        );

        $otherReason = null;
        if ($isOtherCategory) {
            $otherValidated = $request->validate([
                'other_reason' => 'required|string|min:3|max:1000',
            ], [
                'other_reason.required' => 'অন্যান্য খরচের জন্য সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।',
            ]);
            $otherReason = trim($otherValidated['other_reason']);
        } else {
            $otherReason = $request->input('other_reason') ? trim($request->input('other_reason')) : null;
        }

        // Recalculate fund allocation portions
        $user = $expense->user;
        $remainingOffice = $user ? $user->getBalanceSummary()['remaining_office_funds'] : 0.00;
        $newAmount = (float)$validated['amount'];

        if ($expense->fund_source === 'own_pocket') {
            $officeFundAmount = 0.00;
            $ownPocketAmount = $newAmount;
            $finalFundSource = 'own_pocket';
        } elseif ($expense->fund_source === 'office_advance') {
            $officeFundAmount = $newAmount;
            $ownPocketAmount = 0.00;
            $finalFundSource = 'office_advance';
        } else {
            if ($remainingOffice >= $newAmount) {
                $officeFundAmount = $newAmount;
                $ownPocketAmount = 0.00;
                $finalFundSource = 'office_advance';
            } else {
                $officeFundAmount = max(0, $remainingOffice);
                $ownPocketAmount = $newAmount - $officeFundAmount;
                $finalFundSource = ($officeFundAmount > 0) ? 'split' : 'own_pocket';
            }
        }

        $expense->category_id = $category->id;
        $expense->category_name = $category->name_bn;
        $expense->amount = $newAmount;
        $expense->fund_source = $finalFundSource;
        $expense->office_fund_amount = $officeFundAmount;
        $expense->own_pocket_amount = $ownPocketAmount;
        $expense->expense_date = $validated['expense_date'];
        $expense->description = $validated['description'];
        $expense->other_reason = $otherReason;
        if (!empty($validated['receipt_image'])) {
            $expense->receipt_image = $validated['receipt_image'];
        }

        // Only resubmit to pending if explicitly requested (e.g. for revision items)
        if (!empty($validated['resubmit']) && $expense->status === 'revision') {
            $expense->status = 'pending';
            $expense->is_submitted = true;
            $expense->submitted_at = Carbon::now();
            $expense->revision_notes = null;
        }

        $expense->save();

        AuditLog::create([
            'transaction_id' => $expense->transaction_ref ?: ('EXP-EDIT-' . time()),
            'user_id' => $authUser->id,
            'action_type' => 'expense_updated',
            'entity_type' => 'Expense',
            'entity_id' => $expense->id,
            'amount' => $newAmount,
            'remarks' => "খরচ সংশোধন করা হয়েছে: {$category->name_bn} (৳{$newAmount}) - {$validated['description']}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', 'খরচের তথ্য সফলভাবে সংশোধন করা হয়েছে!');
    }

    /**
     * Delete an unsubmitted/draft Expense.
     */
    public function destroyExpense(Request $request, Expense $expense)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            if ($expense->user_id !== $authUser->id) {
                abort(403, 'অন্য কর্মচারীর খরচ ডিলিট করার অনুমতি নেই।');
            }
            if (!in_array($expense->status, ['draft', 'revision'])) {
                return redirect()->back()->with('error', 'চূড়ান্ত সাবমিট করা বিল ডিলিট করা সম্ভব নয়। এটি অ্যাডমিনের অনুমোদনের অপেক্ষায় বা অনুমোদিত রয়েছে।');
            }
        }

        $expDetails = "{$expense->category_name} (৳{$expense->amount}) - {$expense->description}";
        $txnRef = $expense->transaction_ref;
        $amount = $expense->amount;
        $id = $expense->id;

        $expense->delete();

        AuditLog::create([
            'transaction_id' => $txnRef ?: ('EXP-DEL-' . time()),
            'user_id' => $authUser->id,
            'action_type' => 'expense_deleted',
            'entity_type' => 'Expense',
            'entity_id' => $id,
            'amount' => $amount,
            'remarks' => "খরচ তালিকা থেকে ডিলিট করা হয়েছে: {$expDetails}",
            'actor_name' => $authUser->name,
        ]);

        $fundType = $expense->project_id ? 'প্রজেক্ট' : 'অফিস';
        return redirect()->back()->with('success', "খরচটি সফলভাবে ডিলিট করা হয়েছে এবং ৳{$amount} সংশ্লিষ্ট {$fundType} ফান্ডের ব্যালেন্সে স্বয়ংক্রিয়ভাবে ফেরত যোগ হয়েছে।");
    }

    /**
     * Admin verifies Expense (Approve / Reject / Revision).
     */
    public function verifyExpense(Request $request, Expense $expense)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'খরচ যাচাই ও অনুমোদন করার অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject,revision',
            'rejection_reason' => 'nullable|string|max:1000',
            'revision_notes' => 'nullable|string|max:1000',
        ]);

        $actor = $authUser ?? User::where('role', 'admin')->first();
        $actorName = $actor ? $actor->name : 'তাহমিদ জামান (অ্যাডমিন)';

        if ($validated['action'] === 'approve') {
            $expense->status = 'approved';
            $expense->verified_by = $actorName;
            $expense->verified_at = Carbon::now();
            $expense->rejection_reason = null;
            $expense->revision_notes = null;
            $msg = 'বিল সফলভাবে যাচাই ও অনুমোদন করা হয়েছে!';
        } elseif ($validated['action'] === 'revision') {
            $expense->status = 'revision';
            $expense->returned_by = $actorName;
            $expense->returned_at = Carbon::now();
            $expense->revision_notes = $validated['revision_notes'] ?? 'অনুগ্রহ করে ভাউচার বা বিবরণ সংশোধন করে পুনরায় জমা দিন।';
            $msg = 'বিলটি সংশোধনের জন্য এমপ্লয়ির কাছে ফেরত পাঠানো হয়েছে।';
        } else {
            $expense->status = 'rejected';
            $expense->verified_by = $actorName;
            $expense->verified_at = Carbon::now();
            $expense->rejection_reason = $validated['rejection_reason'] ?? 'যথাযথ ভাউচার বা বিল সংযুক্ত করা হয়নি';
            $msg = 'বিলটি বাতিল করা হয়েছে।';
        }

        $expense->save();

        AuditLog::create([
            'transaction_id' => $expense->transaction_ref . '-' . strtoupper($expense->status),
            'user_id' => $expense->user_id,
            'action_type' => 'expense_' . $expense->status,
            'entity_type' => 'Expense',
            'entity_id' => $expense->id,
            'amount' => $expense->amount,
            'remarks' => "বিল যাচাইকরণ: {$expense->status} ({$actorName})",
            'actor_name' => $actorName,
        ]);

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Admin pays approved expense claim to employee.
     */
    public function payExpense(Request $request, Expense $expense)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'বিল পরিশোধ করার অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|max:100',
            'payment_ref' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $actor = $authUser ?? User::where('role', 'admin')->first();
        $actorName = $actor ? $actor->name : 'তাহমিদ জামান (অ্যাডমিন)';

        $expense->is_paid = true;
        $expense->paid_at = Carbon::now();
        $expense->paid_by = $actorName;
        $expense->payment_method = $validated['payment_method'];
        $expense->payment_ref = $validated['payment_ref'] ?? null;
        $expense->status = 'paid';
        $expense->save();

        AuditLog::create([
            'transaction_id' => $expense->transaction_ref . '-PAID',
            'user_id' => $expense->user_id,
            'action_type' => 'expense_paid',
            'entity_type' => 'Expense',
            'entity_id' => $expense->id,
            'amount' => $expense->amount,
            'remarks' => "অ্যাডমিন {$actorName} কর্তৃক বিলের টাকা পরিশোধ: {$validated['payment_method']} (টাকা: ৳{$expense->amount})",
            'actor_name' => $actorName,
        ]);

        return redirect()->back()->with('success', 'বিলের টাকা সফলভাবে পরিশোধ করা হয়েছে! কর্মচারী এখন প্রাপ্তি স্বীকার (Confirm Received) করতে পারবে।');
    }

    /**
     * Employee confirms receipt of reimbursed money.
     */
    public function confirmExpenseReceived(Request $request, Expense $expense)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee' && $expense->user_id !== $authUser->id) {
            abort(403, 'অন্য কর্মচারীর বিল প্রাপ্তি নিশ্চিত করার অনুমতি নেই।');
        }

        $expense->is_received_by_employee = true;
        $expense->received_at = Carbon::now();
        $expense->status = 'received';
        $expense->save();

        $user = $expense->user;

        AuditLog::create([
            'transaction_id' => $expense->transaction_ref . '-RECV',
            'user_id' => $expense->user_id,
            'action_type' => 'expense_received_by_employee',
            'entity_type' => 'Expense',
            'entity_id' => $expense->id,
            'amount' => $expense->amount,
            'remarks' => "কর্মচারী {$user?->name} বিলের টাকা বুঝে পেয়েছেন (Confirm Received)",
            'actor_name' => $user?->name,
        ]);

        return redirect()->back()->with('success', 'টাকা বুঝে পাওয়ার প্রাপ্তি স্বীকার সফলভাবে সম্পন্ন হয়েছে!');
    }

    /**
     * Store Fund Return / Recovery (Unused cash return).
     */
    public function storeFundReturn(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'অব্যবহৃত টাকা ফেরত এন্ট্রি করার অনুমতি আপনার নেই। অ্যাডমিন বা অ্যাকাউন্টস ম্যানেজারের কাছে টাকা ফেরত জমা দিন।');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1',
            'return_date' => 'required|date',
            'received_by' => 'required|string|max:255',
            'payment_method' => 'required|string|max:100',
            'reason' => 'nullable|string|max:1000',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $txnRef = 'RET-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

        $fundReturn = FundReturn::create([
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'return_date' => $validated['return_date'],
            'received_by' => $validated['received_by'],
            'payment_method' => $validated['payment_method'],
            'reason' => $validated['reason'] ?? 'অব্যবহৃত টাকা অফিসে ফেরত',
            'is_confirmed' => true,
            'confirmed_at' => Carbon::now(),
            'transaction_ref' => $txnRef,
        ]);

        $newBalance = $user->getBalanceSummary();

        AuditLog::create([
            'transaction_id' => $txnRef,
            'user_id' => $user->id,
            'action_type' => 'fund_recovered',
            'entity_type' => 'FundReturn',
            'entity_id' => $fundReturn->id,
            'amount' => $validated['amount'],
            'balance_after' => $newBalance['remaining_office_funds'],
            'remarks' => "অব্যবহৃত টাকা অফিসে ফেরত নেওয়া হয়েছে। গ্রহণকারী: {$validated['received_by']}",
            'actor_name' => $validated['received_by'],
        ]);

        return redirect()->back()->with('success', 'টাকা ফেরত সফলভাবে রেকর্ড হয়েছে এবং কর্মচারীর ব্যালেন্স আপডেট হয়েছে!');
    }

    /**
     * Generate Daily Closing snapshot and report.
     */
    public function generateDailyClosing(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'ডেইলি ক্লোজিং তৈরি করার অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $date = $validated['date'];

        // Compute day's figures
        $todayDisbursed = (float) FundAllocation::where('is_received_by_employee', true)
            ->whereDate('disbursed_at', $date)
            ->sum('amount');
        $todayApprovedExpenses = (float) Expense::whereNull('project_id')
            ->whereIn('status', ['approved', 'paid', 'received'])
            ->whereDate('expense_date', $date)
            ->sum('amount');
        $todayReturned = (float) FundReturn::whereNull('project_id')
            ->where('is_confirmed', true)
            ->whereDate('return_date', $date)
            ->sum('amount');

        // Total remaining in employees' hands as of today
        $employees = User::where('role', 'employee')->where('status', 'approved')->get();
        $totalRemaining = $employees->sum(fn ($u) => $u->getBalanceSummary()['remaining_office_funds']);
        $totalPayable = $employees->sum(fn ($u) => $u->getBalanceSummary()['employee_payable']);
        $totalPendingClaims = (float) Expense::whereNull('project_id')->where('status', 'pending')->whereDate('expense_date', $date)->sum('amount');

        // Previous closing as opening balance
        $prevClosing = DailyClosing::where('date', '<', $date)->orderBy('date', 'desc')->first();
        $opening = $prevClosing ? (float) $prevClosing->closing_balance : 40000.00;
        $closing = $opening + $todayReturned - $todayDisbursed;

        $dailyClosing = DailyClosing::updateOrCreate(
            ['date' => $date],
            [
                'opening_balance' => $opening,
                'total_disbursed' => $todayDisbursed,
                'total_approved_expenses' => $todayApprovedExpenses,
                'total_returned' => $todayReturned,
                'closing_balance' => $closing,
                'total_employee_remaining' => $totalRemaining,
                'total_employee_payable' => $totalPayable,
                'total_pending_claims' => $totalPendingClaims,
                'active_employees_count' => $employees->count(),
                'generated_by' => $authUser->name . ' (অ্যাডমিন)',
                'notes' => $validated['notes'] ?? 'দৈনিক ক্লোজিং হিসাব প্রস্তুত ও অনুমোদিত।',
            ]
        );

        AuditLog::create([
            'transaction_id' => 'CLS-' . str_replace('-', '', $date),
            'action_type' => 'daily_closing_generated',
            'amount' => $closing,
            'remarks' => "{$date} তারিখের অফিস ডেইলি ক্লোজিং সম্পন্ন হয়েছে। ক্লোজিং ব্যালেন্স: ৳{$closing}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', "{$date} তারিখের ডেইলি রিপোর্ট ও ক্লোজিং হিসাব সফলভাবে সম্পন্ন হয়েছে!");
    }

    /**
     * Admin approves a registered employee account.
     */
    public function approveUser(Request $request, User $user)
    {
        $authUser = Auth::user();
        if ($authUser->role !== 'admin') {
            abort(403, 'কর্মচারী অ্যাকাউন্ট অনুমোদন করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $generatedPassword = null;
        if (empty($user->password)) {
            $generatedPassword = 'NexGen@' . rand(1000, 9999);
            $user->password = Hash::make($generatedPassword);
        }
        $user->status = 'approved';
        $user->save();

        $passForMail = $generatedPassword ?? 'আপনার রেজিস্ট্রেশনের সময় ব্যবহৃত নিজস্ব পাসওয়ার্ড';

        // Dispatch Email from rafidul.labar.bd@gmail.com
        $emailDispatched = false;
        try {
            Mail::to($user->email)->send(new EmployeeApprovedMail($user, $passForMail));
            $emailDispatched = true;
        } catch (\Exception $e) {
            \Log::error('Mail dispatch error: ' . $e->getMessage());
        }

        AuditLog::create([
            'transaction_id' => 'USR-APP-' . $user->id,
            'user_id' => $user->id,
            'action_type' => 'user_approved',
            'remarks' => "কর্মচারী {$user->name} অনুমোদন করা হয়েছে (প্রেরক: rafidul.labar.bd@gmail.com)",
            'actor_name' => $authUser->name,
        ]);

        $statusMsg = $emailDispatched 
            ? "এবং rafidul.labar.bd@gmail.com থেকে {$user->email} ঠিকানায় ইমেইল পাঠানো হয়েছে।" 
            : "এবং অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে।";

        $passMsg = $generatedPassword 
            ? " তৈরি করা পাসওয়ার্ড: '{$generatedPassword}'." 
            : " ব্যবহারকারী তার নিজস্ব রেজিস্ট্রেশন পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।";

        return redirect()->back()->with('success', "কর্মচারী {$user->name} এর অ্যাকাউন্ট সফলভাবে অনুমোদন করা হয়েছে!{$passMsg} {$statusMsg}");
    }

    /**
     * Admin rejects a registered employee account.
     */
    public function rejectUser(Request $request, User $user)
    {
        $authUser = Auth::user();
        if ($authUser->role !== 'admin') {
            abort(403, 'কর্মচারী অ্যাকাউন্ট বাতিল করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $user->status = 'rejected';
        $user->save();

        AuditLog::create([
            'transaction_id' => 'USR-REJ-' . $user->id,
            'user_id' => $user->id,
            'action_type' => 'user_rejected',
            'remarks' => "কর্মচারী {$user->name} এর আবেদন বাতিল করা হয়েছে",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('error', "কর্মচারী {$user->name} এর আবেদন বাতিল করা হয়েছে।");
    }

    /**
     * Admin registers or adds a new employee.
     */
    public function storeUser(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role !== 'admin') {
            abort(403, 'নতুন অ্যাকাউন্ট তৈরি করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:100',
            'designation' => 'nullable|string|max:100',
            'role' => 'required|in:admin,employee,accounts_manager',
            'employee_id' => 'nullable|string|unique:users,employee_id',
        ]);

        $user = User::create([
            'employee_id' => $validated['employee_id'] ?? ('EMP-' . (User::count() + 101)),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'department' => $validated['department'] ?? 'General',
            'designation' => $validated['designation'] ?? 'Staff',
            'role' => $validated['role'],
            'status' => 'approved',
            'password' => Hash::make('password123'),
        ]);

        return redirect()->back()->with('success', "নতুন অ্যাকাউন্ট ({$user->name}) সফলভাবে তৈরি হয়েছে!");
    }

    /**
     * Update mail settings (Gmail App Password).
     */
    public function updateMailSettings(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role !== 'admin') {
            abort(403, 'ইমেইল সেটিংস পরিবর্তনের অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'mail_password' => 'required|string',
        ]);

        $envPath = base_path('.env');
        if (file_exists($envPath)) {
            $envContent = file_get_contents($envPath);
            $cleanPassword = str_replace(' ', '', trim($validated['mail_password']));
            $envContent = preg_replace('/MAIL_PASSWORD=.*/', 'MAIL_PASSWORD="' . $cleanPassword . '"', $envContent);
            file_put_contents($envPath, $envContent);
            Artisan::call('config:clear');
        }

        return redirect()->back()->with('success', 'ইমেইল অ্যাপ পাসওয়ার্ড সফলভাবে কনফিগার হয়েছে!');
    }

    /**
     * Send test email to verify live SMTP delivery.
     */
    public function sendTestEmail(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role !== 'admin') {
            abort(403, 'টেস্ট ইমেইল পাঠানোর অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'test_email' => 'required|email',
        ]);

        $to = $validated['test_email'];

        try {
            Mail::raw("অভিনন্দন! NexGen Office Expense & Fund Management System থেকে rafidul.labar.bd@gmail.com এর মাধ্যমে টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে।\nসময়: " . now()->toDateTimeString(), function ($message) use ($to) {
                $message->to($to)
                    ->subject('NexGen Expense - টেস্ট ইমেইল নিশ্চিতকরণ');
            });

            return redirect()->back()->with('success', "টেস্ট ইমেইল সফলভাবে {$to} ঠিকানায় পাঠানো হয়েছে! ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', "ইমেইল পাঠাতে ব্যর্থ হয়েছে: " . $e->getMessage() . " (অনুগ্রহ করে গুগলের ১৬ অক্ষরের অ্যাপ পাসওয়ার্ড চেক করুন)");
        }
    }

    /**
     * Store a new Project and optional allocations.
     */
    public function storeProject(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'প্রজেক্ট তৈরি করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:projects,code',
            'description' => 'nullable|string',
            'budget' => 'required|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'employee_id' => 'nullable|exists:users,id',
            'allocated_amount' => 'nullable|numeric|min:0',
            'employee_id_2' => 'nullable|exists:users,id|different:employee_id',
            'allocated_amount_2' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $project = Project::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'description' => $validated['description'] ?? null,
            'budget' => $validated['budget'],
            'status' => 'active',
            'start_date' => $validated['start_date'] ?? Carbon::today(),
            'end_date' => $validated['end_date'] ?? null,
            'created_by' => $authUser->id,
        ]);

        // Helper to allocate employee
        $allocateEmployee = function ($empId, $amount, $noteSuffix) use ($project, $authUser, $validated) {
            if (!$empId) return;
            $amt = (float) ($amount ?? 0);
            $txnRef = 'PRJ-ALC-' . strtoupper(bin2hex(random_bytes(3)));
            $allocation = ProjectAllocation::create([
                'project_id' => $project->id,
                'user_id' => $empId,
                'allocated_amount' => $amt,
                'payment_method' => $validated['payment_method'] ?? 'Bank Transfer',
                'notes' => ($validated['notes'] ?? 'প্রজেক্ট প্রারম্ভিক বরাদ্দ') . " {$noteSuffix}",
                'status' => 'active',
                'allocated_by' => $authUser->id,
                'transaction_ref' => $txnRef,
            ]);

            $emp = User::find($empId);
            AuditLog::create([
                'transaction_id' => $txnRef,
                'user_id' => $emp?->id,
                'action_type' => 'project_fund_allocated',
                'entity_type' => 'ProjectAllocation',
                'entity_id' => $allocation->id,
                'amount' => $amt,
                'remarks' => "প্রজেক্ট [{$project->name}] এর জন্য {$emp?->name} কে ৳{$amt} বরাদ্দ করা হয়েছে",
                'actor_name' => $authUser->name,
            ]);
        };

        // 1st Assigned Employee
        if (!empty($validated['employee_id'])) {
            $allocateEmployee($validated['employee_id'], $validated['allocated_amount'] ?? 0, '(দায়িত্বপ্রাপ্ত ১)');
        }

        // 2nd Assigned Employee (if admin assigned 2 people)
        if (!empty($validated['employee_id_2'])) {
            $allocateEmployee($validated['employee_id_2'], $validated['allocated_amount_2'] ?? 0, '(দায়িত্বপ্রাপ্ত ২)');
        }

        return redirect()->back()->with('success', "প্রজেক্ট '{$project->name}' সফলভাবে তৈরি হয়েছে!");
    }

    /**
     * Manage project assigned employees / team members (Add, Remove, or Switch between 1 or 2 employees).
     */
    public function updateProjectTeam(Request $request, Project $project)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'প্রজেক্ট টিম পরিচালনা করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'action' => 'required|string|in:add,remove,update',
            'user_id' => 'required|exists:users,id',
            'allocated_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $employee = User::findOrFail($validated['user_id']);

        if ($validated['action'] === 'add') {
            $existing = ProjectAllocation::where('project_id', $project->id)
                ->where('user_id', $employee->id)
                ->first();

            $allocAmount = (float) ($validated['allocated_amount'] ?? 0);

            if ($existing) {
                if ($allocAmount > 0) {
                    $existing->allocated_amount += $allocAmount;
                }
                $existing->status = 'active';
                $existing->save();
            } else {
                $txnRef = 'PRJ-ALC-' . strtoupper(bin2hex(random_bytes(3)));
                ProjectAllocation::create([
                    'project_id' => $project->id,
                    'user_id' => $employee->id,
                    'allocated_amount' => $allocAmount,
                    'payment_method' => $validated['payment_method'] ?? 'Bank Transfer',
                    'notes' => $validated['notes'] ?? 'প্রজেক্টে দায়িত্ব প্রদান',
                    'status' => 'active',
                    'allocated_by' => $authUser->id,
                    'transaction_ref' => $txnRef,
                ]);

                AuditLog::create([
                    'transaction_id' => $txnRef,
                    'user_id' => $employee->id,
                    'action_type' => 'project_member_added',
                    'entity_type' => 'Project',
                    'entity_id' => $project->id,
                    'amount' => $allocAmount,
                    'remarks' => "প্রজেক্ট [{$project->name}] এ {$employee->name} কে নতুন করে দায়িত্ব প্রদান করা হয়েছে",
                    'actor_name' => $authUser->name,
                ]);
            }

            return redirect()->back()->with('success', "প্রজেক্ট '{$project->name}'-এ {$employee->name} কে সফলভাবে যুক্ত করা হয়েছে!");
        }

        if ($validated['action'] === 'remove') {
            $allocation = ProjectAllocation::where('project_id', $project->id)
                ->where('user_id', $employee->id)
                ->first();

            if ($allocation) {
                $hasExpenses = Expense::where('project_id', $project->id)
                    ->where('user_id', $employee->id)
                    ->exists();

                if ($hasExpenses) {
                    $allocation->status = 'inactive';
                    $allocation->save();
                } else {
                    $allocation->delete();
                }

                AuditLog::create([
                    'transaction_id' => 'PRJ-REM-' . strtoupper(bin2hex(random_bytes(3))),
                    'user_id' => $employee->id,
                    'action_type' => 'project_member_removed',
                    'entity_type' => 'Project',
                    'entity_id' => $project->id,
                    'remarks' => "প্রজেক্ট [{$project->name}] থেকে {$employee->name} এর দায়িত্ব প্রত্যাহার করা হয়েছে",
                    'actor_name' => $authUser->name,
                ]);

                return redirect()->back()->with('success', "প্রজেক্ট '{$project->name}' থেকে {$employee->name} এর দায়িত্ব সফলভাবে প্রত্যাহার করা হয়েছে!");
            }

            return redirect()->back()->with('error', 'এই কর্মচারী বর্তমানে এই প্রজেক্টের দায়িত্বে নেই।');
        }

        if ($validated['action'] === 'update') {
            $allocation = ProjectAllocation::where('project_id', $project->id)
                ->where('user_id', $employee->id)
                ->first();

            if ($allocation) {
                if (isset($validated['allocated_amount'])) {
                    $allocation->allocated_amount = (float) $validated['allocated_amount'];
                }
                if (!empty($validated['notes'])) {
                    $allocation->notes = $validated['notes'];
                }
                $allocation->save();

                return redirect()->back()->with('success', "{$employee->name} এর প্রজেক্ট বরাদ্দ সফলভাবে আপডেট করা হয়েছে!");
            }
        }

        return redirect()->back()->with('error', 'অনুরোধটি সম্পন্ন করা যায়নি।');
    }

    /**
     * Allocate additional budget to an employee for an existing project.
     */
    public function allocateProjectFund(Request $request, Project $project)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'ফান্ড বরাদ্দ করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'allocated_amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $employee = User::findOrFail($validated['user_id']);
        $txnRef = 'PRJ-ALC-' . strtoupper(bin2hex(random_bytes(3)));

        // Check if an allocation already exists for this user and project
        $existing = ProjectAllocation::where('project_id', $project->id)
            ->where('user_id', $employee->id)
            ->first();

        if ($existing) {
            $existing->allocated_amount += $validated['allocated_amount'];
            if (!empty($validated['notes'])) {
                $existing->notes = ($existing->notes ? $existing->notes . " | " : "") . $validated['notes'];
            }
            $existing->save();
            $allocation = $existing;
        } else {
            $allocation = ProjectAllocation::create([
                'project_id' => $project->id,
                'user_id' => $employee->id,
                'allocated_amount' => $validated['allocated_amount'],
                'payment_method' => $validated['payment_method'] ?? 'Bank Transfer',
                'notes' => $validated['notes'] ?? 'প্রজেক্ট বরাদ্দ',
                'status' => 'active',
                'allocated_by' => $authUser->id,
                'transaction_ref' => $txnRef,
            ]);
        }

        AuditLog::create([
            'transaction_id' => $txnRef,
            'user_id' => $employee->id,
            'action_type' => 'project_fund_allocated',
            'entity_type' => 'ProjectAllocation',
            'entity_id' => $allocation->id,
            'amount' => $validated['allocated_amount'],
            'remarks' => "প্রজেক্ট [{$project->name}] এর জন্য {$employee->name} কে ৳{$validated['allocated_amount']} বরাদ্দ করা হয়েছে",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', "প্রজেক্ট '{$project->name}'-এ {$employee->name} এর নামে ৳{$validated['allocated_amount']} সফলভাবে বরাদ্দ হয়েছে!");
    }

    /**
     * Finish Project workflow (triggered by employee or admin).
     * Calculates final settlement balance and sends request to admin.
     */
    public function finishProject(Request $request, Project $project)
    {
        $authUser = Auth::user();
        $targetUserId = ($authUser->role === 'employee') ? $authUser->id : ($request->input('user_id') ?? $authUser->id);
        $user = User::findOrFail($targetUserId);

        // Security check
        if ($authUser->role === 'employee' && $authUser->id !== $user->id) {
            abort(403, 'অন্য কর্মচারীর প্রজেক্ট সমাপ্ত করার অনুমতি নেই।');
        }

        $summary = $project->getSummaryForUser($user->id);
        $allocated = $summary['allocated_amount'];
        $spent = $summary['total_spent'];
        $balance = $allocated - $spent;

        if ($balance > 0) {
            $settlementType = 'refund_to_office'; // টাকা বেঁচে গেছে, এমপ্লয়ি ফেরত দেবে
        } elseif ($balance < 0) {
            $settlementType = 'reimbursement_to_employee'; // এমপ্লয়ি অতিরিক্ত খরচ করেছে, কোম্পানি পরিশোধ করবে
        } else {
            $settlementType = 'balanced'; // হিসাব সমান
        }

        $settlement = ProjectSettlement::updateOrCreate(
            [
                'project_id' => $project->id,
                'user_id' => $user->id,
            ],
            [
                'allocated_amount' => $allocated,
                'spent_amount' => $spent,
                'balance_amount' => $balance,
                'settlement_type' => $settlementType,
                'status' => 'pending_approval',
                'employee_notes' => $request->input('notes') ?? 'প্রজেক্ট সমাপ্তির চূড়ান্ত হিসাব পাঠানো হলো।',
                'finished_at' => Carbon::now(),
            ]
        );

        $project->status = 'pending_completion';
        $project->save();

        AuditLog::create([
            'transaction_id' => 'PRJ-FIN-' . strtoupper(bin2hex(random_bytes(3))),
            'user_id' => $user->id,
            'action_type' => 'project_finished_submitted',
            'entity_type' => 'ProjectSettlement',
            'entity_id' => $settlement->id,
            'amount' => abs($balance),
            'remarks' => "প্রজেক্ট [{$project->name}] সমাপ্ত ঘোষণা করা হয়েছে। মোট বরাদ্দ: ৳{$allocated}, মোট খরচ: ৳{$spent}, ব্যালেন্স: ৳{$balance} ({$settlementType})",
            'actor_name' => $user->name,
        ]);

        return redirect()->back()->with('success', 'প্রজেক্ট ফিনিশ হিসাব সফলভাবে তৈরি হয়েছে এবং অ্যাডমিনের চূড়ান্ত পর্যালোচনার জন্য জমা হয়েছে!');
    }

    /**
     * Admin reviews and approves / rejects Project Settlement.
     */
    public function reviewProjectSettlement(Request $request, ProjectSettlement $settlement)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'প্রজেক্ট সেটেলমেন্ট পর্যালোচনার অনুমতি আপনার নেই।');
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string',
        ]);

        $project = $settlement->project;
        $employee = $settlement->user;

        if ($validated['action'] === 'approve') {
            $settlement->status = 'approved';
            $settlement->admin_notes = $validated['admin_notes'] ?? null;
            $settlement->approved_by = $authUser->id;
            $settlement->approved_at = Carbon::now();
            $settlement->save();

            // Check if all settlements for this project are approved
            $project->status = 'completed';
            $project->save();

            // Mark user's allocation completed
            ProjectAllocation::where('project_id', $project->id)
                ->where('user_id', $employee->id)
                ->update(['status' => 'completed']);

            // Auto-settlement sync:
            // If employee had unspent money and returns it to office:
            if ($settlement->settlement_type === 'refund_to_office' && $settlement->balance_amount > 0) {
                FundReturn::create([
                    'user_id' => $employee->id,
                    'project_id' => $project->id,
                    'amount' => $settlement->balance_amount,
                    'return_date' => Carbon::today(),
                    'received_by' => $authUser->name,
                    'payment_method' => 'Cash',
                    'reason' => "প্রজেক্ট [{$project->name}] সমাপ্তির পর অব্যবহৃত ফান্ড ফেরত",
                    'is_confirmed' => true,
                    'confirmed_at' => Carbon::now(),
                    'transaction_ref' => 'PRJ-RET-' . strtoupper(bin2hex(random_bytes(3))),
                ]);
            }

            AuditLog::create([
                'transaction_id' => 'PRJ-APR-' . strtoupper(bin2hex(random_bytes(3))),
                'user_id' => $employee->id,
                'action_type' => 'project_settlement_approved',
                'entity_type' => 'ProjectSettlement',
                'entity_id' => $settlement->id,
                'amount' => abs($settlement->balance_amount),
                'remarks' => "প্রজেক্ট [{$project->name}] এর চূড়ান্ত হিসাব অনুমোদিত হয়েছে। টাইপ: {$settlement->settlement_type}",
                'actor_name' => $authUser->name,
            ]);

            return redirect()->back()->with('success', "প্রজেক্ট '{$project->name}' এর ফাইনাল হিসাব অনুমোদিত ও সমাপ্ত ঘোষণা করা হয়েছে!");
        } else {
            $settlement->status = 'rejected';
            $settlement->admin_notes = $validated['admin_notes'] ?? 'হিসাব পুনর্মূল্যায়নের জন্য ফেরত পাঠানো হলো।';
            $settlement->save();

            $project->status = 'active';
            $project->save();

            AuditLog::create([
                'transaction_id' => 'PRJ-REJ-' . strtoupper(bin2hex(random_bytes(3))),
                'user_id' => $employee->id,
                'action_type' => 'project_settlement_rejected',
                'entity_type' => 'ProjectSettlement',
                'entity_id' => $settlement->id,
                'amount' => abs($settlement->balance_amount),
                'remarks' => "প্রজেক্ট [{$project->name}] এর হিসাব অ্যাডমিন কর্তৃক প্রত্যাখ্যাত হয়েছে। নোট: {$validated['admin_notes']}",
                'actor_name' => $authUser->name,
            ]);

            return redirect()->back()->with('error', "প্রজেক্ট সেটেলমেন্ট প্রত্যাখ্যাত হয়েছে এবং সংশোধনের জন্য সক্রিয় রাখা হয়েছে।");
        }
    }

    /**
     * Admin requests documents/vouchers for a project or specific expense.
     */
    public function requestProjectDocument(Request $request, Project $project)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'প্রমাণপত্র চাওয়ার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'expense_id' => 'nullable|exists:expenses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $employee = User::findOrFail($validated['user_id']);

        $docRequest = ProjectDocumentRequest::create([
            'project_id' => $project->id,
            'user_id' => $employee->id,
            'requested_by' => $authUser->id,
            'expense_id' => $validated['expense_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        AuditLog::create([
            'transaction_id' => 'PRJ-DOC-REQ-' . strtoupper(bin2hex(random_bytes(3))),
            'user_id' => $employee->id,
            'action_type' => 'project_document_requested',
            'entity_type' => 'ProjectDocumentRequest',
            'entity_id' => $docRequest->id,
            'amount' => 0,
            'remarks' => "অ্যাডমিন {$authUser->name} কর্মচারী {$employee->name}-এর কাছে প্রমাণপত্র তলব করেছেন: {$validated['title']}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', "প্রমাণপত্র জমা দেওয়ার নোটিফিকেশন কর্মচারী {$employee->name}-এর ড্যাশবোর্ডে পাঠানো হয়েছে!");
    }

    /**
     * Employee uploads document/voucher for a project or document request.
     */
    public function uploadProjectDocument(Request $request, Project $project)
    {
        $authUser = Auth::user();

        $validated = $request->validate([
            'project_document_request_id' => 'nullable|exists:project_document_requests,id',
            'expense_id' => 'nullable|exists:expenses,id',
            'file_name' => 'required|string|max:255',
            'file_data' => 'required|string',
            'file_type' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $document = ProjectDocument::create([
            'project_id' => $project->id,
            'project_document_request_id' => $validated['project_document_request_id'] ?? null,
            'expense_id' => $validated['expense_id'] ?? null,
            'user_id' => $authUser->id,
            'file_name' => $validated['file_name'],
            'file_data' => $validated['file_data'],
            'file_type' => $validated['file_type'] ?? 'image',
            'notes' => $validated['notes'] ?? null,
        ]);

        // If this fulfills a specific request, mark the request as submitted
        if (!empty($validated['project_document_request_id'])) {
            $req = ProjectDocumentRequest::find($validated['project_document_request_id']);
            if ($req) {
                $req->status = 'submitted';
                $req->save();
            }
        }

        AuditLog::create([
            'transaction_id' => 'PRJ-DOC-UP-' . strtoupper(bin2hex(random_bytes(3))),
            'user_id' => $authUser->id,
            'action_type' => 'project_document_uploaded',
            'entity_type' => 'ProjectDocument',
            'entity_id' => $document->id,
            'amount' => 0,
            'remarks' => "কর্মচারী {$authUser->name} প্রজেক্ট [{$project->name}] এর জন্য প্রমাণপত্র আপলোড করেছেন: {$validated['file_name']}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', 'প্রমাণপত্র সফলভাবে আপলোড হয়েছে! অ্যাডমিন তা পর্যালোচনা করতে পারবেন।');
    }

    /**
     * Admin verifies an uploaded document.
     */
    public function verifyProjectDocument(Request $request, ProjectDocument $document)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'প্রমাণপত্র যাচাই করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        if ($document->request) {
            $document->request->status = 'verified';
            $document->request->save();
        }

        AuditLog::create([
            'transaction_id' => 'PRJ-DOC-VRF-' . strtoupper(bin2hex(random_bytes(3))),
            'user_id' => $document->user_id,
            'action_type' => 'project_document_verified',
            'entity_type' => 'ProjectDocument',
            'entity_id' => $document->id,
            'amount' => 0,
            'remarks' => "অ্যাডমিন {$authUser->name} প্রমাণপত্র যাচাই ও অনুমোদন করেছেন: {$document->file_name}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', 'প্রমাণপত্র সফলভাবে যাচাই ও গৃহীত হয়েছে!');
    }

    /**
     * Store a new Expense Category (Admin only).
     */
    public function storeCategory(Request $request)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'খরচের ধরন যোগ করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'name_bn' => 'required|string|max:100|unique:categories,name_bn',
            'name' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:500',
        ], [
            'name_bn.required' => 'খরচের ধরনের বাংলা নাম লেখা বাধ্যতামূলক।',
            'name_bn.unique' => 'এই নামের খরচের ধরন ইতিমধ্যে বিদ্যমান রয়েছে।',
        ]);

        $category = Category::create([
            'name' => $validated['name'] ?: $validated['name_bn'],
            'name_bn' => $validated['name_bn'],
            'icon' => $validated['icon'] ?: 'Receipt',
            'description' => $validated['description'] ?? null,
            'is_default' => false,
        ]);

        AuditLog::create([
            'transaction_id' => 'CAT-ADD-' . strtoupper(bin2hex(random_bytes(3))),
            'user_id' => $authUser->id,
            'action_type' => 'category_created',
            'entity_type' => 'Category',
            'entity_id' => $category->id,
            'amount' => 0,
            'remarks' => "নতুন খরচের ধরন যুক্ত করা হয়েছে: {$category->name_bn}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', "নতুন খরচের ধরন '{$category->name_bn}' সফলভাবে তৈরি হয়েছে!");
    }

    /**
     * Update an existing Expense Category (Admin only).
     */
    public function updateCategory(Request $request, Category $category)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'খরচের ধরন পরিবর্তনের অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $validated = $request->validate([
            'name_bn' => 'required|string|max:100|unique:categories,name_bn,' . $category->id,
            'name' => 'nullable|string|max:100',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:500',
        ], [
            'name_bn.required' => 'খরচের ধরনের বাংলা নাম লেখা বাধ্যতামূলক।',
            'name_bn.unique' => 'এই নামের খরচের ধরন ইতিমধ্যে বিদ্যমান রয়েছে।',
        ]);

        $category->update([
            'name' => $validated['name'] ?: $category->name,
            'name_bn' => $validated['name_bn'],
            'icon' => $validated['icon'] ?: $category->icon,
            'description' => $validated['description'] ?? $category->description,
        ]);

        AuditLog::create([
            'transaction_id' => 'CAT-UPD-' . strtoupper(bin2hex(random_bytes(3))),
            'user_id' => $authUser->id,
            'action_type' => 'category_updated',
            'entity_type' => 'Category',
            'entity_id' => $category->id,
            'amount' => 0,
            'remarks' => "খরচের ধরন আপডেট করা হয়েছে: {$category->name_bn}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', "খরচের ধরন '{$category->name_bn}' সফলভাবে আপডেট করা হয়েছে!");
    }

    /**
     * Delete an Expense Category (Admin only).
     */
    public function destroyCategory(Request $request, Category $category)
    {
        $authUser = Auth::user();
        if ($authUser->role === 'employee') {
            abort(403, 'খরচের ধরন মুছে ফেলার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        $expenseCount = $category->expenses()->count();
        if ($expenseCount > 0) {
            return redirect()->back()->with('error', "এই ক্যাটাগরির অধীনে {$expenseCount}টি খরচের হিসাব বিদ্যমান রয়েছে। হিসাবের স্বচ্ছতা রক্ষার্থে এটি ডিলিট করা যাবে না।");
        }

        $name = $category->name_bn;
        $category->delete();

        AuditLog::create([
            'transaction_id' => 'CAT-DEL-' . strtoupper(bin2hex(random_bytes(3))),
            'user_id' => $authUser->id,
            'action_type' => 'category_deleted',
            'entity_type' => 'Category',
            'entity_id' => $category->id,
            'amount' => 0,
            'remarks' => "খরচের ধরন মুছে ফেলা হয়েছে: {$name}",
            'actor_name' => $authUser->name,
        ]);

        return redirect()->back()->with('success', "খরচের ধরন '{$name}' সফলভাবে ডিলিট করা হয়েছে!");
    }

    /**
     * Reset seed data to fresh state for testing.
     */
    public function resetDemoData()
    {
        $authUser = Auth::user();
        if ($authUser->role !== 'admin') {
            abort(403, 'ডেমো রিসেট করার অনুমতি শুধুমাত্র অ্যাডমিনের রয়েছে।');
        }

        Artisan::call('migrate:fresh', ['--seed' => true]);
        return redirect('/')->with('success', 'সমস্ত ডেমো ডেটা সফলভাবে রিসিট করা হয়েছে!');
    }
}
