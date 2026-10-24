import React, { useState } from 'react';
import { X, Users, UserPlus, UserMinus, CheckCircle2, AlertCircle, DollarSign, ShieldAlert } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '../../utils/formatters';

export default function ManageProjectTeamModal({
    isOpen,
    onClose,
    project,
    users = [],
    useBanglaDigits = true,
}) {
    if (!isOpen || !project) return null;

    const employees = users.filter(u => u.role === 'employee');
    const allocations = (project.allocations || []).filter(a => a.status === 'active');
    const assignedUserIds = allocations.map(a => a.user_id);
    const unassignedEmployees = employees.filter(e => !assignedUserIds.includes(e.id));

    // Add employee form state
    const [selectedUserId, setSelectedUserId] = useState(unassignedEmployees[0]?.id || '');
    const [allocatedAmount, setAllocatedAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Editing an existing allocation
    const [editingUserId, setEditingUserId] = useState(null);
    const [editAmount, setEditAmount] = useState('');

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!selectedUserId) {
            alert('অনুগ্রহ করে একজন কর্মচারী নির্বাচন করুন।');
            return;
        }

        setIsSubmitting(true);
        router.post(`/projects/${project.id}/team`, {
            action: 'add',
            user_id: selectedUserId,
            allocated_amount: allocatedAmount ? Number(allocatedAmount) : 0,
            payment_method: paymentMethod,
            notes: notes.trim() || 'প্রজেক্ট দায়িত্ব প্রদান',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setAllocatedAmount('');
                setNotes('');
            },
            onError: () => setIsSubmitting(false)
        });
    };

    const handleRemoveMember = (emp) => {
        if (!confirm(`আপনি কি "${emp.name}" এর দায়িত্ব প্রজেক্ট [${project.name}] থেকে প্রত্যাহার করতে চান?`)) {
            return;
        }

        router.post(`/projects/${project.id}/team`, {
            action: 'remove',
            user_id: emp.id,
        }, {
            preserveScroll: true,
        });
    };

    const handleUpdateAllocation = (empId) => {
        if (!editAmount || Number(editAmount) < 0) {
            alert('সঠিক বরাদ্দের পরিমাণ লিখুন।');
            return;
        }

        router.post(`/projects/${project.id}/team`, {
            action: 'update',
            user_id: empId,
            allocated_amount: Number(editAmount),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUserId(null);
                setEditAmount('');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200 my-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                প্রজেক্ট টিম ও দায়িত্ব পরিচালনা
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                #{project.code} - {project.name}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-4 space-y-5">
                    {/* Notice / Guidance */}
                    <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
                        অ্যাডমিন চাইলে একটি প্রজেক্টে ১ জন বা ২ জন কর্মচারীকে দায়িত্ব দিতে পারে। দায়িত্বে থাকা কর্মচারী ছাড়া অন্য কোনো কর্মচারী এই প্রজেক্টের বাজেট বা খরচের হিসাব দেখতে পাবে না।
                    </div>

                    {/* Section 1: Currently Assigned Employees */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                            <span>বর্তমানে দায়িত্বপ্রাপ্ত কর্মচারী ({allocations.length} জন)</span>
                            <span className="text-[11px] font-normal text-slate-400">সর্বোচ্চ ২ জন বা ততোধিক</span>
                        </h4>

                        {allocations.length > 0 ? (
                            <div className="space-y-2.5">
                                {allocations.map((alloc) => {
                                    const emp = alloc.user || users.find(u => u.id === alloc.user_id);
                                    if (!emp) return null;
                                    const isEditingThis = editingUserId === emp.id;

                                    return (
                                        <div
                                            key={alloc.id}
                                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center text-xs">
                                                    {emp.name?.charAt(0) || 'E'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <span>{emp.name}</span>
                                                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                                                            ({emp.employee_id})
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        {emp.designation} • {emp.department}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end sm:self-center">
                                                {isEditingThis ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editAmount}
                                                            onChange={(e) => setEditAmount(e.target.value)}
                                                            placeholder="বরাদ্দ"
                                                            className="w-24 px-2 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateAllocation(emp.id)}
                                                            className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                                                        >
                                                            সেভ
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingUserId(null)}
                                                            className="px-1.5 py-1 text-slate-400 text-xs hover:text-slate-600"
                                                        >
                                                            বাতিল
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-slate-400 block">বরাদ্দকৃত টাকা</span>
                                                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                                                            {formatCurrency(alloc.allocated_amount, useBanglaDigits)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1">
                                                    {!isEditingThis && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingUserId(emp.id);
                                                                setEditAmount(alloc.allocated_amount);
                                                            }}
                                                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                                        >
                                                            বরাদ্দ পরিবর্তন
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMember(emp)}
                                                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
                                                        title="দায়িত্ব প্রত্যাহার করুন (প্রজেক্ট থেকে বাদ দিন)"
                                                    >
                                                        <UserMinus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                                বর্তমানে কোনো কর্মচারী এই প্রজেক্টের দায়িত্বে নেই। নিচে থেকে যোগ করুন।
                            </div>
                        )}
                    </div>

                    {/* Section 2: Add New Employee to Project */}
                    {unassignedEmployees.length > 0 && (
                        <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>নতুন কর্মচারীকে প্রজেক্টে যুক্ত করুন</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        কর্মচারী নির্বাচন করুন *
                                    </label>
                                    <select
                                        required
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">-- কর্মচারী বেছে নিন --</option>
                                        {unassignedEmployees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.employee_id}) - {emp.department}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        বরাদ্দকৃত বাজেট (টাকায়)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="০"
                                        value={allocatedAmount}
                                        onChange={(e) => setAllocatedAmount(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedUserId}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>{isSubmitting ? 'যোগ হচ্ছে...' : 'প্রজেক্টে যুক্ত করুন'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        সম্পন্ন ও বন্ধ করুন
                    </button>
                </div>

            </div>
        </div>
    );
}
