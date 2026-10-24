import React, { useState } from 'react';
import { X, HandCoins, Calendar, User, Building, DollarSign, FileText } from 'lucide-react';

export default function AddAdvanceModal({
    isOpen,
    onClose,
    onSubmit,
    persons = [],
    selectedPerson = '',
    role = 'admin',
}) {
    if (!isOpen) return null;

    // Get current datetime local formatted YYYY-MM-DDTHH:mm
    const now = new Date();
    const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    const [dateTime, setDateTime] = useState(defaultDateTime);
    const [person, setPerson] = useState(role === 'employee' ? selectedPerson : (persons[0] || ''));
    const [customPerson, setCustomPerson] = useState('');
    const [fromWho, setFromWho] = useState('কোম্পানি ফান্ড');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalPerson = person === '__new__' ? customPerson.trim() : person.trim();

        if (!finalPerson) {
            setError('অনুগ্রহ করে যিনি টাকা গ্রহণ করেছেন তার নাম লিখুন বা সিলেক্ট করুন।');
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError('অনুগ্রহ করে টাকার সঠিক পরিমাণ লিখুন (০ এর বেশি)।');
            return;
        }

        if (!dateTime) {
            setError('অনুগ্রহ করে তারিখ ও সময় নির্বাচন করুন।');
            return;
        }

        setError('');
        onSubmit({
            person: finalPerson,
            from_who: fromWho.trim() || 'কোম্পানি ফান্ড',
            amount: Number(amount),
            date_time: dateTime,
            purpose: purpose.trim(),
        });

        // Reset
        setAmount('');
        setPurpose('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white/20">
                            <HandCoins className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">টাকা গ্রহণ (অগ্রিম তহবিল)</h3>
                            <p className="text-xs text-emerald-100">কোম্পানি বা কারো থেকে নেওয়া অগ্রিম টাকার তথ্য</p>
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

                    {/* Date and Time */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            তারিখ ও সময় <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Who received (Person) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            কে টাকা গ্রহণ করেছেন (ব্যক্তি) <span className="text-rose-500">*</span>
                        </label>
                        {role === 'employee' ? (
                            <input
                                type="text"
                                value={selectedPerson}
                                disabled
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold cursor-not-allowed"
                            />
                        ) : (
                            <div className="space-y-2">
                                <select
                                    value={person}
                                    onChange={(e) => setPerson(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {persons.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                    <option value="__new__">+ নতুন ব্যক্তির নাম লিখুন</option>
                                </select>
                                {person === '__new__' && (
                                    <input
                                        type="text"
                                        placeholder="নতুন ব্যক্তির নাম লিখুন..."
                                        value={customPerson}
                                        onChange={(e) => setCustomPerson(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 bg-emerald-50/50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        autoFocus
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* From Whom */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-emerald-600" />
                            কার থেকে নেওয়া হয়েছে <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="যেমন: কোম্পানি ফান্ড, অ্যাকাউন্টস, এমডি স্যার"
                            value={fromWho}
                            onChange={(e) => setFromWho(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="any"
                            placeholder="যেমন: ২০০০"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* Purpose */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            গ্রহণের কারণ বা উদ্দেশ্য
                        </label>
                        <textarea
                            rows="2"
                            placeholder="যেমন: ফিল্ড ভিজিট, স্টেশনারি কেনা বা জরুরি ক্লায়েন্ট মিটিং..."
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        ></textarea>
                    </div>

                    {/* Submit Buttons */}
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
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all"
                        >
                            সংরক্ষণ করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
