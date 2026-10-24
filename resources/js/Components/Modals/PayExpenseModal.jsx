import React, { useState } from 'react';
import { X, HandCoins, CheckCircle2, Wallet, CreditCard, Building } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '../../utils/formatters';

export default function PayExpenseModal({
    isOpen,
    onClose,
    expense = null,
    useBanglaDigits = true,
}) {
    if (!isOpen || !expense) return null;

    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentRef, setPaymentRef] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/expenses/${expense.id}/pay`, {
            payment_method: paymentMethod,
            payment_ref: paymentRef.trim(),
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

    const paymentMethods = [
        { id: 'Cash', label: 'ক্যাশ টাকা (Cash)', icon: Wallet },
        { id: 'bKash', label: 'বিকাশ (bKash)', icon: CreditCard },
        { id: 'Nagad', label: 'নগদ (Nagad)', icon: CreditCard },
        { id: 'Bank Transfer', label: 'ব্যাংক ট্রান্সফার (Bank)', icon: Building },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <HandCoins className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                অনুমোদিত বিলের টাকা প্রদান (Disburse Claim)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                প্রাপক: <strong className="text-slate-700 dark:text-slate-300">{expense.user?.name}</strong> ({expense.user?.employee_id})
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

                {/* Claim Summary Box */}
                <div className="my-4 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-emerald-800 dark:text-emerald-300 font-medium">খরচের বিবরণ:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{expense.description}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-emerald-800 dark:text-emerald-300 font-medium">ক্যাটাগরি:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{expense.category_name}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">পরিশোধযোগ্য টাকা:</span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(expense.amount, useBanglaDigits)}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Payment Method Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            টাকা প্রদানের মাধ্যম (Payment Method) *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {paymentMethods.map((pm) => {
                                const Icon = pm.icon;
                                const isSelected = paymentMethod === pm.id;
                                return (
                                    <button
                                        key={pm.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(pm.id)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-all ${
                                            isSelected
                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                                        <span className="truncate">{pm.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Payment Ref (Optional) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            ট্রানজেকশন আইডি বা রেফারেন্স (ঐচ্ছিক)
                        </label>
                        <input
                            type="text"
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            placeholder="যেমন: TrxID-9X82LA অথবা ভাউচার নং #104"
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Notice */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        ℹ️ <strong>নোট:</strong> টাকা প্রদান নিশ্চিত করার পর কর্মচারীর ড্যাশবোর্ডে <strong>"টাকা পেয়েছি (Confirm Received)"</strong> অপশন প্রদর্শিত হবে।
                    </p>

                    {/* Action Buttons */}
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
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'প্রসেসিং...' : 'টাকা প্রদান সম্পন্ন করুন'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
