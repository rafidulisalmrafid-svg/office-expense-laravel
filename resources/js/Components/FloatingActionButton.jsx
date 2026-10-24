import React, { useState } from 'react';
import { Plus, HandCoins, ReceiptText, X } from 'lucide-react';

export default function FloatingActionButton({ onOpenAdvance, onOpenExpense }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="no-print fixed bottom-18 md:bottom-8 right-4 md:right-8 z-40">
            {/* Quick action popup cards */}
            {isOpen && (
                <div className="mb-3 flex flex-col gap-2.5 items-end animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onOpenAdvance();
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all text-sm font-bold"
                    >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <HandCoins className="w-4 h-4" />
                        </div>
                        <span>টাকা নিলাম (অগ্রিম গ্রহণ)</span>
                    </button>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onOpenExpense();
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all text-sm font-bold"
                    >
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                            <ReceiptText className="w-4 h-4" />
                        </div>
                        <span>নতুন খরচ এন্ট্রি</span>
                    </button>
                </div>
            )}

            {/* Main FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-full font-bold shadow-2xl transition-all duration-300 active:scale-95 ${
                    isOpen
                        ? 'bg-slate-800 text-white ring-4 ring-slate-400/30'
                        : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white hover:shadow-indigo-500/40 hover:scale-105 ring-4 ring-indigo-400/20'
                }`}
            >
                {isOpen ? (
                    <>
                        <X className="w-5 h-5" />
                        <span className="text-sm">বন্ধ করুন</span>
                    </>
                ) : (
                    <>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                        <span className="text-base tracking-wide">+ নতুন এন্ট্রি</span>
                    </>
                )}
            </button>
        </div>
    );
}
