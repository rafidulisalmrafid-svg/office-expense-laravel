import React, { useState } from 'react';
import { X, FolderPlus, DollarSign, UserCheck, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { getLocalDateStr } from '../../utils/formatters';

export default function CreateProjectModal({
    isOpen,
    onClose,
    users = [],
    useBanglaDigits = true,
}) {
    if (!isOpen) return null;

    const employees = users.filter(u => u.role === 'employee');

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [startDate, setStartDate] = useState(() => getLocalDateStr());
    const [endDate, setEndDate] = useState('');
    const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
    const [allocatedAmount, setAllocatedAmount] = useState('');
    const [hasSecondEmployee, setHasSecondEmployee] = useState(false);
    const [employeeId2, setEmployeeId2] = useState('');
    const [allocatedAmount2, setAllocatedAmount2] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !code.trim() || !budget || Number(budget) <= 0) {
            alert('অনুগ্রহ করে প্রজেক্টের নাম, কোড এবং মোট বাজেট পূরণ করুন।');
            return;
        }

        if (hasSecondEmployee && employeeId && employeeId === employeeId2) {
            alert('১ম ও ২য় দায়িত্বপ্রাপ্ত হিসেবে একই কর্মচারীকে নির্বাচন করা যাবে না। দুজন আলাদা কর্মচারী বেছে নিন।');
            return;
        }

        setIsSubmitting(true);
        router.post('/projects', {
            name: name.trim(),
            code: code.trim().toUpperCase(),
            description: description.trim(),
            budget: Number(budget),
            start_date: startDate || null,
            end_date: endDate || null,
            employee_id: employeeId || null,
            allocated_amount: allocatedAmount ? Number(allocatedAmount) : null,
            employee_id_2: hasSecondEmployee && employeeId2 ? employeeId2 : null,
            allocated_amount_2: hasSecondEmployee && allocatedAmount2 ? Number(allocatedAmount2) : null,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200 my-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <FolderPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                নতুন প্রজেক্ট তৈরি ও বাজেট বরাদ্দ
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                প্রজেক্ট তৈরি করে নির্দিষ্ট এমপ্লয়ির নামে স্বাধীন ফান্ড বরাদ্দ করুন
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
                    {/* Project Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                প্রজেক্টের নাম *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="যেমন: প্রজেক্ট A - ধানমন্ডি শাখা রেনোভেশন"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                প্রজেক্ট কোড *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="PRJ-A"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-sm font-mono uppercase border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Total Budget & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                মোট বাজেট (টাকা) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="20000"
                                    value={budget}
                                    onChange={(e) => {
                                        setBudget(e.target.value);
                                        if (!allocatedAmount) setAllocatedAmount(e.target.value);
                                    }}
                                    className="w-full pl-7 pr-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                শুরু তারিখ
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                সম্ভাব্য শেষ তারিখ
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            প্রজেক্টের বিবরণ / উদ্দেশ্য
                        </label>
                        <textarea
                            rows={2}
                            placeholder="প্রজেক্টের কাজের ধরন এবং খরচের শর্তাবলী..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Section: Employee Assignment & Initial Allocation */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                            <UserCheck className="w-4 h-4" />
                            <span>প্রাথমিক দায়িত্বপ্রাপ্ত কর্মচারী ও টাকা বরাদ্দ</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    কর্মচারী নির্বাচন করুন
                                </label>
                                <select
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">কর্মচারী নির্বাচন করুন...</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.employee_id}) - {emp.department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    তাকে বরাদ্দকৃত টাকা (৳)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="বরাদ্দকৃত টাকা"
                                    value={allocatedAmount}
                                    onChange={(e) => setAllocatedAmount(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    পেমেন্ট মেথড
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="Bank Transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                                    <option value="Cash">Cash (নগদ টাকা)</option>
                                    <option value="bKash">bKash (বিকাশ)</option>
                                    <option value="Nagad">Nagad (নগদ অ্যাপ)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    বরাদ্দের নোট / রেফারেন্স
                                </label>
                                <input
                                    type="text"
                                    placeholder="যেমন: প্রাথমিক কেনাকাটার জন্য"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Optional 2nd Assigned Employee */}
                        <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                            {!hasSecondEmployee ? (
                                <button
                                    type="button"
                                    onClick={() => setHasSecondEmployee(true)}
                                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>+ ২য় কর্মচারীকে দায়িত্ব প্রদান করুন (ঐচ্ছিক)</span>
                                </button>
                            ) : (
                                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-emerald-300 dark:border-emerald-700 space-y-2.5 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                            ২য় দায়িত্বপ্রাপ্ত কর্মচারী:
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setHasSecondEmployee(false);
                                                setEmployeeId2('');
                                                setAllocatedAmount2('');
                                            }}
                                            className="text-[11px] font-semibold text-rose-600 hover:underline"
                                        >
                                            বাতিল করুন
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                ২য় কর্মচারী নির্বাচন করুন
                                            </label>
                                            <select
                                                value={employeeId2}
                                                onChange={(e) => setEmployeeId2(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <option value="">কর্মচারী নির্বাচন করুন...</option>
                                                {employees.filter(e => e.id !== Number(employeeId)).map((emp) => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.name} ({emp.employee_id}) - {emp.department}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                ২য় কর্মচারীকে বরাদ্দকৃত টাকা (৳)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="বরাদ্দকৃত টাকা"
                                                value={allocatedAmount2}
                                                onChange={(e) => setAllocatedAmount2(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
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
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'তৈরি হচ্ছে...' : 'প্রজেক্ট নিশ্চিত ও সেভ করুন'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
