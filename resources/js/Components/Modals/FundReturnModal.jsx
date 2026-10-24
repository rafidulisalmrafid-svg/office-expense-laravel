import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, getLocalDateStr } from '../../utils/formatters';

export default function FundReturnModal({
    isOpen,
    onClose,
    users = [],
    preSelectedUser = null,
    useBanglaDigits = true,
}) {
    if (!isOpen) return null;

    const employeesWithFunds = users.filter(u => u.role === 'employee' && (u.balance_summary?.remaining_office_funds || 0) > 0);
    const allEmployees = users.filter(u => u.role === 'employee');
    const eligibleEmployees = employeesWithFunds.length > 0 ? employeesWithFunds : allEmployees;

    const [selectedUserId, setSelectedUserId] = useState(() => preSelectedUser ? preSelectedUser.id : (eligibleEmployees[0]?.id || ''));
    const targetUser = users.find(u => u.id === Number(selectedUserId));
    const maxReturnable = targetUser?.balance_summary?.remaining_office_funds || 0;

    const [amount, setAmount] = useState(() => maxReturnable > 0 ? maxReturnable : '');
    const [returnDate, setReturnDate] = useState(() => getLocalDateStr());
    const [receivedBy, setReceivedBy] = useState('করিম চৌধুরী (অ্যাকাউন্টস)');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [reason, setReason] = useState('কাজের সমাপ্তিতে অবশিষ্ট অব্যবহৃত টাকা অফিসে জমা');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUserId || !amount || Number(amount) <= 0 || !receivedBy.trim()) {
            alert('অনুগ্রহ করে সঠিক পরিমাণ ও গ্রহণকারীর নাম প্রদান করুন।');
            return;
        }

        setIsSubmitting(true);
        router.post('/fund-returns', {
            user_id: selectedUserId,
            amount: Number(amount),
            return_date: returnDate,
            received_by: receivedBy.trim(),
            payment_method: paymentMethod,
            reason: reason.trim(),
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
                        <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                অব্যবহৃত টাকা ফেরত নেওয়া (Fund Recovery)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                কর্মচারীর কাছে থাকা অতিরিক্ত টাকা অফিসে জমা
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

                {/* Target Employee Info */}
                {targetUser && (
                    <div className="my-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{targetUser.name}</span>
                            <span className="text-slate-500 dark:text-slate-400">{targetUser.employee_id} • {targetUser.designation}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">বর্তমান অব্যবহৃত টাকা</span>
                            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(maxReturnable, useBanglaDigits)}
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Employee Picker */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            কর্মচারী নির্বাচন করুন <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => {
                                setSelectedUserId(e.target.value);
                                const u = users.find(usr => usr.id === Number(e.target.value));
                                if (u) {
                                    setAmount(u.balance_summary?.remaining_office_funds || '');
                                }
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        >
                            {eligibleEmployees.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} (বাকি: ৳{u.balance_summary?.remaining_office_funds || 0})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                কত টাকা ফেরত জমা হচ্ছে <span className="text-rose-500">*</span>
                            </label>
                            {maxReturnable > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setAmount(maxReturnable)}
                                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    পুরো ৳{maxReturnable} সিলেক্ট করুন
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                ৳
                            </span>
                            <input
                                type="number"
                                required
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="যেমন: ১০০০"
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Return Date & Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                ফেরত জমা তারিখ <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                পেমেন্ট মাধ্যম <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            >
                                <option value="Cash">Cash (নগদ)</option>
                                <option value="Bank">Bank Deposit</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>
                    </div>

                    {/* Received By */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            টাকা গ্রহণকারী (অফিসের পক্ষে কে গ্রহণ করল) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={receivedBy}
                            onChange={(e) => setReceivedBy(e.target.value)}
                            placeholder="যেমন: করিম চৌধুরী (অ্যাকাউন্টস)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            ফেরতের কারণ বা বিবরণ
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="যেমন: ফিল্ড ভিজিট সমাপ্তে অবশিষ্ট টাকা ফেরত"
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
                            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/25 disabled:opacity-50 flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>{isSubmitting ? 'প্রসেসিং...' : 'টাকা ফেরত নিশ্চিত করুন'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
