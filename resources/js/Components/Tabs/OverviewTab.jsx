import React from 'react';
import {
    Building2,
    Wallet,
    AlertCircle,
    TrendingUp,
    Clock,
    HandCoins,
    Receipt,
    Shield,
    Sparkles,
    RotateCcw,
    FileText,
    Mail,
    CheckCircle2,
    Users,
    ChevronRight
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CHART_COLORS = [
    '#6366F1', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
];

export default function OverviewTab({
    activeRole = 'admin',
    activeUser = null,
    officeSummary = {},
    chartData = {},
    activeUserPendingAllocations = [],
    onOpenRequestModal,
    onOpenExpenseModal,
    onOpenDisburseModal,
    onOpenReturnModal,
    onOpenClosingModal,
    onOpenEmailSetupModal,
    onConfirmAllocation,
    onNavigateTab,
    projects = [],
    onOpenAddExpenseForProject,
    useBanglaDigits = true,
}) {
    const isEmployee = activeRole === 'employee';
    const userBalance = activeUser?.balance_summary || {
        remaining_office_funds: 0,
        employee_payable: 0,
        pending_claims: 0,
        total_received: 0,
        total_approved_expenses: 0,
        total_returned: 0,
    };

    return (
        <div className="space-y-6">

            {/* EMPLOYEE HANDSHAKE ALERT: If money has been disbursed to active employee but unconfirmed */}
            {isEmployee && activeUserPendingAllocations.length > 0 && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                                <CheckCircle2 className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>টাকা বুঝে পেয়েছেন? প্রাপ্তি নিশ্চিত করুন!</span>
                                </h4>
                                {activeUserPendingAllocations.map(alloc => (
                                    <p key={alloc.id} className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                        <strong>{alloc.money_provider}</strong> আপনাকে <strong>{alloc.payment_method}</strong> মাধ্যমে <strong>{formatCurrency(alloc.amount, useBanglaDigits)}</strong> প্রদান করেছেন ({alloc.notes || 'বরাদ্দ'}).
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {activeUserPendingAllocations.map(alloc => (
                                <button
                                    key={alloc.id}
                                    type="button"
                                    onClick={() => onConfirmAllocation(alloc)}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>হ্যাঁ, ৳{alloc.amount} বুঝে পেয়েছি</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ADMIN PENDING REGISTRATION ALERT BANNER */}
            {!isEmployee && Number(officeSummary.pending_users_count || 0) > 0 && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-500/15 border-2 border-amber-500/30 dark:border-amber-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 animate-pulse">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                    নতুন কর্মচারী রেজিস্ট্রেশন অনুমোদন অপেক্ষায় রয়েছে
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-xs">
                                    {useBanglaDigits ? officeSummary.pending_users_count.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : officeSummary.pending_users_count} জন
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                নতুন রেজিস্টার করা কর্মচারীরা আপনার অনুমোদন ছাড়া লগইন করতে পারবে না। অনুমোদন প্রদান করলে স্বয়ংক্রিয়ভাবে তাদের মেইলে পাসওয়ার্ড চলে যাবে।
                            </p>
                        </div>
                    </div>
                    {onNavigateTab && (
                        <button
                            type="button"
                            onClick={() => onNavigateTab('employees')}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
                        >
                            <span>অনুমোদন পর্যালোচনা করুন</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* ADMIN KPI ROW OR EMPLOYEE WALLET HERO */}
            {isEmployee ? (
                <div className="space-y-6">
                    {/* Section 1: Daily Office Expense Fund (Requirement 2 & 3) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Visual Card: Daily Office Expense Fund */}
                        <div className={`lg:col-span-1 relative overflow-hidden rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between min-h-[240px] ${
                            userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                ? 'bg-gradient-to-tr from-rose-950 via-rose-900 to-red-800 border-2 border-rose-500 shadow-rose-950/30'
                                : 'bg-gradient-to-tr from-indigo-900 via-indigo-800 to-violet-800 shadow-indigo-500/20'
                        }`}>
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>

                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                        userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                            ? 'bg-rose-500/30 text-rose-200'
                                            : 'bg-white/10 text-indigo-200'
                                    }`}>
                                        দৈনিক অফিস খরচের ফান্ড
                                    </span>
                                    <h3 className="text-lg font-bold text-white mt-1">
                                        {activeUser?.name}
                                    </h3>
                                    <p className="text-xs text-indigo-200">
                                        {activeUser?.employee_id} • {activeUser?.department}
                                    </p>
                                </div>
                                <div className={`p-2.5 rounded-2xl ${
                                    userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                        ? 'bg-rose-500/30 text-rose-200'
                                        : 'bg-white/10 text-indigo-200'
                                }`}>
                                    <Building2 className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="my-3 relative z-10">
                                <span className="text-xs text-indigo-100 block">
                                    {userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                        ? 'বর্তমান অবশিষ্ট ব্যালেন্স (ঋণাত্মক)'
                                        : 'বর্তমান অবশিষ্ট অফিস ফান্ড'
                                    }
                                </span>
                                <div className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 ${
                                    userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                        ? 'text-rose-300 drop-shadow-md'
                                        : 'text-white'
                                }`}>
                                    {userBalance.remaining_office_funds < 0
                                        ? `−${formatCurrency(Math.abs(userBalance.remaining_office_funds), useBanglaDigits)}`
                                        : formatCurrency(userBalance.remaining_office_funds, useBanglaDigits)
                                    }
                                </div>
                            </div>

                            {/* Cumulative Balance Breakdown (Requirement 2 & 3) */}
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 text-xs relative z-10">
                                <div>
                                    <span className="text-[10px] text-indigo-200 block">মোট বরাদ্দ</span>
                                    <span className="font-extrabold text-white">{formatCurrency(userBalance.total_received, useBanglaDigits)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-indigo-200 block">মোট অফিস খরচ</span>
                                    <span className="font-extrabold text-white">{formatCurrency(userBalance.total_approved_expenses, useBanglaDigits)}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-indigo-200 block">
                                        {userBalance.is_overspent || userBalance.remaining_office_funds < 0 ? 'অতিরিক্ত খরচ' : 'অবশিষ্ট টাকা'}
                                    </span>
                                    <span className={`font-extrabold ${
                                        userBalance.is_overspent || userBalance.remaining_office_funds < 0 ? 'text-rose-300' : 'text-emerald-300'
                                    }`}>
                                        {formatCurrency(userBalance.is_overspent || userBalance.remaining_office_funds < 0 
                                            ? (userBalance.overspent_amount || Math.abs(userBalance.remaining_office_funds)) 
                                            : userBalance.remaining_office_funds, 
                                            useBanglaDigits
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Employee Status Metric Cards */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Remaining / Overspent Office Funds Card */}
                            <div className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between transition-colors ${
                                userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {userBalance.is_overspent || userBalance.remaining_office_funds < 0 
                                            ? 'দৈনিক অফিস খরচের ফান্ড (ঘাটতি)' 
                                            : 'দৈনিক অফিস খরচের ফান্ড (অবশিষ্ট)'}
                                    </span>
                                    <div className={`p-2 rounded-xl ${
                                        userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-2xl sm:text-3xl font-black ${
                                        userBalance.is_overspent || userBalance.remaining_office_funds < 0
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-slate-900 dark:text-white'
                                    }`}>
                                        {userBalance.remaining_office_funds < 0
                                            ? `−${formatCurrency(Math.abs(userBalance.remaining_office_funds), useBanglaDigits)}`
                                            : formatCurrency(userBalance.remaining_office_funds, useBanglaDigits)
                                        }
                                    </div>
                                    
                                    {/* Warning message if overspent (Requirement 3) */}
                                    {userBalance.is_overspent || userBalance.remaining_office_funds < 0 ? (
                                        <div className="mt-2.5 p-2 rounded-xl bg-rose-100/80 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60 text-[11px] font-bold text-rose-800 dark:text-rose-200 flex items-start gap-1.5">
                                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                            <span>
                                                সতর্কতা: বরাদ্দের চেয়ে {formatCurrency(userBalance.overspent_amount || Math.abs(userBalance.remaining_office_funds), useBanglaDigits)} বেশি খরচ হয়েছে। পরবর্তী বরাদ্দের সাথে সমন্বয় হবে।
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                                            নতুন করে অফিস খরচের টাকা বরাদ্দ দেওয়া হলে আগের অবশিষ্ট টাকার সঙ্গে যোগ হবে।
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Employee Payable (পাওনা) Card */}
                            <div className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between ${
                                userBalance.employee_payable > 0
                                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        অফিসের কাছে আপনার পাওনা (Claimable)
                                    </span>
                                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                                        {formatCurrency(userBalance.employee_payable, useBanglaDigits)}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                                        {userBalance.employee_payable > 0 
                                            ? 'বরাদ্দের অতিরিক্ত খরচের কারণে এই টাকা অফিসের কাছে আপনার দাবিযোগ্য পাওনা।'
                                            : 'অফিসের কাছে আপনার কোনো অতিরিক্ত পাওনা নেই।'}
                                    </p>
                                </div>
                            </div>

                            {/* Pending Claims Card */}
                            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        যাচাই বাকি খরচ (Pending Verification)
                                    </span>
                                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                        {formatCurrency(userBalance.pending_claims, useBanglaDigits)}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                                        যে খরচগুলো আপনি সাবমিট করেছেন কিন্তু অ্যাডমিনের চূড়ান্ত অনুমোদন বাকি।
                                    </p>
                                </div>
                            </div>

                            {/* Quick Action Button Box */}
                            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800/80 border border-indigo-100 dark:border-slate-700 shadow-xs flex flex-col justify-between">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    দ্রুত কার্যক্রম (Quick Actions)
                                </span>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={onOpenRequestModal}
                                        className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <HandCoins className="w-3.5 h-3.5" />
                                        <span>টাকা রিকোয়েস্ট</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onOpenExpenseModal}
                                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Receipt className="w-3.5 h-3.5" />
                                        <span>দৈনিক খরচ যোগ</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section 2: Isolated Project Expense Funds (Requirement 4) */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>প্রজেক্টভিত্তিক সংরক্ষিত ফান্ড (Project Expense Funds)</span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                        সম্পূর্ণ আলাদা হিসাব
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    একটি ফান্ডের টাকা অন্য ফান্ডের সঙ্গে মিশবে না। প্রজেক্টের খরচ শুধুমাত্র সংশ্লিষ্ট প্রজেক্টের বরাদ্দ থেকেই বাদ যাবে।
                                </p>
                            </div>
                        </div>

                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((proj) => {
                                    const summary = proj.financial_summary || {
                                        allocated_amount: 0,
                                        total_spent: 0,
                                        remaining_balance: 0,
                                        is_overspent: false,
                                    };
                                    const rem = summary.remaining_balance;
                                    const isNeg = summary.is_overspent || rem < 0;

                                    return (
                                        <div
                                            key={proj.id}
                                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                                isNeg
                                                    ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                                                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase">
                                                        #{proj.code}
                                                    </span>
                                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                        {proj.name}
                                                    </h4>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                                    proj.status === 'completed'
                                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                        : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                                                }`}>
                                                    {proj.status === 'completed' ? 'সম্পন্ন' : 'সক্রিয়'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/60 dark:border-slate-700/60 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block">মোট বরাদ্দ</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {formatCurrency(summary.allocated_amount, useBanglaDigits)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block">মোট খরচ</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {formatCurrency(summary.total_spent, useBanglaDigits)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 block">অবশিষ্ট টাকা</span>
                                                    <span className={`font-black ${isNeg ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'}`}>
                                                        {isNeg ? `−${formatCurrency(Math.abs(rem), useBanglaDigits)}` : formatCurrency(rem, useBanglaDigits)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 pt-1">
                                                <span className="text-[10px] text-slate-400">
                                                    🔒 অফিস ফান্ড থেকে পৃথক
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onOpenAddExpenseForProject ? onOpenAddExpenseForProject(proj) : onOpenExpenseModal()}
                                                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                                                >
                                                    খরচ এন্ট্রি
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-xs text-slate-400">
                                আপনার নামে বর্তমানে কোনো প্রজেক্ট ফান্ড বরাদ্দ করা নেই।
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Admin Master Financial KPI Cards */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    
                    {/* KPI 1: Today Disbursed */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                আজ মোট বিতরণ
                            </span>
                            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                <HandCoins className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(officeSummary.today_disbursed, useBanglaDigits)}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                            সর্বমোট: {formatCurrency(officeSummary.total_confirmed_disbursed, useBanglaDigits)}
                        </span>
                    </div>

                    {/* KPI 2: Today Expenses */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                আজ অনুমোদিত খরচ
                            </span>
                            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(officeSummary.today_approved_expenses, useBanglaDigits)}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                            সর্বমোট: {formatCurrency(officeSummary.total_approved_expenses, useBanglaDigits)}
                        </span>
                    </div>

                    {/* KPI 3: Cash in Employee Hands */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                                কর্মচারীদের কাছে অবশিষ্ট
                            </span>
                            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-lg sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                            {formatCurrency(officeSummary.total_remaining_in_employee_hands, useBanglaDigits)}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                            {officeSummary.total_employees_count} জন সক্রিয় কর্মচারী
                        </span>
                    </div>

                    {/* KPI 4: Total Employee Payables (পাওনা) */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                                কর্মচারীদের পাওনা
                            </span>
                            <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-lg sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                            {formatCurrency(officeSummary.total_employee_payables, useBanglaDigits)}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                            পকেট থেকে অতিরিক্ত খরচ
                        </span>
                    </div>

                    {/* KPI 5: Office Closing Balance */}
                    <div className="col-span-2 sm:col-span-1 p-4 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-indigo-200 truncate">
                                অফিস ক্লোজিং ব্যালেন্স
                            </span>
                            <div className="p-1.5 rounded-xl bg-white/10 text-white">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-lg sm:text-2xl font-extrabold text-white">
                            {formatCurrency(officeSummary.closing_balance, useBanglaDigits)}
                        </div>
                        <span className="text-[10px] text-indigo-300 block mt-1">
                            ক্যাশ ড্রয়ার হিসাব
                        </span>
                    </div>

                </div>
            )}

            {/* ACTION SHORTCUT BAR (For Admin) */}
            {!isEmployee && (
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            অ্যাডমিন কুইক অ্যাকশনস:
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={onOpenDisburseModal}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                            <HandCoins className="w-3.5 h-3.5" />
                            <span>টাকা বরাদ্দ করুন</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenReturnModal}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>অব্যবহৃত টাকা ফেরত নিন</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenClosingModal}
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>ডেইলি ক্লোজিং করুন</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => onNavigateTab('reports')}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>আজকের PDF রিপোর্ট</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenEmailSetupModal}
                            className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <Mail className="w-3.5 h-3.5" />
                            <span>ইমেইল সেটিংস ও টেস্ট</span>
                        </button>
                    </div>
                </div>
            )}

            {/* CHARTS ROW (Area Trend & Category Donut) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 7-Day Trend Chart */}
                <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                ৭ দিনের আর্থিক প্রবাহ ও খরচ বিশ্লেষণ (Cash Flow Trend)
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                বিতরণ বনাম অনুমোদিত খরচের তুলনা
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> বিতরণ
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> খরচ
                            </span>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.trend_data || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="disbursedGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                                    </linearGradient>
                                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                                    formatter={(value) => [`৳${value}`, '']}
                                />
                                <Area type="monotone" dataKey="disbursed" name="বিতরণকৃত" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#disbursedGrad)" />
                                <Area type="monotone" dataKey="expense" name="অনুমোদিত খরচ" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown Donut Chart */}
                <div className="lg:col-span-1 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            ক্যাটাগরিভিত্তিক খরচের ভাগ
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            অনুমোদিত ভাউচার বিশ্লেষণ
                        </p>
                    </div>

                    <div className="h-48 w-full my-2 flex items-center justify-center">
                        {chartData.category_breakdown && chartData.category_breakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.category_breakdown}
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="amount"
                                    >
                                        {chartData.category_breakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                                        formatter={(value) => [`৳${value}`, 'খরচ']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-xs text-slate-400">কোনো খরচের রেকর্ড নেই</div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {(chartData.category_breakdown || []).map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
                                    <span className="text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                                    {formatCurrency(cat.amount, useBanglaDigits)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
