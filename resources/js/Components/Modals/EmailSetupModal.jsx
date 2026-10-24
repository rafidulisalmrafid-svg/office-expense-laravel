import React, { useState } from 'react';
import { X, Mail, Key, Send, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function EmailSetupModal({
    isOpen,
    onClose,
    senderEmail = 'rafidul.labar.bd@gmail.com',
    isConfigured = false,
    statusText = '',
}) {
    if (!isOpen) return null;

    const [appPassword, setAppPassword] = useState('');
    const [testEmail, setTestEmail] = useState(senderEmail);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState(null); // { type: 'success' | 'error', text: '' }

    const handleSavePassword = (e) => {
        e.preventDefault();
        const cleanPass = appPassword.replace(/\s+/g, '');
        if (!cleanPass) {
            setFeedbackMsg({
                type: 'error',
                text: 'অনুগ্রহ করে গুগলের ১৬ অক্ষরের অ্যাপ পাসওয়ার্ড প্রদান করুন।',
            });
            return;
        }

        setIsSaving(true);
        setFeedbackMsg(null);

        router.post('/settings/mail', {
            mail_password: cleanPass,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false),
            onSuccess: () => {
                setAppPassword('');
                setFeedbackMsg({
                    type: 'success',
                    text: '✅ চমৎকার! আপনার ১৬ অক্ষরের গুগল অ্যাপ পাসওয়ার্ড সফলভাবে সংরক্ষিত ও সক্রিয় হয়েছে। নিচে টেস্ট মেইল পাঠিয়ে দেখতে পারেন।',
                });
            },
            onError: (err) => {
                setFeedbackMsg({
                    type: 'error',
                    text: 'পাসওয়ার্ড সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
                });
            }
        });
    };

    const handleSendTestEmail = (e) => {
        e.preventDefault();
        if (!testEmail.trim()) {
            setFeedbackMsg({
                type: 'error',
                text: 'অনুগ্রহ করে টেস্ট ইমেইল ঠিকানা প্রদান করুন।',
            });
            return;
        }

        setIsTesting(true);
        setFeedbackMsg(null);

        router.post('/settings/mail-test', {
            test_email: testEmail.trim(),
        }, {
            preserveScroll: true,
            onFinish: () => setIsTesting(false),
            onSuccess: () => {
                setFeedbackMsg({
                    type: 'success',
                    text: `✅ টেস্ট ইমেইল সফলভাবে ${testEmail} ঠিকানায় পাঠানো হয়েছে! আপনার জিমেইল ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।`,
                });
            },
            onError: (err) => {
                setFeedbackMsg({
                    type: 'error',
                    text: 'ইমেইল পাঠাতে ব্যর্থ হয়েছে। অ্যাপ পাসওয়ার্ড সঠিক আছে কিনা চেক করুন।',
                });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                ইমেইল সেটআপ ও লাইভ টেস্ট (Gmail SMTP)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                প্রেরক: <strong className="text-indigo-600 dark:text-indigo-400">{senderEmail}</strong>
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

                {/* Status Badge Box */}
                <div className={`my-4 p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                    isConfigured 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {isConfigured ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                        <div>
                            <div className="font-bold">
                                {isConfigured ? 'ইমেইল সার্ভিস সক্রিয় ও সেভ করা আছে' : 'অ্যাপ পাসওয়ার্ড কনফিগার করা প্রয়োজন'}
                            </div>
                            <div className="text-[11px] opacity-80">
                                {isConfigured ? 'বর্তমানে ১৬ অক্ষরের অ্যাপ পাসওয়ার্ড যুক্ত রয়েছে' : 'নতুন পাসওয়ার্ড দিয়ে সেভ করুন'}
                            </div>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        isConfigured 
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                    }`}>
                        {isConfigured ? 'সক্রিয় (Connected)' : 'খালি'}
                    </span>
                </div>

                {/* In-Modal Feedback Alert */}
                {feedbackMsg && (
                    <div className={`p-3.5 mb-4 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                        feedbackMsg.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                            : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
                    }`}>
                        {feedbackMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1 leading-relaxed font-semibold">{feedbackMsg.text}</span>
                    </div>
                )}

                {/* Configuration Specs Card */}
                <div className="my-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">SMTP Host:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">smtp.gmail.com (587 TLS)</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Sender Address:</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{senderEmail}</span>
                    </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
                        <Key className="w-4 h-4" />
                        <span>গুগল থেকে ১৬ অক্ষরের App Password পাওয়ার নিয়ম:</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                        <li>
                            আপনার জিমেইলে <strong>2-Step Verification</strong> চালু থাকতে হবে।
                        </li>
                        <li>
                            ব্রাউজারে যান: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold underline inline-flex items-center gap-0.5">myaccount.google.com/apppasswords <ExternalLink className="w-2.5 h-2.5" /></a>
                        </li>
                        <li>
                            অ্যাপের নাম লিখুন <strong>"Office Expense"</strong> এবং <strong>Create</strong> চাপুন।
                        </li>
                        <li>
                            প্রাপ্ত <strong>১৬ অক্ষরের পাসওয়ার্ডটি</strong> কপি করে নিচের বক্সে পেস্ট করুন।
                        </li>
                    </ol>
                </div>

                {/* Form 1: Save App Password */}
                <form onSubmit={handleSavePassword} className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                ১৬ অক্ষরের গুগল অ্যাপ পাসওয়ার্ড (App Password)
                            </label>
                            {isConfigured && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> পাসওয়ার্ড সেভ আছে
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                value={appPassword}
                                onChange={(e) => setAppPassword(e.target.value)}
                                placeholder={isConfigured ? "সেভ আছে (পরিবর্তন করতে চাইলে লিখুন)" : "যেমন: hgzo bokk pxif jhxn"}
                                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                            >
                                {isSaving ? 'সেভ হচ্ছে...' : 'পাসওয়ার্ড সেভ করুন'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Form 2: Test Email Delivery */}
                <form onSubmit={handleSendTestEmail} className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            লাইভ টেস্ট ইমেইল পাঠান (Inbox Verification)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                required
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="recipient@example.com"
                                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                            <button
                                type="submit"
                                disabled={isTesting}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isTesting ? 'পাঠানো হচ্ছে...' : 'টেস্ট করুন'}</span>
                            </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                            বাটন চাপলে <strong>{senderEmail}</strong> থেকে সরাসরি এই ঠিকানায় টেস্ট ইমেইল চলে যাবে।
                        </span>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                    >
                        বন্ধ করুন
                    </button>
                </div>

            </div>
        </div>
    );
}
