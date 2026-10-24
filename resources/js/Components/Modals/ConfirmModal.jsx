import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'আপনি কি নিশ্চিত?',
    message = 'এই তথ্যটি স্থায়ীভাবে মুছে যাবে। এটি আর ফিরিয়ে আনা যাবে না।',
    confirmText = 'হ্যাঁ, নিশ্চিত',
    cancelText = 'বাতিল',
    isDanger = true,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 p-6 text-center space-y-4">
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                    isDanger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60'
                }`}>
                    <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-95 ${
                            isDanger ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
