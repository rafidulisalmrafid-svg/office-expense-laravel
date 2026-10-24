import React, { useState, useEffect } from 'react';
import { X, Receipt, Upload, Camera, FileCheck, AlertCircle, Sparkles, FolderKanban } from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, getLocalDateStr } from '../../utils/formatters';

export default function AddExpenseModal({
    isOpen,
    onClose,
    activeUser,
    categories = [],
    projects = [],
    initialProjectId = null,
    initialDate = null,
    useBanglaDigits = true,
}) {
    if (!isOpen) return null;

    const isEmployee = activeUser?.role === 'employee';
    const remainingOfficeFunds = activeUser?.balance_summary?.remaining_office_funds || 0;

    const [expenseType, setExpenseType] = useState(() => initialProjectId ? 'project' : 'office'); // 'office' or 'project'
    const [projectId, setProjectId] = useState(() => initialProjectId || '');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState(() => categories[0]?.id || '');
    const [expenseDate, setExpenseDate] = useState(() => initialDate || getLocalDateStr());
    const [description, setDescription] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [fundSource, setFundSource] = useState('auto'); // auto, office_advance, own_pocket
    const [isDraft, setIsDraft] = useState(() => isEmployee ? true : false);
    const [receiptImage, setReceiptImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialProjectId) {
            setExpenseType('project');
            setProjectId(initialProjectId);
        }
        if (initialDate) {
            setExpenseDate(initialDate);
        }
    }, [initialProjectId, initialDate]);

    const selectedCategory = categories.find(c => c.id === Number(categoryId));
    const isOtherCategory = selectedCategory && (
        selectedCategory.name_bn?.includes('অন্যান্য') || 
        selectedCategory.name?.toLowerCase().includes('other') || 
        selectedCategory.name?.toLowerCase().includes('misc')
    );

    const selectedProject = projects.find(p => p.id === Number(projectId));
    const projectRemaining = selectedProject ? (Number(selectedProject.financial_summary?.remaining_balance) || 0) : null;

    // Live balance calculation preview
    const expAmount = Number(amount) || 0;
    const isOfficeExpense = expenseType === 'office' || !projectId;
    const isExceedingOffice = isOfficeExpense && expAmount > remainingOfficeFunds;
    const isExceedingProject = !isOfficeExpense && projectRemaining !== null && expAmount > projectRemaining;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Quick receipt generator for instant demo testing
    const handleAttachDemoReceipt = () => {
        const cat = categories.find(c => c.id === Number(categoryId))?.name_bn || 'অফিস খরচ';
        const amt = expAmount || 450;
        const svgReceipt = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2" rx="8"/><rect x="20" y="20" width="360" height="45" rx="4" fill="%234f46e5"/><text x="200" y="48" fill="%23ffffff" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">OFFICIAL CASH MEMO / BILL</text><text x="35" y="95" fill="%23334155" font-family="sans-serif" font-size="13">Bill No: %23BILL-${Date.now().toString().slice(-6)}</text><text x="35" y="125" fill="%23334155" font-family="sans-serif" font-size="13">Category: ${encodeURIComponent(cat)}</text><text x="35" y="155" fill="%23334155" font-family="sans-serif" font-size="13">Purchased By: ${encodeURIComponent(activeUser?.name || 'Employee')}</text><text x="35" y="185" fill="%23334155" font-family="sans-serif" font-size="14" font-weight="bold">Total Amount: BDT ${amt}.00</text><circle cx="330" cy="190" r="28" fill="%2310b981" opacity="0.2"/><text x="330" y="195" fill="%23059669" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">VERIFIED PAID</text></svg>`;
        setReceiptImage(svgReceipt);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0 || !description.trim() || !categoryId) {
            alert('অনুগ্রহ করে খরচের পরিমাণ, ক্যাটাগরি ও বিবরণ সঠিকভাবে পূরণ করুন।');
            return;
        }

        if (isOtherCategory && (!otherReason || !otherReason.trim())) {
            alert('বিশেষ নিয়ম: অন্যান্য খরচের (Other Expense) জন্য খরচের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।');
            return;
        }

        setIsSubmitting(true);
        router.post('/expenses', {
            user_id: activeUser.id,
            project_id: projectId || null,
            expense_date: expenseDate,
            category_id: categoryId,
            amount: Number(amount),
            fund_source: fundSource,
            is_draft: isDraft,
            description: description.trim(),
            other_reason: isOtherCategory ? otherReason.trim() : null,
            receipt_image: receiptImage,
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
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                প্রতিদিনের খরচ যোগ করুন (Daily Expense)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                এন্ট্রিদাতা: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeUser?.name}</span> ({activeUser?.employee_id})
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

                {/* Real-time Dynamic Balance Impact Info */}
                <div className={`my-3 p-3.5 rounded-2xl border text-xs transition-colors ${
                    isOfficeExpense
                        ? (isExceedingOffice
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300')
                        : (isExceedingProject
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            : 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300')
                }`}>
                    {isOfficeExpense ? (
                        <>
                            <div className="flex items-center justify-between font-bold">
                                <span>দৈনিক অফিস ফান্ড ব্যালেন্স:</span>
                                <span className={remainingOfficeFunds < 0 ? 'text-rose-600 dark:text-rose-400' : ''}>
                                    {remainingOfficeFunds < 0 ? `−${formatCurrency(Math.abs(remainingOfficeFunds), useBanglaDigits)}` : formatCurrency(remainingOfficeFunds, useBanglaDigits)}
                                </span>
                            </div>
                            {isExceedingOffice ? (
                                <p className="mt-1.5 text-[11px] text-rose-700 dark:text-rose-400 font-semibold">
                                    ⚠️ সতর্কবার্তা: এই খরচের পর অফিস ফান্ডে −{formatCurrency(Math.abs(remainingOfficeFunds - expAmount), useBanglaDigits)} ঋণাত্মক ব্যালেন্স তৈরি হবে (অতিরিক্ত খরচ)।
                                </p>
                            ) : (
                                <p className="mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                                    ✓ খরচের পর অফিস ফান্ড অবশিষ্ট থাকবে: <strong>{formatCurrency(remainingOfficeFunds - expAmount, useBanglaDigits)}</strong>
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between font-bold">
                                <span>{selectedProject ? selectedProject.name : 'প্রজেক্ট'} বাজেট:</span>
                                <span>{formatCurrency(projectRemaining || 0, useBanglaDigits)}</span>
                            </div>
                            {isExceedingProject ? (
                                <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                                    ⚠️ এই খরচ প্রজেক্টের বরাদ্দ বাজেট অতিক্রম করবে।
                                </p>
                            ) : (
                                <p className="mt-1.5 text-[11px] text-teal-700 dark:text-teal-400">
                                    ✓ খরচের পর এই প্রজেক্টে অবশিষ্ট থাকবে: <strong>{formatCurrency((projectRemaining || 0) - expAmount, useBanglaDigits)}</strong>
                                </p>
                            )}
                        </>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Fund Destination Selector (Requirement 4) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            খরচের খাত নির্বাচন (Fund Destination) <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setExpenseType('office');
                                    setProjectId('');
                                }}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    expenseType === 'office'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>দৈনিক অফিস খরচ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setExpenseType('project');
                                    if (!projectId && projects.length > 0) {
                                        setProjectId(projects[0].id);
                                    }
                                }}
                                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    expenseType === 'project'
                                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <FolderKanban className="w-3.5 h-3.5" />
                                <span>প্রজেক্ট খরচ</span>
                            </button>
                        </div>
                    </div>

                    {/* Project Dropdown (Visible only when Project Expense is selected) */}
                    {expenseType === 'project' && (
                        <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 animate-in fade-in duration-200">
                            <label className="block text-xs font-bold text-teal-900 dark:text-teal-200 mb-1">
                                নির্দিষ্ট প্রজেক্ট <span className="text-rose-500">*</span>
                            </label>
                            <select
                                required
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                            >
                                <option value="">-- প্রজেক্ট বেছে নিন --</option>
                                {projects.filter(p => p.status === 'active').map((p) => {
                                    const rem = p.financial_summary?.remaining_balance || 0;
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {p.code} - {p.name} (অবশিষ্ট: ৳{rem})
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-1">
                                এই খরচ শুধু এই প্রজেক্টের ফান্ড থেকে বাদ যাবে। অফিস খরচের ফান্ড সম্পূর্ণ অক্ষত থাকবে।
                            </p>
                        </div>
                    )}

                    {/* Amount & Date Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                খরচের পরিমাণ (টাকায়) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                    ৳
                                </span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="২০০"
                                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                খরচের তারিখ <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            খরচের ক্যাটাগরি <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name_bn} ({c.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Special Rule: Other Expense Mandatory Reason Field */}
                    {isOtherCategory && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <label className="block text-xs font-extrabold text-amber-900 dark:text-amber-200">
                                    অন্যান্য খরচের সুনির্দিষ্ট কারণ <span className="text-rose-600 font-black">* (বাধ্যতামূলক)</span>
                                </label>
                            </div>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300 mb-2 leading-relaxed">
                                <strong>বিশেষ নিয়ম:</strong> খরচের ধরন হিসেবে অন্যান্য খরচ নির্বাচন করলে ঠিক কী কারণে খরচটি করা হয়েছে তা অবশ্যই উল্লেখ করতে হবে। এই কারণ উল্লেখ না করে বিল সাবমিট করা যাবে না।
                            </p>
                            <textarea
                                rows="2"
                                required
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                placeholder="ঠিক কী কারণে খরচটি করা হয়েছে তা স্পষ্টভাবে লিখুন (উদা: জরুরি কুরিয়ার প্যাকিং বক্স ও টেপ ক্রয়)..."
                                className={`w-full px-3 py-2 rounded-xl border ${
                                    !otherReason.trim()
                                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                                        : 'border-amber-400 focus:ring-amber-500 bg-white dark:bg-slate-900'
                                } text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden`}
                            />
                            {!otherReason.trim() ? (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                                    ⚠️ সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।
                                </p>
                            ) : (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                    ✓ কারণ উল্লেখ করা হয়েছে।
                                </p>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            খরচের বিবরণ ও উদ্দেশ্য <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows="2"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="যেমন: ধানমন্ডি থেকে গুলশান অফিস মিটিংয়ে উবার ভাড়া"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                    </div>

                    {/* Receipt Upload / Attachment */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                বিল বা রসিদের ছবি (ভাউচার)
                            </label>
                            <button
                                type="button"
                                onClick={handleAttachDemoReceipt}
                                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>ডেমো ভাউচার তৈরি করুন</span>
                            </button>
                        </div>

                        {receiptImage ? (
                            <div className="relative p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 truncate">
                                    <img src={receiptImage} alt="Receipt preview" className="w-12 h-12 object-cover rounded-xl border border-slate-300" />
                                    <div>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <FileCheck className="w-3.5 h-3.5" /> রসিদ সংযুক্ত হয়েছে
                                        </span>
                                        <span className="text-[10px] text-slate-400 block truncate">ক্লিক করে পরিবর্তন করতে পারেন</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReceiptImage(null)}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/30 transition-all">
                                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    ক্যামেরা দিয়ে ছবি তুলুন বা ফাইল আপলোড করুন
                                </span>
                                <span className="text-[10px] text-slate-400">PNG, JPG বা WebP</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Fund Source Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            টাকা ব্যয়ের উৎস (Fund Source)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setFundSource('auto')}
                                className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                                    fundSource === 'auto'
                                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                স্বয়ংক্রিয় সমন্বয়
                            </button>
                            <button
                                type="button"
                                onClick={() => setFundSource('office_advance')}
                                className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                                    fundSource === 'office_advance'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                অফিস অগ্রিম থেকে
                            </button>
                            <button
                                type="button"
                                onClick={() => setFundSource('own_pocket')}
                                className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                                    fundSource === 'own_pocket'
                                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                নিজের পকেট থেকে
                            </button>
                        </div>
                    </div>

                    {/* Strict Rules Box */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 text-xs flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-[11px] leading-relaxed">
                            <p className="font-bold text-indigo-900 dark:text-indigo-200">
                                ব্যালেন্স ও খরচের নিয়মাবলী:
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 text-indigo-800 dark:text-indigo-300">
                                <li>খরচ সংরক্ষণের সাথে সাথে সংশ্লিষ্ট {expenseType === 'project' ? 'প্রজেক্ট' : 'অফিস'} ফান্ডের ব্যালেন্স থেকে টাকা স্বয়ংক্রিয়ভাবে বাদ যাবে।</li>
                                <li>সংরক্ষিত খরচ এডিট করা যাবে না। ভুল হলে চূড়ান্ত সাবমিটের আগে তালিকা থেকে ডিলিট করে সঠিক তথ্য দিয়ে নতুন এন্ট্রি দিন।</li>
                                <li>খরচ ডিলিট করলে সেই টাকা তাৎক্ষণিকভাবে সংশ্লিষ্ট ফান্ডের ব্যালেন্সে পুনরায় যোগ হবে।</li>
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                            <Receipt className="w-4 h-4" />
                            <span>{isSubmitting ? 'সংরক্ষিত হচ্ছে...' : 'খরচ সংরক্ষণ করুন'}</span>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
