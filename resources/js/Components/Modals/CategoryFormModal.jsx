import React, { useState, useEffect } from 'react';
import { X, Tag, CheckCircle2, Layers } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function CategoryFormModal({
    isOpen,
    onClose,
    category = null, // null for create, object for edit
}) {
    if (!isOpen) return null;

    const isEdit = !!category;

    const [nameBn, setNameBn] = useState(category?.name_bn || '');
    const [name, setName] = useState(category?.name || '');
    const [icon, setIcon] = useState(category?.icon || 'Receipt');
    const [description, setDescription] = useState(category?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (category) {
            setNameBn(category.name_bn || '');
            setName(category.name || '');
            setIcon(category.icon || 'Receipt');
            setDescription(category.description || '');
        } else {
            setNameBn('');
            setName('');
            setIcon('Receipt');
            setDescription('');
        }
    }, [category]);

    const iconOptions = [
        { id: 'Receipt', label: 'রশিদ (Receipt)' },
        { id: 'Car', label: 'গাড়ি / যাতায়াত (Car)' },
        { id: 'Utensils', label: 'খাবার / নাস্তা (Food)' },
        { id: 'FileText', label: 'স্টেশনারি (Stationery)' },
        { id: 'Printer', label: 'প্রিন্ট / ফটোকপি (Printer)' },
        { id: 'Package', label: 'কুরিয়ার / পার্সেল (Package)' },
        { id: 'PhoneCall', label: 'মোবাইল / ডাটা (Phone)' },
        { id: 'Users', label: 'মিটিং / ইভেন্ট (Users)' },
        { id: 'ShoppingBag', label: 'পণ্য ক্রয় (Shopping)' },
        { id: 'HardHat', label: 'শ্রমিক / মজুরি (Labor)' },
        { id: 'Wrench', label: 'মেরামত (Maintenance)' },
        { id: 'Laptop', label: 'আইটি / হার্ডওয়্যার (IT)' },
        { id: 'Coffee', label: 'আপ্যায়ন (Coffee)' },
        { id: 'Layers', label: 'অন্যান্য (Layers)' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nameBn.trim()) {
            alert('খরচের ধরনের বাংলা নাম লেখা আবশ্যক।');
            return;
        }

        setIsSubmitting(true);

        if (isEdit) {
            router.put(`/categories/${category.id}`, {
                name_bn: nameBn.trim(),
                name: name.trim() || nameBn.trim(),
                icon: icon,
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
        } else {
            router.post('/categories', {
                name_bn: nameBn.trim(),
                name: name.trim() || nameBn.trim(),
                icon: icon,
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
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {isEdit ? 'খরচের ধরন এডিট করুন' : 'নতুন খরচের ধরন যুক্ত করুন'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Expense Category Configuration
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
                    {/* Bangla Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            খরচের ধরনের নাম (বাংলায়) *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="যেমন: যাতায়াত খরচ"
                            value={nameBn}
                            onChange={(e) => setNameBn(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>

                    {/* English Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            নাম (ইংরেজিতে - ঐচ্ছিক)
                        </label>
                        <input
                            type="text"
                            placeholder="যেমন: Travel & Commute"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            আইকন প্রতীক নির্বাচন করুন
                        </label>
                        <select
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {iconOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            বিবরণ বা উদাহরণ
                        </label>
                        <textarea
                            rows={2}
                            placeholder="যেমন: বাস, রিকশা, উবার ও ফিল্ড ভ্রমণ খরচ..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : (isEdit ? 'আপডেট করুন' : 'ক্যাটাগরি যুক্ত করুন')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
