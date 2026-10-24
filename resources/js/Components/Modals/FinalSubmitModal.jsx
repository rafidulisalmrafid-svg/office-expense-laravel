import React, { useMemo } from 'react';
import { X, Send, FileCheck, Receipt, Building2, Wallet, CheckCircle2, ShieldAlert, Layers, Printer, Download } from 'lucide-react';
import { formatCurrency, formatDate, extractDateStr } from '../../utils/formatters';
import { openDailyExpensePdf } from '../../utils/dailyExpensePdf';

export default function FinalSubmitModal({
    isOpen,
    onClose,
    selectedDate,
    expenses = [],
    allocatedAmount = 0,
    user = null,
    onConfirmSubmit,
    isSubmitting = false,
    useBanglaDigits = true,
}) {
    if (!isOpen) return null;

    // Filter to only draft and revision expenses for this date
    const draftItems = expenses.filter(exp => {
        const expDate = extractDateStr(exp.expense_date);
        return expDate === selectedDate && (exp.status === 'draft' || exp.status === 'revision');
    });

    let totalAmount = 0;
    draftItems.forEach(exp => {
        totalAmount += (Number(exp.amount) || 0);
    });

    const remainingBalance = Number(allocatedAmount) - totalAmount;

    // Category-wise Breakdown (Requirement 5)
    const categoryBreakdown = useMemo(() => {
        const map = {};
        draftItems.forEach(exp => {
            const cat = exp.category_name || 'অন্যান্য খরচ';
            map[cat] = (map[cat] || 0) + (Number(exp.amount) || 0);
        });
        return Object.entries(map).map(([name, sum]) => ({ name, sum }));
    }, [draftItems]);

    // Handle PDF Download / Print
    const handleDownloadPdf = () => {
        openDailyExpensePdf({
            user: user || draftItems[0]?.user || null,
            date: selectedDate,
            expenses: draftItems,
            allocatedAmount,
            useBanglaDigits,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                দৈনিক খরচের পূর্ণাঙ্গ রিপোর্ট ও চূড়ান্ত সাবমিট
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                তারিখ: <strong className="text-slate-800 dark:text-slate-200">{formatDate(selectedDate, useBanglaDigits)}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={draftItems.length === 0}
                            className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                            title="সাবমিট করার আগে আজকের খরচের পূর্ণাঙ্গ PDF ডাউনলোড বা প্রিন্ট করুন"
                        >
                            <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="hidden sm:inline">PDF ডাউনলোড / প্রিন্ট</span>
                            <span className="sm:hidden">PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 1. Daily Financial Breakdown (Requirement 1 & 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    {/* Allocation */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                        <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                            আজকের মোট বরাদ্দ
                        </span>
                        <div className="text-xl font-black text-indigo-950 dark:text-indigo-100">
                            {formatCurrency(allocatedAmount, useBanglaDigits)}
                        </div>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                            অফিস ফান্ড / অগ্রিম
                        </span>
                    </div>

                    {/* Total Expense */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                            সারাদিনের মোট খরচ
                        </span>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(totalAmount, useBanglaDigits)}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            মোট {draftItems.length}টি খরচের সমষ্টি
                        </span>
                    </div>

                    {/* Remaining */}
                    <div className={`p-3.5 rounded-2xl border ${
                        remainingBalance >= 0
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                    }`}>
                        <span className={`text-[11px] font-semibold block mb-0.5 ${
                            remainingBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                        }`}>
                            {remainingBalance >= 0 ? 'অবশিষ্ট টাকা' : 'অতিরিক্ত খরচ (পকেট ক্লেইম)'}
                        </span>
                        <div className={`text-xl font-black ${
                            remainingBalance >= 0 ? 'text-emerald-950 dark:text-emerald-100' : 'text-amber-950 dark:text-amber-100'
                        }`}>
                            {formatCurrency(Math.abs(remainingBalance), useBanglaDigits)}
                        </div>
                        <span className={`text-[10px] ${
                            remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                            {remainingBalance >= 0 ? 'অফিস ফান্ডের উদ্বৃত্ত টাকা' : 'অফিস কর্মচারীকে পরিশোধ করবে'}
                        </span>
                    </div>
                </div>

                {/* Category-wise Breakdown Badges (Requirement 5) */}
                {categoryBreakdown.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 my-3">
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span>খাতভিত্তিক খরচের বিভাজন (Category Breakdown):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categoryBreakdown.map((item, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium shadow-xs">
                                    <span className="font-bold">{item.name}:</span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(item.sum, useBanglaDigits)}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Itemized Expenses Table */}
                <div className="my-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                        <span>খরচের বিস্তারিত তালিকা ({draftItems.length}টি আইটেম):</span>
                        <span className="text-[11px] text-slate-500 font-normal">চূড়ান্ত জমা দেওয়ার আগে মিলিয়ে নিন</span>
                    </h4>

                    <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        {draftItems.length > 0 ? (
                            draftItems.map((exp, idx) => (
                                <div key={exp.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                            {idx + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                                    {exp.category_name}
                                                </span>
                                                {exp.receipt_image ? (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                                        <FileCheck className="w-3 h-3" /> রসিদ যুক্ত
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">রসিদ নেই</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                {exp.description}
                                                {exp.other_reason && ` (${exp.other_reason})`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-black text-slate-900 dark:text-white">
                                            {formatCurrency(exp.amount, useBanglaDigits)}
                                        </div>
                                        <span className="text-[10px] text-slate-400 capitalize">
                                            {exp.status === 'revision' ? 'সংশোধিত' : 'খসড়া'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-xs text-slate-500">
                                কোনো খসড়া খরচ পাওয়া যায়নি।
                            </div>
                        )}
                    </div>
                </div>

                {/* Important Post-Submit Lock Warning */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <strong className="block font-bold mb-0.5">সাবমিটের পর নিয়ন্ত্রণ ও লক:</strong>
                        <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-300">
                            একবার 'Submit Daily Expense Report' করলে পুরো দিনের বিল অ্যাডমিনের কাছে জমা হয়ে যাবে এবং স্বয়ংক্রিয়ভাবে লক হয়ে যাবে। পরবর্তীতে কোনো সংশোধনের প্রয়োজন হলে অ্যাডমিন তা 'সংশোধনে ফেরত' পাঠালে পুনরায় এডিট করতে পারবেন।
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={draftItems.length === 0}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs disabled:opacity-50"
                    >
                        <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>PDF ডাউনলোড / প্রিন্ট</span>
                    </button>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            ফিরে যান
                        </button>
                        <button
                            type="button"
                            onClick={onConfirmSubmit}
                            disabled={isSubmitting || draftItems.length === 0}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                            <span>{isSubmitting ? 'জমা হচ্ছে...' : 'Submit Daily Expense Report'}</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
