import React, { useState } from 'react';
import { X, CalendarDays, DollarSign, FileText } from 'lucide-react';

export default function AddEventModal({ isOpen, onClose, onSubmit }) {
    if (!isOpen) return null;

    const today = new Date().toISOString().slice(0, 10);
    const [name, setName] = useState('');
    const [date, setDate] = useState(today);
    const [budget, setBudget] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('অনুগ্রহ করে ইভেন্টের নাম লিখুন।');
            return;
        }
        if (!budget || Number(budget) < 0) {
            setError('অনুগ্রহ করে সঠিক বাজেট লিখুন (০ বা তার বেশি)।');
            return;
        }

        setError('');
        onSubmit({
            name: name.trim(),
            date,
            budget: Number(budget),
            description: description.trim(),
        });

        setName('');
        setBudget('');
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white/20">
                            <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">নতুন ইভেন্ট ও বাজেট তৈরি</h3>
                            <p className="text-xs text-indigo-100">মিটিং, ওয়ার্কশপ বা যেকোনো বিশেষ আয়োজন</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Event Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            ইভেন্টের নাম <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="যেমন: ক্লায়েন্ট সম্মেলন, টিম পিকনিক, এজিএম..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Date & Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                ইভেন্টের তারিখ <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                নির্ধারিত বাজেট (৳) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="যেমন: ২৫০০০"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            ইভেন্টের বিবরণ বা উদ্দেশ্য
                        </label>
                        <textarea
                            rows="2"
                            placeholder="যেমন: ভেন্যু বুকিং, ক্যাটারিং ও গিফট আইটেম..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all"
                        >
                            ইভেন্ট তৈরি করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
