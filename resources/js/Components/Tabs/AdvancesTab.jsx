import React, { useState } from 'react';
import { 
    HandCoins, 
    Plus, 
    Calendar, 
    User, 
    CheckCircle2, 
    Trash2, 
    Search, 
    Clock, 
    Building, 
    AlertCircle,
    ReceiptText
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function AdvancesTab({
    advances = [],
    expenses = [],
    role = 'admin',
    selectedPerson = '',
    useBanglaDigits = true,
    onOpenAdvance,
    onSettleAdvance,
    onDeleteAdvance,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, settled

    // Filter by role/person
    const personFiltered = role === 'employee'
        ? advances.filter(a => a.person === selectedPerson)
        : advances;

    const filtered = personFiltered.filter(a => {
        const matchesSearch = 
            (a.person && a.person.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.purpose && a.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.from_who && a.from_who.toLowerCase().includes(searchTerm.toLowerCase()));

        if (statusFilter === 'active') return matchesSearch && !a.is_settled;
        if (statusFilter === 'settled') return matchesSearch && a.is_settled;
        return matchesSearch;
    });

    const totalAmount = filtered.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

    return (
        <div className="space-y-6">
            
            {/* Header & Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <HandCoins className="w-6 h-6 text-emerald-600" />
                        <span>টাকা গ্রহণ ও অগ্রিম তহবিল (Advances)</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        অফিস বা কোম্পানি থেকে গৃহীত সকল অগ্রিম টাকার হিসাব
                    </p>
                </div>

                <button
                    onClick={onOpenAdvance}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ নতুন অগ্রিম গ্রহণ</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="নাম বা উদ্দেশ্য দিয়ে খুঁজুন..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'all'
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                        সকল ({personFiltered.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'active'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                        চলমান ({personFiltered.filter(a => !a.is_settled).length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('settled')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'settled'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                        পরিশোধিত ({personFiltered.filter(a => a.is_settled).length})
                    </button>
                </div>
            </div>

            {/* Advances Grid / Cards */}
            {filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
                    <HandCoins className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                        কোনো অগ্রিম তহবিল পাওয়া যায়নি
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        নতুন কোনো অগ্রিম টাকা নেওয়া হলে উপরের "+ নতুন অগ্রিম গ্রহণ" বাটনে ক্লিক করে যুক্ত করুন।
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((adv) => {
                        // Calculate expenses linked to this advance
                        const linked = expenses.filter(e => Number(e.advance_id) === Number(adv.id));
                        const totalSpent = linked.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                        const balance = (Number(adv.amount) || 0) - totalSpent;

                        return (
                            <div
                                key={adv.id}
                                className={`p-5 rounded-3xl bg-white dark:bg-slate-800 border transition-all shadow-xs space-y-4 ${
                                    adv.is_settled
                                        ? 'border-slate-200 dark:border-slate-700 opacity-80'
                                        : 'border-emerald-200 dark:border-emerald-800/60 ring-1 ring-emerald-500/10'
                                }`}
                            >
                                {/* Top Row */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                {adv.person}
                                            </span>
                                            {adv.is_settled ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> পরিশোধিত
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    চলমান হিসাব
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            উৎস: {adv.from_who || 'কোম্পানি ফান্ড'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(adv.amount, useBanglaDigits)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            গৃহীত অগ্রিম
                                        </div>
                                    </div>
                                </div>

                                {/* Purpose text */}
                                {adv.purpose && (
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-xs text-slate-700 dark:text-slate-300">
                                        <span className="font-semibold text-slate-500">উদ্দেশ্য:</span> {adv.purpose}
                                    </div>
                                )}

                                {/* Progress & Balance Calculation */}
                                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 dark:text-slate-400">মোট খরচ হয়েছে ({linked.length} টি ভাউচার):</span>
                                        <span className="font-bold text-rose-600 dark:text-rose-400">
                                            {formatCurrency(totalSpent, useBanglaDigits)}
                                        </span>
                                    </div>

                                    {/* Balance status line */}
                                    <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                                        balance > 0
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-300'
                                            : balance < 0
                                            ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 text-cyan-800 dark:text-cyan-300'
                                            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                                    }`}>
                                        <span>
                                            {balance > 0
                                                ? (role === 'employee' ? 'আপনাকে ফেরত দিতে হবে' : 'কোম্পানি ফেরত পাবে')
                                                : balance < 0
                                                ? (role === 'employee' ? 'আপনি পাবেন' : 'কোম্পানি প্রদান করবে')
                                                : 'হিসাব সমান'}
                                        </span>
                                        <span className="text-sm">
                                            {balance === 0 ? '৳ ০' : formatCurrency(Math.abs(balance), useBanglaDigits)}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Info & Actions */}
                                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                                    <div className="flex items-center gap-1 text-[11px]">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDateTime(adv.date_time, useBanglaDigits)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Settle button */}
                                        {!adv.is_settled && (
                                            <button
                                                onClick={() => onSettleAdvance(adv)}
                                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>পরিশোধ হয়েছে</span>
                                            </button>
                                        )}

                                        {/* Delete button (Admin only) */}
                                        {role === 'admin' && (
                                            <button
                                                onClick={() => onDeleteAdvance(adv)}
                                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                                                title="মুছে ফেলুন"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
