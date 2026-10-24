import React, { useState, useEffect } from 'react';
import { X, Edit3, Upload, FileCheck, Sparkles, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '../../utils/formatters';

export default function EditExpenseModal({
    isOpen,
    onClose,
    expense = null,
    categories = [],
    useBanglaDigits = true,
}) {
    if (!isOpen || !expense) return null;

    const [amount, setAmount] = useState(expense.amount || '');
    const [categoryId, setCategoryId] = useState(expense.category_id || categories[0]?.id || '');
    const [expenseDate, setExpenseDate] = useState(expense.expense_date ? expense.expense_date.split('T')[0] : '');
    const [description, setDescription] = useState(expense.description || '');
    const [otherReason, setOtherReason] = useState(expense.other_reason || '');
    const [receiptImage, setReceiptImage] = useState(expense.receipt_image || null);
    const [resubmit, setResubmit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (expense) {
            setAmount(expense.amount || '');
            setCategoryId(expense.category_id || categories[0]?.id || '');
            setExpenseDate(expense.expense_date ? expense.expense_date.split('T')[0] : '');
            setDescription(expense.description || '');
            setOtherReason(expense.other_reason || '');
            setReceiptImage(expense.receipt_image || null);
            setResubmit(expense.status === 'revision');
        }
    }, [expense]);

    const selectedCategory = categories.find(c => c.id === Number(categoryId));
    const isOtherCategory = selectedCategory && (
        selectedCategory.name_bn?.includes('অন্যান্য') || 
        selectedCategory.name?.toLowerCase().includes('other') || 
        selectedCategory.name?.toLowerCase().includes('misc')
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0 || !description.trim() || !categoryId) {
            alert('অনুগ্রহ করে খরচের পরিমাণ, ক্যাটাগরি ও বিবরণ সঠিকভাবে পূরণ করুন।');
            return;
        }

        if (isOtherCategory && (!otherReason || !otherReason.trim())) {
            alert('বিশেষ নিয়ম: অন্যান্য খরচের জন্য সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।');
            return;
        }

        setIsSubmitting(true);
        router.post(`/expenses/${expense.id}/update`, {
            category_id: categoryId,
            expense_date: expenseDate,
            amount: Number(amount),
            description: description.trim(),
            other_reason: isOtherCategory ? otherReason.trim() : null,
            receipt_image: receiptImage,
            resubmit: resubmit,
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
                        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {expense.status === 'revision' ? 'বিল সংশোধন ও পুনঃজমা' : 'খসড়া খরচের তথ্য এডিট করুন'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {expense.status === 'revision' ? 'অ্যাডমিনের মতামত অনুযায়ী তথ্য সংশোধন করে আবার পাঠান' : 'চূড়ান্ত সাবমিটের আগে যেকোনো তথ্য সংশোধন করতে পারেন'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                #{expense.transaction_ref}
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

                {/* Revision Notice if returned for revision */}
                {expense.revision_notes && (
                    <div className="my-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-xs">
                        <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
                            ⚠️ অ্যাডমিনের সংশোধনী মন্তব্য:
                        </span>
                        <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                            {expense.revision_notes}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
                    {/* Amount & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                খরচের পরিমাণ (টাকায়) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                খরচের তারিখ *
                            </label>
                            <input
                                type="date"
                                required
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            খরচের ক্যাটাগরি *
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name_bn} ({c.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Other Expense reason */}
                    {isOtherCategory && (
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600">
                            <label className="block text-xs font-extrabold text-amber-900 dark:text-amber-200 mb-1">
                                অন্যান্য খরচের সুনির্দিষ্ট কারণ * (বাধ্যতামূলক)
                            </label>
                            <textarea
                                rows="2"
                                required
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                placeholder="ঠিক কী কারণে খরচটি করা হয়েছে..."
                                className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            খরচের বিবরণ ও উদ্দেশ্য *
                        </label>
                        <textarea
                            rows="2"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Receipt Upload */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            রসিদ বা ভাউচারের ছবি
                        </label>
                        {receiptImage ? (
                            <div className="relative p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 truncate">
                                    <img src={receiptImage} alt="Receipt" className="w-12 h-12 object-cover rounded-xl border border-slate-300" />
                                    <div>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <FileCheck className="w-3.5 h-3.5" /> রসিদ সংযুক্ত আছে
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReceiptImage(null)}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/40">
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    নতুন রসিদের ছবি আপলোড করুন
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
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
                            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/25 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : (resubmit ? 'সংশোধন করে জমা দিন' : 'আপডেট করুন')}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
