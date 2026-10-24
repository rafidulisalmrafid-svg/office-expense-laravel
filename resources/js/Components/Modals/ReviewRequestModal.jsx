import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ReviewRequestModal({
    isOpen,
    onClose,
    request,
    useBanglaDigits = true,
}) {
    if (!isOpen || !request) return null;

    const [action, setAction] = useState('approve'); // approve, partially_approve, reject
    const [approvedAmount, setApprovedAmount] = useState(request.requested_amount);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (action === 'reject' && !rejectionReason.trim()) {
            alert('প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।');
            return;
        }

        if ((action === 'approve' || action === 'partially_approve') && (!approvedAmount || Number(approvedAmount) <= 0)) {
            alert('অনুমোদিত ফান্ডের পরিমাণ অবশ্যই ১ টাকার বেশি হতে হবে।');
            return;
        }

        setIsSubmitting(true);
        router.post(`/fund-requests/${request.id}/review`, {
            action,
            approved_amount: Number(approvedAmount),
            rejection_reason: rejectionReason.trim(),
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
                            ফান্ড রিকোয়েস্ট যাচাই ও পর্যালোচনা
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            অনুরোধ নম্বর: #{request.id} • তারিখ: {formatDate(request.created_at, useBanglaDigits)}
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

                {/* Request Details Card */}
                <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">কর্মচারী:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{request.user?.name} ({request.user?.employee_id})</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">পদবি ও বিভাগ:</span>
                        <span className="text-slate-700 dark:text-slate-300">{request.user?.designation} • {request.user?.department}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">চাহিদার পরিমাণ:</span>
                        <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(request.requested_amount, useBanglaDigits)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">কাজের মূল কারণ:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{request.purpose}</span>
                    </div>
                    {request.details && (
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">বিস্তারিত:</span> {request.details}
                        </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400">তার কাছে আগের অবশিষ্ট ফান্ড:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(request.previous_remaining, useBanglaDigits)}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Decision Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            অ্যাডমিন সিদ্ধান্ত নির্ধারণ করুন:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setAction('approve');
                                    setApprovedAmount(request.requested_amount);
                                }}
                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                                    action === 'approve'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span className="text-xs font-bold">সম্পূর্ণ অনুমোদন</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setAction('partially_approve');
                                    if (approvedAmount >= request.requested_amount) {
                                        setApprovedAmount(Math.round(request.requested_amount * 0.7));
                                    }
                                }}
                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                                    action === 'partially_approve'
                                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span className="text-xs font-bold">আংশিক অনুমোদন</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setAction('reject')}
                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                                    action === 'reject'
                                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <XCircle className="w-5 h-5 text-rose-500" />
                                <span className="text-xs font-bold">প্রত্যাখ্যান</span>
                            </button>
                        </div>
                    </div>

                    {/* Approved Amount (if approve or partially approve) */}
                    {(action === 'approve' || action === 'partially_approve') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                চূড়ান্ত অনুমোদিত পরিমাণ (টাকায়)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                    ৳
                                </span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={approvedAmount}
                                    onChange={(e) => setApprovedAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                />
                            </div>
                        </div>
                    )}

                    {/* Rejection / Partial Note */}
                    {(action === 'reject' || action === 'partially_approve') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {action === 'reject' ? 'প্রত্যাখ্যানের কারণ (বাধ্যতামূলক)' : 'আংশিক বরাদ্দের কারণ বা নোট'}
                            </label>
                            <textarea
                                rows="2"
                                required={action === 'reject'}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="যেমন: সাধারণ পরিবহন ব্যবহার করুন অথবা কেন্দ্রীয় প্রকিউরমেন্ট থেকে নিন..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                                    : action === 'partially_approve'
                                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                            }`}
                        >
                            {isSubmitting ? 'আপডেট হচ্ছে...' : 'সিদ্ধান্ত সেভ করুন'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
