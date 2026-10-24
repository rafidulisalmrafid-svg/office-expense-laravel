import React, { useState } from 'react';
import { X, HandCoins, UserCheck, DollarSign, CheckCircle2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '../../utils/formatters';

export default function AllocateProjectModal({
    isOpen,
    onClose,
    project,
    users = [],
    useBanglaDigits = true,
}) {
    if (!isOpen || !project) return null;

    const employees = users.filter(u => u.role === 'employee');

    const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
    const [allocatedAmount, setAllocatedAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!employeeId || !allocatedAmount || Number(allocatedAmount) <= 0) {
            alert('অনুগ্রহ করে কর্মচারী এবং বরাদ্দের সঠিক পরিমাণ লিখুন।');
            return;
        }

        setIsSubmitting(true);
        router.post(`/projects/${project.id}/allocate`, {
            user_id: employeeId,
            allocated_amount: Number(allocatedAmount),
            payment_method: paymentMethod,
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
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <HandCoins className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                প্রজেক্টে ফান্ড বরাদ্দ করুন
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
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            কর্মচারী নির্বাচন করুন *
                        </label>
                        <select
                            required
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.employee_id}) - {emp.department}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            বরাদ্দকৃত টাকা (৳) *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="10000"
                                value={allocatedAmount}
                                onChange={(e) => setAllocatedAmount(e.target.value)}
                                className="w-full pl-7 pr-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            পেমেন্ট মাধ্যম
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                            <option value="Cash">Cash (নগদ টাকা)</option>
                            <option value="bKash">bKash (বিকাশ)</option>
                            <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            নোট / উদ্দেশ্য
                        </label>
                        <textarea
                            rows={2}
                            placeholder="বরাদ্দের বিশেষ কোনো কারণ বা রেফারেন্স..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {/* Footer Buttons */}
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
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'বরাদ্দ হচ্ছে...' : 'টাকা বরাদ্দ নিশ্চিত করুন'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
