import React, { useState } from 'react';
import { 
    RotateCcw, 
    Plus, 
    Search, 
    CheckCircle2, 
    Clock, 
    Wallet, 
    ArrowDownRight, 
    User, 
    ShieldCheck, 
    Calendar 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ReturnsTab({
    activeRole = 'admin',
    activeUser = null,
    fundReturns = [],
    users = [],
    onOpenReturnModal,
    useBanglaDigits = true,
}) {
    const isEmployee = activeRole === 'employee';
    const [searchQuery, setSearchQuery] = useState('');

    // Employees with active office funds (Admin only)
    const employeesWithFunds = !isEmployee ? users.filter(u => u.role === 'employee' && (u.balance_summary?.remaining_office_funds || 0) > 0) : [];

    const visibleReturns = fundReturns.filter(ret => {
        if (isEmployee && ret.user_id !== activeUser?.id) return false;

        return (ret.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (ret.received_by || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (ret.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (ret.transaction_ref || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalRecovered = visibleReturns.reduce((acc, r) => acc + Number(r.amount || 0), 0);

    return (
        <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        <span>{isEmployee ? 'আমার ফেরত দেওয়া টাকার তালিকা' : 'অব্যবহৃত টাকা ফেরত ও রিকভারি (Fund Recovery)'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isEmployee 
                            ? 'অফিসের কাজ শেষে আপনার দ্বারা অফিসে ফেরত দেওয়া অতিরিক্ত টাকার খতিয়ান'
                            : 'অফিসের কাজ শেষে কর্মচারীর কাছে থাকা অতিরিক্ত টাকা অফিসে ফেরত নেওয়ার খতিয়ান'}
                    </p>
                </div>

                {!isEmployee && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onOpenReturnModal(null)}
                            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/25 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>টাকা ফেরত এন্ট্রি</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Admin Snapshot: Employees with Unused Funds */}
            {!isEmployee && employeesWithFunds.length > 0 && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/60 to-slate-50 dark:from-slate-900 dark:to-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-indigo-600" />
                            <span>বর্তমানে কর্মচারীদের কাছে থাকা অব্যবহৃত টাকার তালিকা ({employeesWithFunds.length} জন)</span>
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            এক ক্লিকে ফেরত গ্রহণ করুন
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {employeesWithFunds.map(emp => (
                            <div 
                                key={emp.id}
                                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                                        {emp.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {emp.employee_id} • {emp.designation}
                                    </div>
                                    <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                                        {formatCurrency(emp.balance_summary?.remaining_office_funds || 0, useBanglaDigits)}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onOpenReturnModal(emp)}
                                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-xs font-bold transition-all"
                                >
                                    ফেরত নিন
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="কর্মচারীর নাম, গ্রহণকারী বা রেফারেন্স খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
            </div>

            {/* Returns History List */}
            <div className="space-y-3">
                {visibleReturns.length > 0 ? (
                    visibleReturns.map((ret) => (
                        <div
                            key={ret.id}
                            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-3.5">
                                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                                            {ret.user?.name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            ({ret.user?.employee_id})
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            {ret.payment_method}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                        কারণ: {ret.reason || 'অব্যবহৃত টাকা অফিসে জমা'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span>তারিখ: {formatDate(ret.return_date, useBanglaDigits)}</span>
                                        <span>•</span>
                                        <span>টাকা গ্রহণ করেছেন: <strong>{ret.received_by}</strong></span>
                                        <span>•</span>
                                        <span className="font-mono text-[11px]">Trx: #{ret.transaction_ref}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                                <div className="text-base sm:text-lg font-extrabold text-rose-600 dark:text-rose-400">
                                    + {formatCurrency(ret.amount, useBanglaDigits)}
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> অফিসে জমা নিশ্চিত
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <RotateCcw className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            কোনো টাকা ফেরতের রেকর্ড নেই
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                            অব্যবহৃত টাকা অফিসে জমা হলে এন্ট্রি দিন।
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
