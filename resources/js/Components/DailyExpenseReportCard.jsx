import React, { useState, useMemo } from 'react';
import { 
    Calendar, 
    User, 
    Receipt, 
    Wallet, 
    CheckCircle2, 
    Clock, 
    RotateCcw, 
    Layers, 
    ZoomIn, 
    FileCheck, 
    Check, 
    AlertCircle, 
    ChevronDown, 
    ChevronUp,
    Printer
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { openDailyExpensePdf } from '../utils/dailyExpensePdf';

export default function DailyExpenseReportCard({
    reportKey,
    userId,
    user,
    date,
    expenses = [],
    allocations = [],
    onApproveDay,
    onRevisionDay,
    onViewReceipt,
    useBanglaDigits = true,
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter allocations for this user and this date
    const dayAllocations = (allocations || []).filter(alloc => {
        if (alloc.user_id !== userId) return false;
        const aDate = alloc.disbursed_at ? alloc.disbursed_at.split('T')[0] : '';
        return aDate === date && alloc.is_received_by_employee;
    });

    const allocatedAmount = useMemo(() => {
        const direct = dayAllocations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        if (direct > 0) return direct;
        return Number(user?.balance_summary?.remaining_office_funds) || 0;
    }, [dayAllocations, user]);

    const totalExpense = useMemo(() => {
        return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    }, [expenses]);

    const remainingBalance = allocatedAmount - totalExpense;

    // Category Breakdown (Requirement 5)
    const categoryBreakdown = useMemo(() => {
        const map = {};
        expenses.forEach(exp => {
            const cat = exp.category_name || 'অন্যান্য';
            map[cat] = (map[cat] || 0) + (Number(exp.amount) || 0);
        });
        return Object.entries(map).map(([name, sum]) => ({ name, sum }));
    }, [expenses]);

    // Overall Status
    const isPending = expenses.some(exp => exp.status === 'pending');
    const isAllApproved = expenses.every(exp => exp.status === 'approved' || exp.status === 'paid' || exp.status === 'received');
    const isRevision = expenses.some(exp => exp.status === 'revision');

    const handleConfirmRevision = (e) => {
        e.preventDefault();
        if (!revisionNotes.trim()) {
            alert('সংশোধনের সুনির্দিষ্ট কারণ বা নির্দেশনা অবশ্যই লিখুন।');
            return;
        }

        setIsSubmitting(true);
        onRevisionDay(userId, date, revisionNotes.trim(), () => {
            setIsSubmitting(false);
            setIsRevisionModalOpen(false);
            setRevisionNotes('');
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
            
            {/* Report Header */}
            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                        {user?.name ? user.name.charAt(0) : 'E'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {user?.name || 'কর্মচারী'}
                            </h4>
                            <span className="text-[11px] font-mono text-slate-400">
                                ({user?.employee_id || 'ID'})
                            </span>
                            {/* Status Badge */}
                            {isPending ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                                    <Clock className="w-3 h-3" /> জমা হয়েছে / যাচাই বাকি
                                </span>
                            ) : isRevision ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                                    <RotateCcw className="w-3 h-3" /> সংশোধনে ফেরত
                                </span>
                            ) : isAllApproved ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="w-3 h-3" /> সম্পূর্ণ রিপোর্ট অনুমোদিত
                                </span>
                            ) : null}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>তারিখ: <strong>{formatDate(date, useBanglaDigits)}</strong></span>
                            <span>• মোট {expenses.length}টি খরচের পূর্ণাঙ্গ রিপোর্ট</span>
                        </p>
                    </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2">
                    {isPending && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsRevisionModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors flex items-center gap-1"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>সংশোধনে ফেরত</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onApproveDay(userId, date)}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>সম্পূর্ণ রিপোর্ট অনুমোদন</span>
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => openDailyExpensePdf({
                            user,
                            date,
                            expenses,
                            allocatedAmount,
                            useBanglaDigits,
                        })}
                        className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        title="এই দিনের খরচের পূর্ণাঙ্গ ভাউচার PDF ডাউনলোড / প্রিন্ট করুন"
                    >
                        <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>PDF ভাউচার</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'লুকান' : 'বিস্তারিত দেখুন'}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Financial Highlights Bar (Requirement 1 & 5) */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                        বরাদ্দকৃত টাকা (Allocation)
                    </span>
                    <div className="text-lg font-black text-indigo-950 dark:text-indigo-100">
                        {formatCurrency(allocatedAmount, useBanglaDigits)}
                    </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                        সারাদিনের মোট খরচ (Total Spent)
                    </span>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(totalExpense, useBanglaDigits)}
                    </div>
                </div>

                <div className={`p-3 rounded-2xl border ${
                    remainingBalance >= 0 
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50' 
                        : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50'
                }`}>
                    <span className={`text-[11px] font-semibold block mb-0.5 ${
                        remainingBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                    }`}>
                        {remainingBalance >= 0 ? 'অবশিষ্ট টাকা (Remaining)' : 'অতিরিক্ত খরচ (পকেট ক্লেইম)'}
                    </span>
                    <div className={`text-lg font-black ${
                        remainingBalance >= 0 ? 'text-emerald-950 dark:text-emerald-100' : 'text-amber-950 dark:text-amber-100'
                    }`}>
                        {formatCurrency(Math.abs(remainingBalance), useBanglaDigits)}
                    </div>
                </div>
            </div>

            {/* Category-wise Breakdown (Requirement 5) */}
            {categoryBreakdown.length > 0 && (
                <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>খাতভিত্তিক হিসাব:</span>
                    </span>
                    {categoryBreakdown.map((cat, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200">
                            <strong>{cat.name}:</strong> <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(cat.sum, useBanglaDigits)}</span>
                        </span>
                    ))}
                </div>
            )}

            {/* Itemized Table (Collapsible) */}
            {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((exp, idx) => (
                        <div key={exp.id} className="p-3.5 sm:px-4 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {exp.category_name}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                            exp.fund_source === 'own_pocket' 
                                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' 
                                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                        }`}>
                                            {exp.fund_source === 'own_pocket' ? 'পকেট খরচ' : 'অগ্রিম ফান্ড'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        {exp.description}
                                        {exp.other_reason && ` [অন্যান্য কারণ: ${exp.other_reason}]`}
                                    </p>
                                    {exp.revision_notes && exp.status === 'revision' && (
                                        <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5 font-medium">
                                            📝 রিভিশন নোট: {exp.revision_notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {exp.receipt_image && (
                                    <button
                                        type="button"
                                        onClick={() => onViewReceipt(exp.receipt_image, `রসিদ - ${exp.category_name} (${formatCurrency(exp.amount, useBanglaDigits)})`)}
                                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px] transition-colors"
                                        title="রসিদ বা ভাউচার বড় করে দেখুন"
                                    >
                                        <ZoomIn className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>রসিদ</span>
                                    </button>
                                )}
                                <div className="text-right">
                                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                                        {formatCurrency(exp.amount, useBanglaDigits)}
                                    </span>
                                    <span className={`text-[10px] font-semibold capitalize ${
                                        exp.status === 'approved' ? 'text-emerald-600' : exp.status === 'revision' ? 'text-orange-500' : 'text-amber-500'
                                    }`}>
                                        {exp.status === 'approved' ? 'অনুমোদিত' : exp.status === 'revision' ? 'সংশোধনে' : 'যাচাই বাকি'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Revision Modal for Admin */}
            {isRevisionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <RotateCcw className="w-4 h-4 text-orange-500" />
                                <span>সম্পূর্ণ রিপোর্ট সংশোধনে ফেরত পাঠান</span>
                            </h4>
                            <button onClick={() => setIsRevisionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleConfirmRevision} className="mt-3 space-y-3">
                            <p className="text-xs text-slate-500">
                                <strong>{user?.name}</strong>-এর {formatDate(date, useBanglaDigits)} তারিখের সম্পূর্ণ বিলটি সংশোধনের জন্য ফেরত পাঠানো হবে। কি কি সংশোধন করতে হবে তা স্পষ্টভাবে লিখুন:
                            </p>
                            <textarea
                                value={revisionNotes}
                                onChange={(e) => setRevisionNotes(e.target.value)}
                                rows={3}
                                placeholder="যেমন: খাবার ও যাতায়াতের রসিদ পরিষ্কারভাবে আপলোড করুন..."
                                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                                required
                            />
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsRevisionModalOpen(false)}
                                    className="px-3 py-2 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'পাঠানো হচ্ছে...' : 'সংশোধনে ফেরত পাঠান'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
