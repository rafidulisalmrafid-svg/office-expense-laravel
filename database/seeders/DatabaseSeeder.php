<?php

namespace Database\Seeders;

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
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Categories (10 standard office expense types)
        $categories = [
            ['name' => 'Travel & Commute', 'name_bn' => 'যাতায়াত খরচ', 'icon' => 'Car', 'description' => 'বাস, রিকশা, সিএনজি, উবার ও ফিল্ড ভ্রমণ'],
            ['name' => 'Lunch & Food', 'name_bn' => 'খাবার ও আপ্যায়ন খরচ', 'icon' => 'Utensils', 'description' => 'দুপুরের খাবার, নাস্তা, চা ও মেহমান আপ্যায়ন'],
            ['name' => 'Stationery & Printing', 'name_bn' => 'অফিস স্টেশনারি ও সরঞ্জাম', 'icon' => 'FileText', 'description' => 'কাগজ, কলম, ফাইল, ডায়েরি ও অফিস দ্রব্যাদি'],
            ['name' => 'Printing & Photocopy', 'name_bn' => 'প্রিন্টিং ও ফটোকপি খরচ', 'icon' => 'Printer', 'description' => 'ডকুমেন্ট কালার/সাদা-কালো প্রিন্ট ও ফটোকপি'],
            ['name' => 'Courier & Logistics', 'name_bn' => 'কুরিয়ার ও ডেলিভারি খরচ', 'icon' => 'Package', 'description' => 'সুন্দরবন/এসএ পরিবহন ও পার্সেল চার্জ'],
            ['name' => 'Mobile & Internet', 'name_bn' => 'মোবাইল ও ইন্টারনেট খরচ', 'icon' => 'PhoneCall', 'description' => 'অফিসিয়াল কল বিল ও ডাটা প্যাক রিচার্জ'],
            ['name' => 'Client Entertainment', 'name_bn' => 'মিটিং ও ইভেন্ট খরচ', 'icon' => 'Users', 'description' => 'ক্লায়েন্ট মিটিং, ট্রেনিং সেশন ও কনফারেন্স'],
            ['name' => 'IT & Hardware', 'name_bn' => 'পণ্য ক্রয় খরচ', 'icon' => 'ShoppingBag', 'description' => 'অফিসের প্রয়োজনীয় মালামাল বা সরঞ্জাম ক্রয়'],
            ['name' => 'Office Maintenance', 'name_bn' => 'শ্রমিক ও দৈনিক মজুরি', 'icon' => 'HardHat', 'description' => 'লোড-আনলোড, ক্লিনার ও দৈনিক লেবার মজুরি'],
            ['name' => 'Miscellaneous', 'name_bn' => 'অন্যান্য খরচ', 'icon' => 'Layers', 'description' => 'অনাকাঙ্ক্ষিত জরুরি ব্যয় (বাধ্যতামূলক কারণ আবশ্যক)'],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[$cat['name']] = Category::create($cat);
        }

        // Helper for SVG base64 receipts
        $sampleReceipt = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2" rx="8"/><rect x="20" y="20" width="360" height="50" rx="4" fill="%234338ca"/><text x="200" y="52" fill="%23ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">OFFICIAL CASH VOUCHER / RECEIPT</text><text x="40" y="105" fill="%23334155" font-family="sans-serif" font-size="14">Voucher No: %23VCH-2026-9842</text><text x="40" y="135" fill="%23334155" font-family="sans-serif" font-size="14">Issued By: Apex Logistics &amp; Transport</text><text x="40" y="165" fill="%23334155" font-family="sans-serif" font-size="14">Amount Paid: BDT 650.00</text><text x="40" y="195" fill="%23059669" font-family="sans-serif" font-size="13" font-weight="bold">Status: VERIFIED &amp; PAID IN CASH</text><circle cx="340" cy="180" r="28" fill="%2310b981" opacity="0.15"/><text x="340" y="185" fill="%23059669" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">OFFICE AUDITED</text></svg>';

        // 2. Seed Users
        // Admin
        $admin = User::create([
            'employee_id' => 'ADM-001',
            'name' => 'তাহমিদ জামান',
            'email' => 'admin@company.com',
            'phone' => '01711000001',
            'department' => 'Executive Office',
            'designation' => 'Managing Director & Head of Admin',
            'role' => 'admin',
            'status' => 'approved',
            'password' => Hash::make('password123'),
        ]);

        // Accounts Manager
        $accountsManager = User::create([
            'employee_id' => 'ACC-002',
            'name' => 'করিম চৌধুরী',
            'email' => 'accounts@company.com',
            'phone' => '01711000002',
            'department' => 'Finance & Accounts',
            'designation' => 'Accounts Manager & Fund Custodian',
            'role' => 'accounts_manager',
            'status' => 'approved',
            'password' => Hash::make('password123'),
        ]);

        // 10 Employees
        $employeeData = [
            [
                'employee_id' => 'EMP-101',
                'name' => 'রহিম আহমেদ',
                'email' => 'rahim@company.com',
                'phone' => '01819000101',
                'department' => 'Operations & Field',
                'designation' => 'Senior Field Executive',
            ],
            [
                'employee_id' => 'EMP-102',
                'name' => 'তানিয়া রহমান',
                'email' => 'tania@company.com',
                'phone' => '01819000102',
                'department' => 'Human Resources & Admin',
                'designation' => 'Office Coordinator',
            ],
            [
                'employee_id' => 'EMP-103',
                'name' => 'হাসান মাহমুদ',
                'email' => 'hasan@company.com',
                'phone' => '01819000103',
                'department' => 'Marketing & Sales',
                'designation' => 'Marketing Specialist',
            ],
            [
                'employee_id' => 'EMP-104',
                'name' => 'ফারহানা হক',
                'email' => 'farhana@company.com',
                'phone' => '01819000104',
                'department' => 'Procurement & Logistics',
                'designation' => 'Procurement Officer',
            ],
            [
                'employee_id' => 'EMP-105',
                'name' => 'সাকিব আল হাসান',
                'email' => 'sakib@company.com',
                'phone' => '01819000105',
                'department' => 'IT & Engineering',
                'designation' => 'Systems Support Engineer',
            ],
            [
                'employee_id' => 'EMP-106',
                'name' => 'নুসরাত জাহান',
                'email' => 'nusrat@company.com',
                'phone' => '01819000106',
                'department' => 'Customer Relations',
                'designation' => 'Senior Support Specialist',
            ],
            [
                'employee_id' => 'EMP-107',
                'name' => 'কামরুল ইসলাম',
                'email' => 'kamrul@company.com',
                'phone' => '01819000107',
                'department' => 'Operations',
                'designation' => 'Site Supervisor',
            ],
            [
                'employee_id' => 'EMP-108',
                'name' => 'মেহজাবিন চৌধুরী',
                'email' => 'mehzabin@company.com',
                'phone' => '01819000108',
                'department' => 'Public Relations & Events',
                'designation' => 'Event Manager',
            ],
            [
                'employee_id' => 'EMP-109',
                'name' => 'আরিফুল ইসলাম',
                'email' => 'ariful@company.com',
                'phone' => '01819000109',
                'department' => 'Dispatch & Delivery',
                'designation' => 'Courier Logistics Lead',
            ],
            [
                'employee_id' => 'EMP-110',
                'name' => 'শারমিন সুলতানা',
                'email' => 'sharmin@company.com',
                'phone' => '01819000110',
                'department' => 'Creative & Media',
                'designation' => 'Visual Content Designer',
            ],
        ];

        $employees = [];
        foreach ($employeeData as $emp) {
            $employees[] = User::create([
                'employee_id' => $emp['employee_id'],
                'name' => $emp['name'],
                'email' => $emp['email'],
                'phone' => $emp['phone'],
                'department' => $emp['department'],
                'designation' => $emp['designation'],
                'role' => 'employee',
                'status' => 'approved',
                'password' => Hash::make('password123'),
            ]);
        }

        // 1 Pending Employee Registration
        User::create([
            'employee_id' => 'EMP-111',
            'name' => 'জুবায়ের আহমেদ',
            'email' => 'zubair@company.com',
            'phone' => '01819000111',
            'department' => 'Operations',
            'designation' => 'Junior Field Assistant',
            'role' => 'employee',
            'status' => 'pending',
            'password' => Hash::make('password123'),
        ]);

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // 3. Seed Fund Activities & Workflow Demonstrations

        // Employee 0: রহিম আহমেদ
        // Request 1: ৳৩,০০০ requested for site visit, approved ৳৩,০০০, disbursed by Karim, confirmed received
        $req1 = FundRequest::create([
            'user_id' => $employees[0]->id,
            'requested_amount' => 3000,
            'approved_amount' => 3000,
            'purpose' => 'নারায়ণগঞ্জ ও গাজীপুর সাইট ভিজিট ও যাতায়াত',
            'details' => 'ক্লায়েন্ট ভিজিট এবং ইনস্টলেশন সাইট পরিদর্শনে যাতায়াত ও স্থানীয় কনভিয়েন্স',
            'needed_date' => $yesterday,
            'status' => 'paid',
            'previous_remaining' => 0,
        ]);

        FundAllocation::create([
            'fund_request_id' => $req1->id,
            'user_id' => $employees[0]->id,
            'amount' => 3000,
            'money_provider' => 'করিম চৌধুরী (অ্যাকাউন্টস ম্যানেজার)',
            'payment_method' => 'Cash',
            'notes' => 'অফিস ক্যাশ ড্রয়ার থেকে সরাসরি প্রদান করা হয়েছে',
            'disbursed_at' => $yesterday->copy()->setHour(10)->setMinute(30),
            'is_received_by_employee' => true,
            'received_at' => $yesterday->copy()->setHour(10)->setMinute(45),
            'transaction_ref' => 'TXN-20261022-001',
        ]);

        AuditLog::create([
            'transaction_id' => 'TXN-20261022-001',
            'user_id' => $employees[0]->id,
            'action_type' => 'fund_received',
            'entity_type' => 'FundAllocation',
            'amount' => 3000,
            'balance_before' => 0,
            'balance_after' => 3000,
            'remarks' => 'করিম চৌধুরীর কাছ থেকে নগদ ৳৩,০০০ বুঝে পেয়েছেন রহিম আহমেদ',
            'actor_name' => 'রহিম আহমেদ',
        ]);

        // Expenses for Rahim: ৳১২০০ Approved, ৳৬৫০ Approved, ৳৪০০ Pending
        Expense::create([
            'user_id' => $employees[0]->id,
            'category_id' => $categoryModels['Travel & Commute']->id,
            'expense_date' => $yesterday,
            'amount' => 1200,
            'category_name' => 'যাতায়াত ও ভাড়া',
            'description' => 'উবার ও সিএনজি ভাড়া (ঢাকা-গাজীপুর রিটার্ন)',
            'receipt_image' => $sampleReceipt,
            'status' => 'approved',
            'verified_by' => 'তাহমিদ জামান (অ্যাডমিন)',
            'verified_at' => $yesterday->copy()->setHour(18),
            'transaction_ref' => 'TXN-20261022-EXP01',
        ]);

        Expense::create([
            'user_id' => $employees[0]->id,
            'category_id' => $categoryModels['Lunch & Food']->id,
            'expense_date' => $yesterday,
            'amount' => 650,
            'category_name' => 'খাবার ও নাস্তা',
            'description' => 'সাইট টিমের জন্য দুপুরের খাবার ও পানি',
            'receipt_image' => $sampleReceipt,
            'status' => 'approved',
            'verified_by' => 'তাহমিদ জামান (অ্যাডমিন)',
            'verified_at' => $yesterday->copy()->setHour(18),
            'transaction_ref' => 'TXN-20261022-EXP02',
        ]);

        Expense::create([
            'user_id' => $employees[0]->id,
            'category_id' => $categoryModels['Miscellaneous']->id,
            'expense_date' => $today,
            'amount' => 400,
            'category_name' => 'জরুরি ও বিবিধ',
            'description' => 'টুলস ও ব্যাটারি ক্রয়',
            'receipt_image' => $sampleReceipt,
            'status' => 'pending',
            'transaction_ref' => 'TXN-20261023-EXP01',
        ]);

        // Fund Return for Rahim: Returned ৳৫০০ unused money to admin
        FundReturn::create([
            'user_id' => $employees[0]->id,
            'amount' => 500,
            'return_date' => $today,
            'received_by' => 'করিম চৌধুরী (অ্যাকাউন্টস)',
            'payment_method' => 'Cash',
            'reason' => 'সাইট ভিজিট শেষে অবশিষ্ট অব্যবহৃত টাকা ফেরত',
            'is_confirmed' => true,
            'confirmed_at' => $today->copy()->setHour(11),
            'transaction_ref' => 'TXN-20261023-RET01',
        ]);

        AuditLog::create([
            'transaction_id' => 'TXN-20261023-RET01',
            'user_id' => $employees[0]->id,
            'action_type' => 'fund_returned',
            'entity_type' => 'FundReturn',
            'amount' => 500,
            'balance_before' => 1150,
            'balance_after' => 650,
            'remarks' => 'অব্যবহৃত ৳৫০০ অফিসে জমা দিয়ে রসিদ বুঝে নিয়েছেন',
            'actor_name' => 'করিম চৌধুরী',
        ]);

        // Employee 1: তানিয়া রহমান (Office Coordinator)
        // Request: ৳৫,০০০ for Office Supplies & Stationery
        $req2 = FundRequest::create([
            'user_id' => $employees[1]->id,
            'requested_amount' => 5000,
            'approved_amount' => 5000,
            'purpose' => 'অফিস স্টেশনারি ও সাপ্তাহিক রিফ্রেশমেন্ট সামগ্রী ক্রয়',
            'details' => 'A4 পেপার রিম, প্রিন্টার টোনার, কলম, ফাইল ফোল্ডার এবং কফি/টি ব্যাগ',
            'needed_date' => $today,
            'status' => 'paid',
            'previous_remaining' => 0,
        ]);

        FundAllocation::create([
            'fund_request_id' => $req2->id,
            'user_id' => $employees[1]->id,
            'amount' => 5000,
            'money_provider' => 'করিম চৌধুরী (অ্যাকাউন্টস)',
            'payment_method' => 'bKash Merchant',
            'notes' => 'TrxID: BK928401948',
            'disbursed_at' => $today->copy()->setHour(9)->setMinute(15),
            'is_received_by_employee' => true,
            'received_at' => $today->copy()->setHour(9)->setMinute(25),
            'transaction_ref' => 'TXN-20261023-002',
        ]);

        Expense::create([
            'user_id' => $employees[1]->id,
            'category_id' => $categoryModels['Stationery & Printing']->id,
            'expense_date' => $today,
            'amount' => 2800,
            'category_name' => 'স্টেশনারি ও প্রিন্টিং',
            'description' => 'প্রিন্টার টোনার কার্ট্রিজ ও ২ রিম ডাবল এ পেপার',
            'receipt_image' => $sampleReceipt,
            'status' => 'approved',
            'verified_by' => 'তাহমিদ জামান',
            'verified_at' => $today->copy()->setHour(10)->setMinute(30),
            'transaction_ref' => 'TXN-20261023-EXP02',
        ]);

        // Employee 2: হাসান মাহমুদ (Marketing)
        // Demonstrating "Employee Payable" (পকেট থেকে অতিরিক্ত খরচ করা)
        // Received ৳২,০০০, but spent ৳২,৮০০ (Approved) -> Office owes Hasan ৳৮০০!
        $req3 = FundRequest::create([
            'user_id' => $employees[2]->id,
            'requested_amount' => 2000,
            'approved_amount' => 2000,
            'purpose' => 'ক্লায়েন্ট প্রেজেন্টেশন ও ইভেন্ট প্রিন্টস',
            'details' => 'ব্রোশার প্রিন্ট ও ক্লায়েন্ট লাঞ্চ মিটিং',
            'needed_date' => $yesterday,
            'status' => 'paid',
            'previous_remaining' => 0,
        ]);

        FundAllocation::create([
            'fund_request_id' => $req3->id,
            'user_id' => $employees[2]->id,
            'amount' => 2000,
            'money_provider' => 'করিম চৌধুরী',
            'payment_method' => 'Cash',
            'disbursed_at' => $yesterday->copy()->setHour(11),
            'is_received_by_employee' => true,
            'received_at' => $yesterday->copy()->setHour(11)->setMinute(20),
            'transaction_ref' => 'TXN-20261022-003',
        ]);

        Expense::create([
            'user_id' => $employees[2]->id,
            'category_id' => $categoryModels['Client Entertainment']->id,
            'expense_date' => $yesterday,
            'amount' => 1800,
            'category_name' => 'ক্লায়েন্ট আপ্যায়ন',
            'description' => 'গ্রাহকের সাথে বিজনেস লাঞ্চ ও প্রকল্প আলোচনা',
            'receipt_image' => $sampleReceipt,
            'status' => 'approved',
            'verified_by' => 'তাহমিদ জামান',
            'verified_at' => $yesterday->copy()->setHour(17),
            'transaction_ref' => 'TXN-20261022-EXP04',
        ]);

        Expense::create([
            'user_id' => $employees[2]->id,
            'category_id' => $categoryModels['Stationery & Printing']->id,
            'expense_date' => $yesterday,
            'amount' => 1000,
            'category_name' => 'স্টেশনারি ও প্রিন্টিং',
            'description' => 'কালার ব্রোশার ও লিফলেট প্রিন্টিং (জরুরি অতিরিক্ত খরচ)',
            'receipt_image' => $sampleReceipt,
            'status' => 'approved',
            'verified_by' => 'তাহমিদ জামান',
            'verified_at' => $today->copy()->setHour(9)->setMinute(45),
            'transaction_ref' => 'TXN-20261023-EXP03',
        ]);

        // Employee 3: ফারহানা হক (Procurement)
        // Demonstrating Two-Way Handshake (Disbursed but NOT yet confirmed received by employee)
        $req4 = FundRequest::create([
            'user_id' => $employees[3]->id,
            'requested_amount' => 4500,
            'approved_amount' => 4500,
            'purpose' => 'অফিস রিপেয়ার ও ইলেকট্রিক ক্যাবল ক্রয়',
            'details' => 'কনফারেন্স রুমের মাল্টিপ্লাগ, ফ্যান সুইচ ও কেবল ওয়্যারিং মেরামত',
            'needed_date' => $today,
            'status' => 'paid',
            'previous_remaining' => 0,
        ]);

        FundAllocation::create([
            'fund_request_id' => $req4->id,
            'user_id' => $employees[3]->id,
            'amount' => 4500,
            'money_provider' => 'করিম চৌধুরী (অ্যাকাউন্টস)',
            'payment_method' => 'Cash',
            'notes' => 'রিসিট ভাউচারে স্বাক্ষর করে টাকা হস্তান্তর করা হয়েছে',
            'disbursed_at' => $today->copy()->setHour(10)->setMinute(15),
            'is_received_by_employee' => false, // PENDING CONFIRMATION!
            'transaction_ref' => 'TXN-20261023-004',
        ]);

        // Employee 4: সাকিব আল হাসান (IT Support)
        // Pending Fund Request awaiting Admin approval
        FundRequest::create([
            'user_id' => $employees[4]->id,
            'requested_amount' => 3500,
            'purpose' => 'ল্যান ক্যাবল ও ওয়াইফাই এক্সটেন্ডার রিপ্লেসমেন্ট',
            'details' => 'দ্বিতীয় তলার ওয়াইফাই রাউটার অ্যাডাপ্টার নষ্ট হয়েছে ও ক্যাবল ক্ল্যাম্প প্রয়োজন',
            'needed_date' => $today->copy()->addDay(),
            'status' => 'pending',
            'previous_remaining' => 0,
        ]);

        // Employee 5: নুসরাত জাহান
        // Partially Approved Fund Request
        FundRequest::create([
            'user_id' => $employees[5]->id,
            'requested_amount' => 2500,
            'approved_amount' => 1500,
            'purpose' => 'কাস্টমার গিফট প্যাক কুরিয়ার ডেলিভারি',
            'details' => '১০ জন ভিআইপি ক্লায়েন্টকে প্রিমিয়াম উপহার বক্স প্রেরণ',
            'needed_date' => $today,
            'status' => 'partially_approved',
            'rejection_reason' => 'বাজেট অপ্টিমাইজেশনের জন্য সাধারণ কুরিয়ার রেটে ৳১,৫০০ বরাদ্দ করা হলো',
            'previous_remaining' => 0,
        ]);

        // Employee 6: কামরুল ইসলাম
        // Rejected Fund Request
        FundRequest::create([
            'user_id' => $employees[6]->id,
            'requested_amount' => 6000,
            'purpose' => 'পার্সোনাল ল্যাপটপ ব্যাগ ও হেডফোন',
            'details' => 'ফিল্ডে ব্যবহারের জন্য নতুন ব্যাগ',
            'needed_date' => $today,
            'status' => 'rejected',
            'rejection_reason' => 'অফিসের স্ট্যান্ডার্ড প্রকিউরমেন্ট পলিসি অনুযায়ী এটি কোম্পানি সেন্ট্রালি সরবরাহ করবে',
            'previous_remaining' => 0,
        ]);

        // 4. Daily Closing Snapshot for Yesterday
        DailyClosing::create([
            'date' => $yesterday,
            'opening_balance' => 35000.00,
            'total_disbursed' => 5000.00,
            'total_approved_expenses' => 3650.00,
            'total_returned' => 0.00,
            'closing_balance' => 36350.00,
            'total_employee_remaining' => 1350.00,
            'total_employee_payable' => 800.00,
            'total_pending_claims' => 0.00,
            'active_employees_count' => 10,
            'generated_by' => 'তাহমিদ জামান (অ্যাডমিন)',
            'notes' => 'দৈনিক হিসাব সম্পন্ন এবং হিসাবরক্ষণ শাখা কর্তৃক ভেরিফাইড।',
        ]);

        // 5. Project-Based Expense Management Demo
        // Projects A, B, C assigned to Employee 0 (রহিম আহমেদ)
        $targetEmployee = $employees[0]; // রহিম আহমেদ

        $projectA = Project::create([
            'name' => 'প্রজেক্ট A - ধানমন্ডি শাখা রেনোভেশন',
            'code' => 'PRJ-A',
            'description' => 'ধানমন্ডি আঞ্চলিক অফিস ইন্টেরিয়র, সিভিল ও ইলেকট্রিক্যাল কাজের বরাদ্দ',
            'budget' => 20000.00,
            'status' => 'active',
            'start_date' => Carbon::today()->subDays(5),
            'end_date' => Carbon::today()->addDays(20),
            'created_by' => $admin->id,
        ]);

        $projectB = Project::create([
            'name' => 'প্রজেক্ট B - আইটি ও নেটওয়ার্কিং সেটআপ',
            'code' => 'PRJ-B',
            'description' => 'সার্ভার র্যাক, ওয়াইফাই রাউটার ও ল্যান ক্যাবলিং স্থাপন',
            'budget' => 15000.00,
            'status' => 'active',
            'start_date' => Carbon::today()->subDays(3),
            'end_date' => Carbon::today()->addDays(15),
            'created_by' => $admin->id,
        ]);

        $projectC = Project::create([
            'name' => 'প্রজেক্ট C - স্টাফ ট্রেনিং ও ওয়ার্কশপ',
            'code' => 'PRJ-C',
            'description' => 'নতুন টিম সদস্যদের টেকনিক্যাল ও সেফটি ট্রেনিং সেশন আয়োজন',
            'budget' => 10000.00,
            'status' => 'active',
            'start_date' => Carbon::today()->subDays(1),
            'end_date' => Carbon::today()->addDays(10),
            'created_by' => $admin->id,
        ]);

        // Allocations for Rahim: 20k, 15k, 10k
        $allocA = ProjectAllocation::create([
            'project_id' => $projectA->id,
            'user_id' => $targetEmployee->id,
            'allocated_amount' => 20000.00,
            'payment_method' => 'Bank Transfer',
            'notes' => 'প্রজেক্ট A এর প্রাথমিক কাজের জন্য অগ্রিম বরাদ্দ',
            'status' => 'active',
            'allocated_by' => $admin->id,
            'transaction_ref' => 'PRJ-ALC-A-001',
        ]);

        $allocB = ProjectAllocation::create([
            'project_id' => $projectB->id,
            'user_id' => $targetEmployee->id,
            'allocated_amount' => 15000.00,
            'payment_method' => 'Bank Transfer',
            'notes' => 'প্রজেক্ট B এর ক্যাবলিং ও হার্ডওয়্যার কেনার বরাদ্দ',
            'status' => 'active',
            'allocated_by' => $admin->id,
            'transaction_ref' => 'PRJ-ALC-B-001',
        ]);

        $allocC = ProjectAllocation::create([
            'project_id' => $projectC->id,
            'user_id' => $targetEmployee->id,
            'allocated_amount' => 10000.00,
            'payment_method' => 'Cash',
            'notes' => 'প্রজেক্ট C এর ওয়ার্কশপ ও স্টেশনারি বরাদ্দ',
            'status' => 'active',
            'allocated_by' => $admin->id,
            'transaction_ref' => 'PRJ-ALC-C-001',
        ]);

        // Daily Expense logged under Project A: 2,000 taka
        $expenseA = Expense::create([
            'user_id' => $targetEmployee->id,
            'category_id' => $categoryModels['IT & Hardware']->id,
            'project_id' => $projectA->id,
            'project_allocation_id' => $allocA->id,
            'expense_date' => Carbon::today()->subDays(2),
            'amount' => 2000.00,
            'category_name' => $categoryModels['IT & Hardware']->name_bn,
            'description' => 'সুইচবোর্ড, ক্যাবল ট্রাঙ্কিং ও কানেক্টর ক্রয়',
            'receipt_path' => null,
            'receipt_image' => $sampleReceipt,
            'status' => 'approved',
            'verified_by' => 'তাহমিদ জামান (অ্যাডমিন)',
            'verified_at' => Carbon::today()->subDays(1),
            'transaction_ref' => 'PRJ-EXP-2026-001',
        ]);

        // Document request by Admin for Project A
        $docReqA = ProjectDocumentRequest::create([
            'project_id' => $projectA->id,
            'user_id' => $targetEmployee->id,
            'requested_by' => $admin->id,
            'expense_id' => $expenseA->id,
            'title' => 'ইলেকট্রিক সামগ্রী ক্রয়ের পাকা মেমো ও ভাউচার জমা দিন',
            'description' => 'দোকানের সিল ও ক্যাশ মেমোর স্পষ্ট স্ক্যান বা ছবি আপলোড করুন',
            'status' => 'submitted',
        ]);

        // Document uploaded by Rahim for Project A
        ProjectDocument::create([
            'project_id' => $projectA->id,
            'project_document_request_id' => $docReqA->id,
            'expense_id' => $expenseA->id,
            'user_id' => $targetEmployee->id,
            'file_name' => 'Hardware_Electric_Invoice_PRJA.png',
            'file_data' => $sampleReceipt,
            'file_type' => 'image',
            'notes' => 'নিউ এলিফ্যান্ট রোড থেকে কেনা মেমো নং #৭৭৮২',
        ]);
    }
}
