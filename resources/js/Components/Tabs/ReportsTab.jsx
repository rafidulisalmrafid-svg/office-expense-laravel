import React, { useState } from 'react';
import { 
    FileText, 
    Printer, 
    Download, 
    Share2, 
    Calendar, 
    Building2, 
    CheckCircle2, 
    Clock, 
    ShieldCheck, 
    RotateCcw, 
    Lock,
    Search,
    ChevronRight,
    FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate, getLocalDateStr, extractDateStr } from '../../utils/formatters';

export default function ReportsTab({
    activeRole = 'admin',
    users = [],
    fundAllocations = [],
    expenses = [],
    fundReturns = [],
    dailyClosings = [],
    officeSummary = {},
    onOpenClosingModal,
    useBanglaDigits = true,
}) {
    const todayStr = getLocalDateStr();
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [reportType, setReportType] = useState('daily'); // daily, weekly, monthly

    // Filter transactions for the selected report date
    const dateAllocations = fundAllocations.filter(a => {
        if (!a.disbursed_at) return false;
        return extractDateStr(a.disbursed_at) === selectedDate;
    });

    const dateExpenses = expenses.filter(e => extractDateStr(e.expense_date) === selectedDate);
    const approvedDateExpenses = dateExpenses.filter(e => e.status === 'approved' || e.status === 'paid' || e.status === 'received');
    const pendingDateExpenses = dateExpenses.filter(e => e.status === 'pending');

    const dateReturns = fundReturns.filter(r => extractDateStr(r.return_date) === selectedDate);

    // Compute totals for this date
    const totalDisbursedOnDate = dateAllocations.filter(a => a.is_received_by_employee).reduce((acc, a) => acc + Number(a.amount || 0), 0);
    const totalApprovedExpenseOnDate = approvedDateExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const totalReturnedOnDate = dateReturns.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const totalPendingOnDate = pendingDateExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

    // Employees who received money on this date
    const recipientsOnDate = Array.from(new Set(dateAllocations.map(a => a.user_id)));

    // Opening balance & closing balance
    const openingBalance = officeSummary.opening_balance || 40000;
    const closingBalance = openingBalance + totalReturnedOnDate - totalDisbursedOnDate;

    // Total remaining funds with all employees
    const totalRemainingWithEmployees = users.filter(u => u.role === 'employee').reduce((acc, u) => {
        return acc + (u.balance_summary?.remaining_office_funds || 0);
    }, 0);

    // Total employee payables
    const totalEmployeePayables = users.filter(u => u.role === 'employee').reduce((acc, u) => {
        return acc + (u.balance_summary?.employee_payable || 0);
    }, 0);

    // Handle Print
    const handlePrint = () => {
        window.print();
    };

    // Export to Excel using XLSX
    const handleExportExcel = () => {
        const rows = [
            ['NEXGEN INNOVATIONS LTD. - DAILY EXPENSE REPORT'],
            [`Date: ${selectedDate}`, `Generated: ${new Date().toLocaleString()}`],
            [''],
            ['SUMMARY'],
            ['Opening Balance', openingBalance],
            ['Total Disbursed', totalDisbursedOnDate],
            ['Total Approved Expenses', totalApprovedExpenseOnDate],
            ['Total Returned', totalReturnedOnDate],
            ['Closing Balance', closingBalance],
            [''],
            ['ITEMIZED EXPENSES FOR THE DAY'],
            ['Employee ID', 'Employee Name', 'Category', 'Description', 'Amount (BDT)', 'Status'],
            ...dateExpenses.map(e => [
                e.user?.employee_id || '',
                e.user?.name || '',
                e.category_name || '',
                e.description || '',
                e.amount,
                e.status,
            ]),
            [''],
            ['FUND DISBURSEMENTS FOR THE DAY'],
            ['Employee ID', 'Employee Name', 'Provider', 'Method', 'Amount (BDT)', 'Confirmed'],
            ...dateAllocations.map(a => [
                a.user?.employee_id || '',
                a.user?.name || '',
                a.money_provider,
                a.payment_method,
                a.amount,
                a.is_received_by_employee ? 'Yes' : 'Pending',
            ]),
            [''],
            ['EMPLOYEE BALANCES SUMMARY'],
            ['Employee ID', 'Employee Name', 'Remaining Office Funds', 'Employee Payable (পাওনা)', 'Pending Claims'],
            ...users.filter(u => u.role === 'employee').map(u => [
                u.employee_id || '',
                u.name || '',
                u.balance_summary?.remaining_office_funds || 0,
                u.balance_summary?.employee_payable || 0,
                u.balance_summary?.pending_claims || 0,
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
        XLSX.writeFile(wb, `Office_Expense_Report_${selectedDate}.xlsx`);
    };

    return (
        <div className="space-y-6">
            
            {/* Control Bar (Hidden when printing) */}
            <div className="no-print p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span>স্বয়ংক্রিয় অফিস রিপোর্ট ও PDF ইঞ্জিন</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        দৈনিক অডিট খতিয়ান, কর্মচারীভিত্তিক হিসাব, প্রিন্ট ও এক্সপোর্ট
                    </p>
                </div>

                {/* Actions: Date Picker, Type, Print, Excel */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 flex items-center gap-1.5"
                    >
                        <Printer className="w-4 h-4" />
                        <span>প্রিন্ট / PDF সেভ করুন</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleExportExcel}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Excel এক্সপোর্ট</span>
                    </button>

                    {activeRole === 'admin' && (
                        <button
                            type="button"
                            onClick={onOpenClosingModal}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                            <Lock className="w-4 h-4" />
                            <span>ডেইলি ক্লোজিং</span>
                        </button>
                    )}
                </div>
            </div>

            {/* A4 Printable Official PDF Canvas Container */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 max-w-5xl mx-auto space-y-6 print:p-0 print:border-none print:shadow-none print:m-0">
                
                {/* 1. Header with Company Logo & Report Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-2xl shadow-md">
                            N
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                                NEXGEN INNOVATIONS LTD.
                            </h1>
                            <p className="text-xs font-semibold text-slate-600 tracking-wider">
                                OFFICE EXPENSE & FUND MANAGEMENT SYSTEM
                            </p>
                            <p className="text-[11px] text-slate-500">
                                কর্পোরেট হেড অফিস, ঢাকা, বাংলাদেশ • হিসাবরক্ষণ বিভাগ
                            </p>
                        </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                        <div className="inline-block px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-xs">
                            DAILY EXPENSE REPORT (PDF)
                        </div>
                        <div className="text-xs text-slate-700">
                            রিপোর্টের তারিখ: <strong>{formatDate(selectedDate, useBanglaDigits)}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                            Ref: RPT-{selectedDate.replace(/-/g, '')}-{(recipientsOnDate.length * 7 + 101)}
                        </div>
                    </div>
                </div>

                {/* 2. Office Financial Summary Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                        <span className="text-slate-500 block text-[11px]">মোট কর্মচারী:</span>
                        <span className="text-base font-black text-slate-900">
                            {users.filter(u => u.role === 'employee').length} জন
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-500 block text-[11px]">আজ টাকা পেয়েছে:</span>
                        <span className="text-base font-black text-indigo-700">
                            {recipientsOnDate.length} জন
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-500 block text-[11px]">আজ মোট বিতরণ:</span>
                        <span className="text-base font-black text-indigo-700">
                            {formatCurrency(totalDisbursedOnDate, useBanglaDigits)}
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-500 block text-[11px]">আজ অনুমোদিত খরচ:</span>
                        <span className="text-base font-black text-emerald-700">
                            {formatCurrency(totalApprovedExpenseOnDate, useBanglaDigits)}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-500 block text-[11px]">অফিসে ফেরত এসেছে:</span>
                        <span className="text-base font-black text-rose-700">
                            {formatCurrency(totalReturnedOnDate, useBanglaDigits)}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-500 block text-[11px]">দিন শেষের ক্লোজিং:</span>
                        <span className="text-base font-black text-slate-900">
                            {formatCurrency(closingBalance, useBanglaDigits)}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-500 block text-[11px]">কর্মচারীদের কাছে অবশিষ্ট:</span>
                        <span className="text-base font-black text-blue-700">
                            {formatCurrency(totalRemainingWithEmployees, useBanglaDigits)}
                        </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                        <span className="text-slate-500 block text-[11px]">অফিসের কাছে মোট পাওনা:</span>
                        <span className="text-base font-black text-amber-700">
                            {formatCurrency(totalEmployeePayables, useBanglaDigits)}
                        </span>
                    </div>
                </div>

                {/* 3. Section: Fund Disbursed Today */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between pb-1 border-b border-slate-300">
                        <span>১. সেদিন টাকা গ্রহণকারী কর্মচারীদের বিবরণ (Disbursements)</span>
                        <span className="text-slate-500 font-normal">মোট: {formatCurrency(totalDisbursedOnDate, useBanglaDigits)}</span>
                    </h3>

                    {dateAllocations.length > 0 ? (
                        <table className="w-full text-left text-xs border border-slate-200">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="p-2 border border-slate-200">ID</th>
                                    <th className="p-2 border border-slate-200">কর্মচারীর নাম</th>
                                    <th className="p-2 border border-slate-200">টাকা প্রদানকারী</th>
                                    <th className="p-2 border border-slate-200">মাধ্যম</th>
                                    <th className="p-2 border border-slate-200">পরিমাণ</th>
                                    <th className="p-2 border border-slate-200">স্ট্যাটাস</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateAllocations.map(a => (
                                    <tr key={a.id} className="border-b border-slate-200">
                                        <td className="p-2 border border-slate-200 font-mono">{a.user?.employee_id}</td>
                                        <td className="p-2 border border-slate-200 font-bold">{a.user?.name}</td>
                                        <td className="p-2 border border-slate-200">{a.money_provider}</td>
                                        <td className="p-2 border border-slate-200">{a.payment_method}</td>
                                        <td className="p-2 border border-slate-200 font-bold text-indigo-700">{formatCurrency(a.amount, useBanglaDigits)}</td>
                                        <td className="p-2 border border-slate-200">
                                            {a.is_received_by_employee ? '✓ বুঝে পেয়েছে' : 'অপেক্ষমান'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-xs text-slate-400 italic py-1">এই তারিখে নতুন কোনো ফান্ড বিতরণ করা হয়নি।</p>
                    )}
                </div>

                {/* 4. Section: Itemized Expenses on this Date */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between pb-1 border-b border-slate-300">
                        <span>২. কর্মচারীভিত্তিক প্রতিটি খরচের তালিকা (Itemized Expenses)</span>
                        <span className="text-slate-500 font-normal">অনুমোদিত মোট: {formatCurrency(totalApprovedExpenseOnDate, useBanglaDigits)}</span>
                    </h3>

                    {dateExpenses.length > 0 ? (
                        <table className="w-full text-left text-xs border border-slate-200">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="p-2 border border-slate-200">কর্মচারী</th>
                                    <th className="p-2 border border-slate-200">ক্যাটাগরি</th>
                                    <th className="p-2 border border-slate-200">বিবরণ</th>
                                    <th className="p-2 border border-slate-200">ভাউচার নং</th>
                                    <th className="p-2 border border-slate-200">পরিমাণ</th>
                                    <th className="p-2 border border-slate-200">যাচাই অবস্থা</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dateExpenses.map(e => (
                                    <tr key={e.id} className="border-b border-slate-200">
                                        <td className="p-2 border border-slate-200 font-semibold">{e.user?.name}</td>
                                        <td className="p-2 border border-slate-200">{e.category_name}</td>
                                        <td className="p-2 border border-slate-200">{e.description}</td>
                                        <td className="p-2 border border-slate-200 font-mono text-[11px]">{e.transaction_ref}</td>
                                        <td className="p-2 border border-slate-200 font-bold">{formatCurrency(e.amount, useBanglaDigits)}</td>
                                        <td className="p-2 border border-slate-200">
                                            {['approved', 'paid', 'received'].includes(e.status) ? (
                                                <span className="text-emerald-700 font-bold">✓ অনুমোদিত</span>
                                            ) : e.status === 'pending' ? (
                                                <span className="text-amber-700 font-bold">অপেক্ষমান</span>
                                            ) : e.status === 'draft' ? (
                                                <span className="text-slate-600 font-bold">ড্রাফট</span>
                                            ) : e.status === 'revision' ? (
                                                <span className="text-orange-600 font-bold">সংশোধনে</span>
                                            ) : (
                                                <span className="text-rose-700 font-bold">বাতিল</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-xs text-slate-400 italic py-1">এই তারিখে কোনো খরচের এন্ট্রি নেই।</p>
                    )}
                </div>

                {/* 5. Section: Employee Balance Ledger */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-300">
                        ৩. কর্মচারীদের বর্তমান ফান্ডের হিসাব ও ব্যালেন্স স্থিতি (Individual Balances)
                    </h3>

                    <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="p-2 border border-slate-200">কর্মচারীর নাম ও পদবি</th>
                                <th className="p-2 border border-slate-200">প্রাপ্ত ফান্ড</th>
                                <th className="p-2 border border-slate-200">অনুমোদিত খরচ</th>
                                <th className="p-2 border border-slate-200">ফেরত দেওয়া</th>
                                <th className="p-2 border border-slate-200">অবশিষ্ট অফিসের টাকা</th>
                                <th className="p-2 border border-slate-200">অফিসের কাছে পাওনা</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role === 'employee').map(u => {
                                const b = u.balance_summary || {};
                                return (
                                    <tr key={u.id} className="border-b border-slate-200">
                                        <td className="p-2 border border-slate-200">
                                            <strong>{u.name}</strong> <span className="text-slate-500">({u.employee_id})</span>
                                        </td>
                                        <td className="p-2 border border-slate-200">{formatCurrency(b.total_received || 0, useBanglaDigits)}</td>
                                        <td className="p-2 border border-slate-200">{formatCurrency(b.total_approved_expenses || 0, useBanglaDigits)}</td>
                                        <td className="p-2 border border-slate-200">{formatCurrency(b.total_returned || 0, useBanglaDigits)}</td>
                                        <td className="p-2 border border-slate-200 font-bold text-indigo-800">
                                            {formatCurrency(b.remaining_office_funds || 0, useBanglaDigits)}
                                        </td>
                                        <td className="p-2 border border-slate-200 font-bold text-amber-700">
                                            {formatCurrency(b.employee_payable || 0, useBanglaDigits)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* 6. Official 4-Column Signature Blocks */}
                <div className="pt-12 grid grid-cols-4 gap-4 text-center text-xs">
                    <div className="border-t border-slate-900 pt-2">
                        <span className="font-bold block text-slate-900">হিসাব প্রস্তুতকারী</span>
                        <span className="text-[10px] text-slate-500">অ্যাসিস্ট্যান্ট অ্যাকাউন্ট্যান্ট</span>
                    </div>

                    <div className="border-t border-slate-900 pt-2">
                        <span className="font-bold block text-slate-900">যাচাইকারী কর্মকর্তা</span>
                        <span className="text-[10px] text-slate-500">ইন্টারনাল অডিট অফিসার</span>
                    </div>

                    <div className="border-t border-slate-900 pt-2">
                        <span className="font-bold block text-slate-900">করিম চৌধুরী</span>
                        <span className="text-[10px] text-slate-500">অ্যাকাউন্টস ম্যানেজার</span>
                    </div>

                    <div className="border-t border-slate-900 pt-2">
                        <span className="font-bold block text-slate-900">তাহমিদ জামান</span>
                        <span className="text-[10px] text-slate-500">ম্যানেজিং ডিরেক্টর / সিইও</span>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                    <span>সফটওয়্যার জেনারেটেড অডিট ডকুমেন্ট • পেজ ১ / ১</span>
                    <span>তৈরির সময়: {new Date().toLocaleString()}</span>
                </div>

            </div>

            {/* Historical Daily Closings Archive */}
            <div className="no-print p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Lock className="w-4 h-4 text-indigo-600" />
                            <span>অতীত ডেইলি ক্লোজিং আর্কাইভ (Historical Closings)</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            পূর্বে সম্পন্ন করা দৈনিক হিসাবের সংরক্ষিত স্ন্যাপশট
                        </p>
                    </div>
                </div>

                <div className="space-y-2.5">
                    {dailyClosings.length > 0 ? (
                        dailyClosings.map(dc => (
                            <div 
                                key={dc.id}
                                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                            >
                                <div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                                        তারিখ: {formatDate(dc.date, useBanglaDigits)}
                                    </span>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        ওপেনিং: ৳{dc.opening_balance} • মোট বিতরণ: ৳{dc.total_disbursed} • খরচ: ৳{dc.total_approved_expenses} • ক্লোজিং: ৳{dc.closing_balance}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedDate(dc.date)}
                                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    এই রিপোর্টটি লোড করুন
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-400 italic">কোনো অতীত ক্লোজিং রেকর্ড নেই।</p>
                    )}
                </div>
            </div>

        </div>
    );
}
