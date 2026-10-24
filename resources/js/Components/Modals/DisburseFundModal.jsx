import React, { useState } from 'react';
import { X, SendHorizontal, CheckCircle2, DollarSign, Wallet, ShieldCheck, Building2, FolderKanban } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '../../utils/formatters';

export default function DisburseFundModal({
    isOpen,
    onClose,
    request = null,
    users = [],
    projects = [],
    useBanglaDigits = true,
}) {
    if (!isOpen) return null;

    const employees = users.filter(u => u.role === 'employee' && u.status === 'approved');

    const [selectedUserId, setSelectedUserId] = useState(() => request ? request.user_id : (employees[0]?.id || ''));
    const [allocationType, setAllocationType] = useState('office'); // 'office' or 'project'
    const [projectId, setProjectId] = useState('');
    const [amount, setAmount] = useState(() => request ? (request.approved_amount || request.requested_amount) : '');
    const [moneyProvider, setMoneyProvider] = useState('করিম চৌধুরী (অ্যাকাউন্টস ম্যানেজার)');
    const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, Bank, bKash, Nagad
    const [notes, setNotes] = useState(() => request ? `ফান্ড রিকোয়েস্ট #${request.id} এর বিপরীতে বরাদ্দ: ${request.purpose}` : '');
    const [instantConfirm, setInstantConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUserId || !amount || Number(amount) <= 0 || !moneyProvider.trim()) {
            alert('অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ড সঠিকভাবে পূরণ করুন।');
            return;
        }

        if (allocationType === 'project' && !projectId) {
            alert('অনুগ্রহ করে নির্দিষ্ট প্রজেক্ট নির্বাচন করুন।');
            return;
        }

        setIsSubmitting(true);
        router.post('/fund-allocations', {
            fund_request_id: request ? request.id : null,
            user_id: selectedUserId,
            allocation_type: allocationType,
            project_id: allocationType === 'project' ? projectId : null,
            amount: Number(amount),
            money_provider: moneyProvider.trim(),
            payment_method: paymentMethod,
            notes: notes.trim(),
            instant_confirm: instantConfirm,
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

    const targetUser = users.find(u => u.id === Number(selectedUserId));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <SendHorizontal className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                কর্মচারীকে টাকা বরাদ্দ ও প্রদান (Disburse)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                ফান্ড হস্তান্তর ও পেমেন্ট রেকর্ড সংরক্ষণ
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

                {/* Target User Info */}
                {targetUser && (
                    <div className="my-3 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-xs">
                        <div>
                            <span className="font-bold text-slate-900 dark:text-white">{targetUser.name}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-1.5">({targetUser.employee_id} • {targetUser.designation})</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">বর্তমান অবশিষ্ট ফান্ড</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(targetUser.balance_summary?.remaining_office_funds || 0, useBanglaDigits)}
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Select Employee (if not pre-selected from request) */}
                    {!request && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                কর্মচারী নির্বাচন করুন <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            >
                                {employees.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.employee_id}) - {u.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Allocation Type Selector (Requirement 1) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            টাকার বরাদ্দের ধরন (Allocation Type) <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setAllocationType('office');
                                    setProjectId('');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    allocationType === 'office'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Building2 className="w-4 h-4" />
                                <span>Daily Office Expense</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllocationType('project')}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    allocationType === 'project'
                                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <FolderKanban className="w-4 h-4" />
                                <span>Project Expense</span>
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {allocationType === 'office'
                                ? 'টাকাটি কর্মচারীর দৈনিক অফিস খরচের ফান্ডে যুক্ত হবে।'
                                : 'টাকাটি নির্দিষ্ট প্রজেক্টে যুক্ত হবে, অফিস খরচের সাথে মিশবে না।'
                            }
                        </p>
                    </div>

                    {/* Specific Project Selector (Requirement 1) */}
                    {allocationType === 'project' && (
                        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 animate-in fade-in duration-200">
                            <label className="block text-xs font-bold text-teal-900 dark:text-teal-200 mb-1">
                                নির্দিষ্ট প্রজেক্ট নির্বাচন করুন <span className="text-rose-500">*</span>
                            </label>
                            <select
                                required
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                            >
                                <option value="">-- প্রজেক্ট বেছে নিন --</option>
                                {projects.filter(p => p.status === 'active').map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.code} - {p.name} (বাজেট: ৳{p.budget})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            প্রদত্ত টাকার পরিমাণ (টাকায়) <span className="text-rose-500">*</span>
                        </label>
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
                                placeholder="যেমন: ২০০০"
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Money Provider (Who gives the money) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            টাকা প্রদানকারী (কার কাছ থেকে টাকা গ্রহণ করবে) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={moneyProvider}
                            onChange={(e) => setMoneyProvider(e.target.value)}
                            placeholder="যেমন: করিম চৌধুরী (অ্যাকাউন্টস ম্যানেজার)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            পেমেন্ট মাধ্যম (Payment Method) <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Cash', 'bKash', 'Bank', 'Nagad'].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setPaymentMethod(m)}
                                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                                        paymentMethod === m
                                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            নোট বা বিবরণ
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="যেমন: ভাউচার স্বাক্ষর নিয়ে ক্যাশ দেওয়া হয়েছে"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Instant Confirmation Option */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={instantConfirm}
                                onChange={(e) => setInstantConfirm(e.target.checked)}
                                className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <div>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                    হাতে হাতে নগদ প্রদান সম্পন্ন (Instant Confirm)
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                    টিক না দিলে কর্মচারী নিজ প্যানেল থেকে টাকা প্রাপ্তি "Confirm" করার পর ব্যালেন্স যোগ হবে।
                                </span>
                            </div>
                        </label>
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
                            <SendHorizontal className="w-4 h-4" />
                            <span>{isSubmitting ? 'প্রদান হচ্ছে...' : 'টাকা প্রদান সম্পন্ন করুন'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
