import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, ZoomIn, Receipt, RotateCcw } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function VerifyExpenseModal({
    isOpen,
    onClose,
    expense,
    onViewReceipt,
    useBanglaDigits = true,
}) {
    if (!isOpen || !expense) return null;

    const [action, setAction] = useState('approve'); // approve, revision, reject
    const [rejectionReason, setRejectionReason] = useState('');
    const [revisionNotes, setRevisionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (action === 'reject' && !rejectionReason.trim()) {
            alert('খরচ বাতিলের সুনির্দিষ্ট কারণ অবশ্যই উল্লেখ করতে হবে।');
            return;
        }

        if (action === 'revision' && !revisionNotes.trim()) {
            alert('সংশোধনের সুনির্দিষ্ট নির্দেশনা বা কারণ অবশ্যই উল্লেখ করতে হবে।');
            return;
        }

        setIsSubmitting(true);
        router.post(`/expenses/${expense.id}/verify`, {
            action,
            rejection_reason: rejectionReason.trim(),
            revision_notes: revisionNotes.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                onClose();
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            দৈনিক খরচ ও রসিদ যাচাইকরণ
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            ট্রানজেকশন রেফারেন্স: {expense.transaction_ref}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Expense Details Card */}
                <div className="my-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">খরচকারী কর্মচারী:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{expense.user?.name} ({expense.user?.employee_id})</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">তারিখ ও ক্যাটাগরি:</span>
                        <span className="text-slate-700 dark:text-slate-300">
                            {formatDate(expense.expense_date, useBanglaDigits)} • <strong className="text-indigo-600 dark:text-indigo-400">{expense.category_name}</strong>
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">দাবিকৃত পরিমাণ:</span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(expense.amount, useBanglaDigits)}
                        </span>
                    </div>
                    <div className="pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">বিবরণ:</span> {expense.description}
                    </div>

                    {/* Special Notice: Other Reason if present */}
                    {expense.other_reason && (
                        <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200">
                            <span className="font-bold block text-[11px] text-amber-800 dark:text-amber-300 mb-1">
                                ⚠️ অন্যান্য খরচের সুনির্দিষ্ট কারণ (Employee Reason):
                            </span>
                            <p className="text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-100">
                                {expense.other_reason}
                            </p>
                        </div>
                    )}

                    {/* Receipt Preview Thumbnail */}
                    {expense.receipt_image ? (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">সংযুক্ত রসিদ/ভাউচার:</span>
                            <button
                                type="button"
                                onClick={() => onViewReceipt(expense.receipt_image, `রসিদ - ${expense.category_name} (${formatCurrency(expense.amount, useBanglaDigits)})`)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                            >
                                <ZoomIn className="w-3.5 h-3.5" />
                                <span>রসিদ দেখুন</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mt-1 pt-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                            ⚠️ কোনো রসিদ বা ভাউচার সংযুক্ত করা হয়নি।
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Decision Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            অ্যাডমিন সিদ্ধান্ত:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setAction('approve')}
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                                    action === 'approve'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 font-bold'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                                }`}
                            >
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-[11px] text-center">অনুমোদন</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAction('revision')}
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                                    action === 'revision'
                                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20 font-bold'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                                }`}
                            >
                                <RotateCcw className="w-4 h-4 text-amber-600" />
                                <span className="text-[11px] text-center">সংশোধনে ফেরত</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAction('reject')}
                                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                                    action === 'reject'
                                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20 font-bold'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                                }`}
                            >
                                <XCircle className="w-4 h-4 text-rose-500" />
                                <span className="text-[11px] text-center">বাতিল করুন</span>
                            </button>
                        </div>
                    </div>

                    {/* Revision Note */}
                    {action === 'revision' && (
                        <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 animate-in fade-in duration-200">
                            <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                                সংশোধনের কারণ ও নির্দেশনা (বাধ্যতামূলক) <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="2"
                                required
                                value={revisionNotes}
                                onChange={(e) => setRevisionNotes(e.target.value)}
                                placeholder="যেমন: রসিদের ছবি অস্পষ্ট, অনুগ্রহ করে পরিষ্কার ছবি আপলোড করে আবার সাবমিট করুন..."
                                className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                            />
                        </div>
                    )}

                    {/* Rejection Note */}
                    {action === 'reject' && (
                        <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 animate-in fade-in duration-200">
                            <label className="block text-xs font-bold text-rose-900 dark:text-rose-200 mb-1">
                                বাতিলের কারণ (বাধ্যতামূলক) <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows="2"
                                required
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="যেমন: ব্যক্তিগত খরচ বা অযৌক্তিক খরচের দাবি..."
                                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            বন্ধ করুন
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 ${
                                action === 'reject'
                                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                                    : action === 'revision'
                                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                            }`}
                        >
                            {isSubmitting ? 'সেভ হচ্ছে...' : (
                                action === 'revision' ? 'সংশোধনে পাঠান' : action === 'reject' ? 'বাতিল করুন' : 'অনুমোদন কার্যকর করুন'
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
