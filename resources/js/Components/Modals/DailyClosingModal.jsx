import React, { useState } from 'react';
import { X, Lock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, formatDate, getLocalDateStr } from '../../utils/formatters';

export default function DailyClosingModal({
    isOpen,
    onClose,
    officeSummary = {},
    useBanglaDigits = true,
}) {
    if (!isOpen) return null;

    const [date, setDate] = useState(() => getLocalDateStr());
    const [notes, setNotes] = useState('দৈনিক হিসাব পর্যালোচনা ও ক্যাশ বাক্স সমন্বয় সম্পন্ন।');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/daily-closing', {
            date,
            notes: notes.trim(),
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
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                দৈনিক অফিস ক্লোজিং সম্পন্ন করুন
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                আজকের আর্থিক হিসাব লক করে পরবর্তী দিনের ওপেনিং ব্যালেন্স তৈরি
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Day Summary Review */}
                <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">আজকের ওপেনিং ব্যালেন্স:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(officeSummary.opening_balance || 40000, useBanglaDigits)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">আজ মোট বিতরণ (Disbursed):</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            - {formatCurrency(officeSummary.today_disbursed || 0, useBanglaDigits)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">আজ মোট অনুমোদিত খরচ:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(officeSummary.today_approved_expenses || 0, useBanglaDigits)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">আজ মোট ফেরত এসেছে (Returned):</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            + {formatCurrency(officeSummary.today_returned || 0, useBanglaDigits)}
                        </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                        <span className="text-slate-800 dark:text-slate-200">আজকের দিন শেষের ক্লোজিং ব্যালেন্স:</span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(officeSummary.closing_balance || 0, useBanglaDigits)}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            ক্লোজিং তারিখ <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            অফিসিয়াল মন্তব্য বা অডিট নোট
                        </label>
                        <textarea
                            rows="2"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="যেমন: ক্যাশ ড্রয়ার গুনে মিলানো হয়েছে"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            <span>{isSubmitting ? 'লক হচ্ছে...' : 'ক্লোজিং সম্পন্ন ও সেভ করুন'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
