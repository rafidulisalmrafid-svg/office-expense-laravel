import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowDownRight, ArrowUpRight, Check, Send } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '../../utils/formatters';

export default function FinishProjectModal({
    isOpen,
    onClose,
    project,
    activeUser,
    useBanglaDigits = true,
}) {
    if (!isOpen || !project) return null;

    const summary = project.financial_summary || {
        allocated_amount: 0,
        total_spent: 0,
        remaining_balance: 0,
    };

    const allocated = Number(summary.allocated_amount) || 0;
    const spent = Number(summary.total_spent) || 0;
    const balance = allocated - spent;

    const isRefundToOffice = balance > 0;
    const isReimbursementToEmployee = balance < 0;
    const isBalanced = balance === 0;

    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/projects/${project.id}/finish`, {
            user_id: activeUser?.id,
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
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                প্রজেক্ট সমাপ্তি ও ফাইনাল সেটেলমেন্ট
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {project.name} ({project.code})
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

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Financial Summary Card */}
                    <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
                        <div>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">মোট বরাদ্দ</span>
                            <span className="block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                                {formatCurrency(allocated, useBanglaDigits)}
                            </span>
                        </div>
                        <div className="border-x border-slate-200 dark:border-slate-700">
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">মোট খরচ</span>
                            <span className="block text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                {formatCurrency(spent, useBanglaDigits)}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">ব্যালেন্স</span>
                            <span className={`block text-sm sm:text-base font-extrabold mt-0.5 ${
                                isRefundToOffice 
                                    ? 'text-emerald-600 dark:text-emerald-400' 
                                    : isReimbursementToEmployee 
                                        ? 'text-rose-600 dark:text-rose-400' 
                                        : 'text-slate-700 dark:text-slate-300'
                            }`}>
                                {formatCurrency(Math.abs(balance), useBanglaDigits)}
                            </span>
                        </div>
                    </div>

                    {/* Settlement Outcome Status Banner */}
                    {isRefundToOffice && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                                <ArrowDownRight className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                    আপনাকে অফিসে ফেরত দিতে হবে: {formatCurrency(balance, useBanglaDigits)}
                                </h4>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                                    বরাদ্দকৃত ২০,০০০ টাকা থেকে কম খরচ হয়েছে। অবশিষ্ট এই টাকাটি অফিসকে নগদ বা ব্যাংকে ফেরত দিতে হবে। অ্যাডমিনের অনুমোদনের পর তা সেটেলমেন্ট হিসেবে গণ্য হবে।
                                </p>
                            </div>
                        </div>
                    )}

                    {isReimbursementToEmployee && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                                    অফিস আপনাকে পরিশোধ করবে: {formatCurrency(Math.abs(balance), useBanglaDigits)}
                                </h4>
                                <p className="text-[11px] text-rose-700 dark:text-rose-300/90 mt-0.5">
                                    অনুমোদিত হিসাব অনুযায়ী আপনি নিজের টাকা থেকে অতিরিক্ত খরচ করেছেন। অ্যাডমিন যাচাই-বাছাই শেষে এই টাকাটি আপনাকে পরিশোধ করবেন।
                                </p>
                            </div>
                        </div>
                    )}

                    {isBalanced && (
                        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200">
                                    হিসাব সম্পূর্ণ সমান (০ টাকা)
                                </h4>
                                <p className="text-[11px] text-blue-700 dark:text-blue-300/90 mt-0.5">
                                    প্রজেক্টের বরাদ্দকৃত সমুদয় টাকা যথাযথ খরচে ব্যয়িত হয়েছে। কোনো ফেরত বা পাওনা নেই।
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Completion Note */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            প্রজেক্ট সমাপ্তির নোট বা মন্তব্য *
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="যেমন: ধানমন্ডি শাখার সমস্ত সিভিল ও ইলেকট্রিক কাজ সফলভাবে সম্পন্ন হয়েছে। সকল রসিদ জমা দেওয়া হলো।"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Notice */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Finish Project বাটনে চাপার পর অ্যাডমিনের কাছে চূড়ান্ত নোটিফিকেশন চলে যাবে এবং অ্যাডমিন অনুমোদন করলে প্রজেক্টটি ক্লোজ হবে।</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'হিসাব নিশ্চিত করুন ও ফিনিশ রিকোয়েস্ট পাঠান'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
