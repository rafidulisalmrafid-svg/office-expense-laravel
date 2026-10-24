import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, FileText, ArrowRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function SettleModal({
    isOpen,
    onClose,
    advance,
    expenses = [],
    onSubmit,
    useBanglaDigits = true,
}) {
    if (!isOpen || !advance) return null;

    const today = new Date().toISOString().slice(0, 10);
    const [settlementDate, setSettlementDate] = useState(today);
    const [note, setNote] = useState('');

    // Calculate balance
    const linkedExpenses = expenses.filter(e => Number(e.advance_id) === Number(advance.id));
    const totalSpent = linkedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const advAmount = Number(advance.amount) || 0;
    const balance = advAmount - totalSpent;

    let balanceMessage = 'হিসাব সমান';
    let balanceColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
    let diffAmount = 0;

    if (balance > 0) {
        diffAmount = balance;
        balanceMessage = `ব্যক্তি কোম্পানিকে ফেরত দেবেন: ${formatCurrency(balance, useBanglaDigits)}`;
        balanceColor = 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200';
    } else if (balance < 0) {
        diffAmount = Math.abs(balance);
        balanceMessage = `কোম্পানি ব্যক্তিকে পরিশোধ করবে: ${formatCurrency(diffAmount, useBanglaDigits)}`;
        balanceColor = 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200';
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            advanceId: advance.id,
            settlement_date: settlementDate,
            note: note.trim() || 'হিসাব নিষ্পত্তি সম্পন্ন',
            amount: diffAmount,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white/20">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">হিসাব পরিশোধ ও নিষ্পত্তি</h3>
                            <p className="text-xs text-emerald-100">অগ্রিম ও খরচের সমন্বয় নিশ্চিত করুন</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Details */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Advance Summary Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>ব্যক্তির নাম:</span>
                            <span className="font-bold text-slate-800 dark:text-white text-sm">{advance.person}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>গৃহীত অগ্রিম টাকা:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(advance.amount, useBanglaDigits)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>মোট খরচ ভাউচার:</span>
                            <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalSpent, useBanglaDigits)}</span>
                        </div>

                        <div className={`p-3 rounded-xl border text-xs font-bold text-center mt-2 ${balanceColor}`}>
                            {balanceMessage}
                        </div>
                    </div>

                    {/* Settlement Date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            পরিশোধ / নিষ্পত্তির তারিখ
                        </label>
                        <input
                            type="date"
                            value={settlementDate}
                            onChange={(e) => setSettlementDate(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            পরিশোধের মাধ্যম বা নোট
                        </label>
                        <input
                            type="text"
                            placeholder="যেমন: নগদে ফেরত পেয়েছি, বিকাশ বা ব্যাংক ট্রান্সফার..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>পরিশোধ সম্পন্ন করুন</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
