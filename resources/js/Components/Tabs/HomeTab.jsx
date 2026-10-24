import React from 'react';
import { 
    ReceiptText, 
    HandCoins, 
    Scale, 
    Calendar, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    CheckCircle, 
    PlusCircle,
    User,
    Tag,
    Clock
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function HomeTab({
    advances = [],
    expenses = [],
    role = 'admin',
    selectedPerson = '',
    useBanglaDigits = true,
    onOpenAdvance,
    onOpenExpense,
    setActiveTab,
}) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter by role/person if employee
    const filteredAdvances = role === 'employee' 
        ? advances.filter(a => a.person === selectedPerson) 
        : advances;
    
    const filteredExpenses = role === 'employee' 
        ? expenses.filter(e => e.person === selectedPerson) 
        : expenses;

    // Metrics
    const todayExpenses = filteredExpenses.filter(e => e.date === todayStr);
    const todayTotal = todayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const thisMonthExpenses = filteredExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalAdvances = filteredAdvances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const totalExpensesAll = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Net balance
    const netBalance = totalAdvances - totalExpensesAll;

    // Recent items combined
    const combinedRecent = [
        ...filteredAdvances.map(a => ({
            id: `adv-${a.id}`,
            type: 'advance',
            title: a.purpose || 'টাকা গ্রহণ (অগ্রিম)',
            person: a.person,
            amount: a.amount,
            date: a.date_time ? a.date_time.slice(0, 10) : todayStr,
            badge: a.from_who || 'কোম্পানি ফান্ড',
        })),
        ...filteredExpenses.map(e => ({
            id: `exp-${e.id}`,
            type: 'expense',
            title: e.note || e.category,
            category: e.category,
            person: e.person,
            amount: e.amount,
            date: e.date,
            hasReceipt: !!e.receipt_image,
        })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

    return (
        <div className="space-y-6">
            
            {/* Balance Status Banner (Core Balance Display) */}
            <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
                netBalance > 0
                    ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-700/60'
                    : netBalance < 0
                    ? 'bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent border-cyan-300 dark:border-cyan-700/60'
                    : 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-300 dark:border-emerald-700/60'
            }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                                {role === 'employee' ? `${selectedPerson} এর ব্যালেন্স অবস্থা` : 'সার্বিক ব্যালেন্স স্থিতি'}
                            </span>
                            {netBalance === 0 && (
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> হিসাব সমান
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            {netBalance > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400">
                                    {role === 'employee' ? 'আপনাকে ফেরত দিতে হবে ' : 'কোম্পানি ফেরত পাবে '}
                                    {formatCurrency(netBalance, useBanglaDigits)}
                                </span>
                            ) : netBalance < 0 ? (
                                <span className="text-indigo-600 dark:text-cyan-400">
                                    {role === 'employee' ? 'আপনি পাবেন ' : 'কোম্পানি প্রদান করবে '}
                                    {formatCurrency(Math.abs(netBalance), useBanglaDigits)}
                                </span>
                            ) : (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    হিসাব সম্পূর্ণ সমান (৳ ০)
                                </span>
                            )}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            {netBalance > 0
                                ? 'গৃহীত অগ্রিমের চেয়ে মোট খরচ কম হয়েছে। অবশিষ্ট উদ্বৃত্ত টাকা সমন্বয় বা ফেরতযোগ্য।'
                                : netBalance < 0
                                ? 'গৃহীত অগ্রিমের চেয়ে অতিরিক্ত খরচ হয়েছে। অতিরিক্ত টাকা অফিস থেকে পরিশোধযোগ্য।'
                                : 'গৃহীত অগ্রিম এবং খরচকৃত টাকা সমান সমান রয়েছে।'}
                        </p>
                    </div>

                    <button
                        onClick={() => setActiveTab('balance')}
                        className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                    >
                        <Scale className="w-4 h-4 text-indigo-500" />
                        <span>বিস্তারিত হিসাব দেখুন</span>
                    </button>
                </div>
            </div>

            {/* Quick Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                
                {/* Today's Expense */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold">আজকের খরচ</span>
                        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(todayTotal, useBanglaDigits)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        {todayExpenses.length} টি এন্ট্রি
                    </div>
                </div>

                {/* This Month's Expense */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold">এই মাসের মোট খরচ</span>
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(thisMonthTotal, useBanglaDigits)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        চলতি মাসের মোট ভাউচার
                    </div>
                </div>

                {/* Total Advances */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold">মোট অগ্রিম গ্রহণ</span>
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <HandCoins className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(totalAdvances, useBanglaDigits)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        {filteredAdvances.length} টি অগ্রিম তহবিল
                    </div>
                </div>

                {/* Total Expense Ever */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                        <span className="text-xs font-bold">মোট খরচ হিসাব</span>
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(totalExpensesAll, useBanglaDigits)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        {filteredExpenses.length} টি মোট খরচ
                    </div>
                </div>

            </div>

            {/* Quick Action Big Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={onOpenAdvance}
                    className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-between text-left group"
                >
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">টাকা নিলাম</span>
                        <h3 className="text-lg font-black group-hover:translate-x-0.5 transition-transform">
                            + অগ্রিম টাকা গ্রহণ এন্ট্রি
                        </h3>
                        <p className="text-xs text-emerald-100/90">কোম্পানি থেকে অগ্রিম টাকা নেওয়া হলে এখানে যুক্ত করুন</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                        <HandCoins className="w-6 h-6 text-white" />
                    </div>
                </button>

                <button
                    onClick={onOpenExpense}
                    className="p-5 rounded-3xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-[0.98] transition-all flex items-center justify-between text-left group"
                >
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-rose-100 uppercase tracking-wider">খরচ করেছি</span>
                        <h3 className="text-lg font-black group-hover:translate-x-0.5 transition-transform">
                            + নতুন খরচ ও ভাউচার এন্ট্রি
                        </h3>
                        <p className="text-xs text-rose-100/90">যাতায়াত, নাস্তা বা অফিসের যেকোনো বিল ভাউচার</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                        <ReceiptText className="w-6 h-6 text-white" />
                    </div>
                </button>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                            সাম্প্রতিক লেনদেনসমূহ
                        </h3>
                        <p className="text-xs text-slate-400">সর্বশেষ অগ্রিম গ্রহণ ও খরচের তালিকা</p>
                    </div>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                    >
                        সব দেখুন →
                    </button>
                </div>

                {combinedRecent.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 space-y-2">
                        <ReceiptText className="w-10 h-10 mx-auto opacity-30" />
                        <p className="text-sm font-semibold">কোনো লেনদেন পাওয়া যায়নি!</p>
                        <p className="text-xs">উপরের বড় বাটন চেপে নতুন এন্ট্রি দিন অথবা "ডেমো তথ্য" লোড করুন।</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {combinedRecent.map((item) => (
                            <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-750/30 rounded-xl px-2 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                        item.type === 'advance'
                                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                    }`}>
                                        {item.type === 'advance' ? (
                                            <ArrowDownRight className="w-5 h-5" />
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                                                {item.title}
                                            </p>
                                            {item.category && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>{item.person}</span>
                                            <span>•</span>
                                            <span>{formatDate(item.date, useBanglaDigits)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className={`text-sm sm:text-base font-extrabold ${
                                        item.type === 'advance'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                        {item.type === 'advance' ? '+' : '-'} {formatCurrency(item.amount, useBanglaDigits)}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {item.type === 'advance' ? 'অগ্রিম ফান্ড' : 'অফিস খরচ'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
