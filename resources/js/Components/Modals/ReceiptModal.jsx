import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function ReceiptModal({
    isOpen,
    onClose,
    receiptSrc,
    title = 'রসিদ ও ভাউচার প্রিভিউ',
}) {
    if (!isOpen || !receiptSrc) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            অফিসিয়াল খরচের সমর্থক প্রমাণপত্র
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Receipt Image Display */}
                <div className="my-4 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[300px] max-h-[70vh] overflow-auto">
                    <img
                        src={receiptSrc}
                        alt="Receipt"
                        className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-800"
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                        নিরাপদ ডিজিটাল সংরক্ষণাগার থেকে লোডকৃত
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold transition-colors"
                    >
                        বন্ধ করুন
                    </button>
                </div>

            </div>
        </div>
    );
}
