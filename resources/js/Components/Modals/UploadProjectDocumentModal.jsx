import React, { useState } from 'react';
import { X, Upload, FileText, Camera, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function UploadProjectDocumentModal({
    isOpen,
    onClose,
    project,
    documentRequest = null,
    useBanglaDigits = true,
}) {
    if (!isOpen || !project) return null;

    const [fileName, setFileName] = useState('');
    const [fileData, setFileData] = useState(null);
    const [fileType, setFileType] = useState('image');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setFileType(file.type.includes('pdf') ? 'pdf' : 'image');
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileData(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Quick demo SVG generator for testing without requiring local camera/scans
    const handleAttachDemoReceipt = () => {
        const now = new Date();
        const demoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="300" viewBox="0 0 450 300"><rect width="450" height="300" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2" rx="10"/><rect x="25" y="25" width="400" height="50" rx="6" fill="%23059669"/><text x="225" y="57" fill="%23ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">OFFICIAL CASH MEMO &amp; TAX INVOICE</text><text x="40" y="110" fill="%231e293b" font-family="sans-serif" font-size="14" font-weight="bold">Project: ${encodeURIComponent(project.name)} (${project.code})</text><text x="40" y="140" fill="%23475569" font-family="sans-serif" font-size="13">Invoice No: %23MEMO-${Date.now().toString().slice(-6)}</text><text x="40" y="170" fill="%23475569" font-family="sans-serif" font-size="13">Date: ${now.toLocaleDateString()}</text><text x="40" y="200" fill="%23475569" font-family="sans-serif" font-size="13">Vendor: Popular Hardware &amp; Electric Store, Dhaka</text><text x="40" y="235" fill="%230f766e" font-family="sans-serif" font-size="15" font-weight="bold">AUDIT STATUS: VERIFIED &amp; SUBMITTED</text><circle cx="370" cy="225" r="32" fill="%2310b981" opacity="0.18"/><text x="370" y="230" fill="%23047857" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">OFFICE AUDIT</text></svg>`;
        setFileData(demoSvg);
        setFileName(`Voucher_${project.code}_${Date.now().toString().slice(-4)}.png`);
        setFileType('image');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fileData) {
            alert('অনুগ্রহ করে একটি ছবি বা PDF ফাইল নির্বাচন করুন অথবা ডেমো ভাউচার জেনারেট করুন।');
            return;
        }

        setIsSubmitting(true);
        router.post(`/projects/${project.id}/upload-document`, {
            project_document_request_id: documentRequest?.id || null,
            expense_id: documentRequest?.expense_id || null,
            file_name: fileName || `Document_${project.code}.png`,
            file_data: fileData,
            file_type: fileType,
            notes: notes.trim(),
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
                        <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                প্রমাণপত্র / ভাউচার আপলোড
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {project.name} ({project.code})
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

                {/* If fulfilling a document request */}
                {documentRequest && (
                    <div className="mt-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs">
                        <span className="font-bold text-purple-900 dark:text-purple-200 block">
                            অ্যাডমিনের তলব: {documentRequest.title}
                        </span>
                        {documentRequest.description && (
                            <p className="text-purple-700 dark:text-purple-300 mt-1 text-[11px]">
                                {documentRequest.description}
                            </p>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* File Upload Zone */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                মেমো / রসিদের ছবি বা PDF আপলোড *
                            </label>
                            <button
                                type="button"
                                onClick={handleAttachDemoReceipt}
                                className="flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>ডেমো ভাউচার তৈরি করুন</span>
                            </button>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            {fileData ? (
                                <div className="space-y-2">
                                    {fileType === 'image' ? (
                                        <img
                                            src={fileData}
                                            alt="Preview"
                                            className="max-h-40 mx-auto rounded-xl object-contain border border-slate-200 dark:border-slate-700"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                            <FileText className="w-8 h-8 text-rose-500" />
                                            <span className="text-xs font-semibold">{fileName} (PDF)</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xs text-slate-500">{fileName}</span>
                                        <button
                                            type="button"
                                            onClick={() => { setFileData(null); setFileName(''); }}
                                            className="text-xs text-rose-500 hover:underline"
                                        >
                                            পরিবর্তন করুন
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                                        ছবি তুলতে ক্লিক করুন বা ফাইল সিলেক্ট করুন
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                        JPG, PNG অথবা PDF ফাইল (সর্বোচ্চ 10MB)
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            প্রমাণপত্রের বিবরণ বা নোট
                        </label>
                        <textarea
                            rows={2}
                            placeholder="যেমন: নিউ মার্কেট থেকে ক্রয়কৃত ক্যাশ মেমো নং #৬৪১২"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Buttons */}
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
                            disabled={isSubmitting || !fileData}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'আপলোড হচ্ছে...' : 'প্রমাণপত্র জমা দিন'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
