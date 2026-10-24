import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AddEmployeeModal({
    isOpen,
    onClose,
}) {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('Operations');
    const [designation, setDesignation] = useState('Executive');
    const [role, setRole] = useState('employee');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            alert('নাম ও ইমেইল অবশ্যই প্রদান করতে হবে।');
            return;
        }

        setIsSubmitting(true);
        router.post('/users', {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            department: department.trim(),
            designation: designation.trim(),
            role,
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
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                নতুন কর্মচারী যুক্ত করুন
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                অ্যাডমিন কর্তৃক তাৎক্ষণিক অ্যাকাউন্ট তৈরি
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

                <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            কর্মচারীর পুরো নাম <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="যেমন: সাকিব আল হাসান"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            ইমেইল অ্যাড্রেস <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="employee@company.com"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                মোবাইল নম্বর
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="01819..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                ভূমিকা (Role)
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            >
                                <option value="employee">Employee (কর্মচারী)</option>
                                <option value="accounts_manager">Accounts Manager</option>
                                <option value="admin">Admin (অ্যাডমিন)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                বিভাগ (Department)
                            </label>
                            <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="Marketing / Field"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                পদবি (Designation)
                            </label>
                            <input
                                type="text"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                placeholder="Senior Officer"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>
                    </div>

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
                            <span>{isSubmitting ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
