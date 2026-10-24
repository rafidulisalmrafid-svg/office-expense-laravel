import React, { useState } from 'react';
import { X, FileQuestion, Send, UserCheck, Receipt, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function RequestDocumentModal({
    isOpen,
    onClose,
    project,
    users = [],
    useBanglaDigits = true,
}) {
    if (!isOpen || !project) return null;

    const allocations = project.allocations || [];
    const expenses = project.expenses || [];

    const defaultUserId = allocations[0]?.user_id || (allocations[0]?.user?.id) || '';

    const [userId, setUserId] = useState(defaultUserId);
    const [expenseId, setExpenseId] = useState('');
    const [title, setTitle] = useState('খরচের পাকা রশিদ ও মেমো জমা দিন');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userId || !title.trim()) {
            alert('অনুগ্রহ করে কর্মচারী এবং ডকুমেন্টের বিষয় উল্লেখ করুন।');
            return;
        }

        setIsSubmitting(true);
        router.post(`/projects/${project.id}/request-document`, {
            user_id: userId,
            expense_id: expenseId || null,
            title: title.trim(),
            description: description.trim(),
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
                        <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                            <FileQuestion className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                প্রমাণপত্র / ভাউচার তলব করুন
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
                    {/* Employee Target */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            কোন কর্মচারীর কাছে প্রমাণপত্র চাইবেন? *
                        </label>
                        <select
                            required
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {allocations.map((alloc) => (
                                <option key={alloc.id} value={alloc.user_id}>
                                    {alloc.user?.name || `Employee #${alloc.user_id}`} ({alloc.user?.employee_id || ''}) - বরাদ্দ: ৳{alloc.allocated_amount}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Expense Scope */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            নির্দিষ্ট খরচ নাকি পুরো প্রজেক্ট?
                        </label>
                        <select
                            value={expenseId}
                            onChange={(e) => setExpenseId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">পুরো প্রজেক্টের সামগ্রিক ভাউচার / অডিট ডকুমেন্ট</option>
                            {expenses.map((exp) => (
                                <option key={exp.id} value={exp.id}>
                                    নির্দিষ্ট খরচ: {exp.category_name || 'খরচ'} (৳{exp.amount}) - {exp.description.slice(0, 35)}...
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Request Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            তলবের শিরোনাম *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="যেমন: ইলেকট্রিক সামগ্রী ক্রয়ের সিলযুক্ত ক্যাশ মেমো জমা দিন"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            বিস্তারিত নির্দেশনা / কী কী দেখতে চান?
                        </label>
                        <textarea
                            rows={3}
                            placeholder="যেমন: দোকানের নাম, সিল, তারিখ ও আইটেম লিস্ট স্পষ্ট বোঝা যায় এমন স্পষ্ট ছবি বা PDF আপলোড করতে হবে..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Hint */}
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>রিকোয়েস্ট পাঠানোর সাথে সাথে কর্মচারীর ড্যাশবোর্ডে অ্যাকশন ব্যানার ও নোটিফিকেশন পৌঁছে যাবে।</span>
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
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'প্রমাণপত্রের নোটিফিকেশন পাঠান'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
