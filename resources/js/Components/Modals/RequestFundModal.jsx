import React, { useState } from 'react';
import { X, HandCoins, AlertCircle, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, getLocalDateStr } from '../../utils/formatters';

export default function RequestFundModal({
    isOpen,
    onClose,
    activeUser,
    useBanglaDigits = true,
}) {
    if (!isOpen) return null;

    const remainingOfficeFunds = activeUser?.balance_summary?.remaining_office_funds || 0;

    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [details, setDetails] = useState('');
    const [neededDate, setNeededDate] = useState(() => getLocalDateStr());
    const [quotationDoc, setQuotationDoc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0 || !purpose.trim()) {
            alert('অনুগ্রহ করে ফান্ডের পরিমাণ ও প্রয়োজনীয় কাজের বিবরণ সঠিকভাবে লিখুন।');
            return;
        }

        setIsSubmitting(true);
        router.post('/fund-requests', {
            user_id: activeUser.id,
            requested_amount: Number(amount),
            purpose: purpose.trim(),
            details: details.trim(),
            needed_date: neededDate,
            quotation_doc: quotationDoc,
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
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <HandCoins className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                অফিসের ফান্ডের জন্য রিকোয়েস্ট
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                আবেদনকারী: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeUser?.name}</span> ({activeUser?.employee_id})
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

                {/* Balance Notification Banner */}
                <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>আগের বরাদ্দ থেকে আপনার কাছে অবশিষ্ট টাকা:</span>
                    </div>
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(remainingOfficeFunds, useBanglaDigits)}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            কত টাকা প্রয়োজন (টাকায়) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                ৳
                            </span>
                            <input
                                type="number"
                                required
                                min="1"
                                step="any"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="যেমন: ৫০০০"
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            কী কাজে টাকা লাগবে (মূল কারণ) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="যেমন: নারায়ণগঞ্জ সাইট ভিজিট ও ক্লায়েন্ট মিটিং"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Needed Date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            টাকা প্রয়োজনের তারিখ <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={neededDate}
                                onChange={(e) => setNeededDate(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            বিস্তারিত বিবরণ (ঐচ্ছিক)
                        </label>
                        <textarea
                            rows="2"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="আনুমানিক খরচের ভাগ (যাতায়াত ২০০০, খাবার ১০০০, ইত্যাদি)"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Quotation / Document Note */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            কোটেশন বা রেফারেন্স ডকুমেন্ট লিংক/নোট (যদি থাকে)
                        </label>
                        <input
                            type="text"
                            value={quotationDoc}
                            onChange={(e) => setQuotationDoc(e.target.value)}
                            placeholder="যেমন: Vendor Quotation #QT-9921"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
