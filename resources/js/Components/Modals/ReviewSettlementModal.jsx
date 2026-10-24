import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, FileQuestion, ArrowDownRight, ArrowUpRight, Eye, Download, FileText, Check } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency } from '../../utils/formatters';

export default function ReviewSettlementModal({
    isOpen,
    onClose,
    settlement,
    onRequestMoreDocs,
    onViewReceipt,
    useBanglaDigits = true,
}) {
    if (!isOpen || !settlement) return null;

    const project = settlement.project;
    const employee = settlement.user;

    const allocated = Number(settlement.allocated_amount) || 0;
    const spent = Number(settlement.spent_amount) || 0;
    const balance = Number(settlement.balance_amount) || 0;

    const isRefundToOffice = settlement.settlement_type === 'refund_to_office' || balance > 0;
    const isReimbursementToEmployee = settlement.settlement_type === 'reimbursement_to_employee' || balance < 0;

    const [adminNotes, setAdminNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAction = (action) => {
        setIsSubmitting(true);
        router.post(`/projects/settlements/${settlement.id}/review`, {
            action: action,
            admin_notes: adminNotes.trim(),
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

    const documents = project?.documents || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                প্রজেক্ট সমাপ্তি ও হিসাব পর্যালোচনা (Admin Review)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {project?.name} ({project?.code}) • দায়িত্বপ্রাপ্ত: {employee?.name}
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

                <div className="mt-4 space-y-4">
                    {/* Financial Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
                        <div>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">বরাদ্দকৃত টাকা</span>
                            <span className="block text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                                {formatCurrency(allocated, useBanglaDigits)}
                            </span>
                        </div>
                        <div className="border-x border-slate-200 dark:border-slate-700">
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">মোট খরচ হয়েছে</span>
                            <span className="block text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                {formatCurrency(spent, useBanglaDigits)}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">অবশিষ্ট / ব্যালেন্স</span>
                            <span className={`block text-sm sm:text-base font-extrabold mt-0.5 ${
                                isRefundToOffice 
                                    ? 'text-emerald-600 dark:text-emerald-400' 
                                    : isReimbursementToEmployee 
                                        ? 'text-rose-600 dark:text-rose-400' 
                                        : 'text-slate-700 dark:text-slate-300'
                            }`}>
                                {formatCurrency(Math.abs(balance), useBanglaDigits)}
                            </span>
                        </div>
                    </div>

                    {/* Settlement Assessment */}
                    {isRefundToOffice && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                                <ArrowDownRight className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                    এমপ্লয়ি অফিসকে ফেরত দেবে: {formatCurrency(balance, useBanglaDigits)}
                                </h4>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                                    অনুমোদন করলে এটি স্বয়ংক্রিয়ভাবে অফিসের নগদ ক্যাশ লেজারে 'ফান্ড ফেরত' হিসেবে জমা হবে।
                                </p>
                            </div>
                        </div>
                    )}

                    {isReimbursementToEmployee && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                                    কোম্পানি এমপ্লয়িকে পরিশোধ করবে: {formatCurrency(Math.abs(balance), useBanglaDigits)}
                                </h4>
                                <p className="text-[11px] text-rose-700 dark:text-rose-300/90 mt-0.5">
                                    এমপ্লয়ি অনুমোদিত সীমার অতিরিক্ত খরচ নিজের পকেট থেকে বহন করেছে। কোম্পানি তা প্রতিদান দেবে।
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Employee Notes */}
                    {settlement.employee_notes && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
                            <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">এমপ্লয়ির জমা দেওয়া নোট:</span>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">
                                "{settlement.employee_notes}"
                            </p>
                        </div>
                    )}

                    {/* Uploaded Documents / Vouchers Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                <span>জমা দেওয়া প্রমাণপত্র ও রশিদসমূহ ({documents.length}টি)</span>
                            </h4>
                            <button
                                type="button"
                                onClick={() => { onClose(); onRequestMoreDocs(project); }}
                                className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                <FileQuestion className="w-3.5 h-3.5" />
                                <span>আরো প্রমাণপত্র চান</span>
                            </button>
                        </div>

                        {documents.length === 0 ? (
                            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-500">
                                এখনও কোনো পৃথক প্রমাণপত্র আপলোড করা হয়নি। আপনি "আরো প্রমাণপত্র চান" বাটনে ক্লিক করে ভাউচার চাইতে পারেন।
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 text-xs"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="w-4 h-4 text-teal-500 shrink-0" />
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {doc.file_name}
                                            </span>
                                            {doc.notes && (
                                                <span className="text-[10px] text-slate-400 truncate">
                                                    • {doc.notes}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {doc.file_data && (
                                                <button
                                                    type="button"
                                                    onClick={() => onViewReceipt({ src: doc.file_data, title: doc.file_name })}
                                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 flex items-center gap-1 text-[11px]"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span>দেখুন</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Admin Review Note */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            অ্যাডমিনের অনুমোদন নোট / মন্তব্য
                        </label>
                        <input
                            type="text"
                            placeholder="যেমন: হিসাব ও ভাউচার যথাযথভাবে যাচাই করা হলো। গৃহীত।"
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => handleAction('reject')}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>প্রত্যাখ্যান ও সংশোধন পাঠান</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                বন্ধ করুন
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAction('approve')}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                            >
                                <Check className="w-4 h-4" />
                                <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'হিসাব অনুমোদন ও প্রজেক্ট সমাপ্ত করুন'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
