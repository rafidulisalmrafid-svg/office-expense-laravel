import React, { useState } from 'react';
import { 
    Tag, 
    Plus, 
    Edit2, 
    Trash2, 
    Car, 
    Utensils, 
    FileText, 
    Printer, 
    Package, 
    PhoneCall, 
    Users, 
    ShoppingBag, 
    HardHat, 
    Layers, 
    Receipt, 
    Wrench, 
    Laptop, 
    Coffee, 
    Search,
    AlertCircle,
    Info,
    CheckCircle2
} from 'lucide-react';
import { router } from '@inertiajs/react';

export default function CategoriesTab({
    categories = [],
    activeRole = 'admin',
    onOpenAddCategory,
    onOpenCreateCategory,
    onOpenEditCategory,
    useBanglaDigits = true,
}) {
    const isEmployee = activeRole === 'employee';
    const [searchQuery, setSearchQuery] = useState('');
    const handleOpenAdd = onOpenAddCategory || onOpenCreateCategory;

    const iconMap = {
        Car: Car,
        Utensils: Utensils,
        FileText: FileText,
        Printer: Printer,
        Package: Package,
        PhoneCall: PhoneCall,
        Users: Users,
        ShoppingBag: ShoppingBag,
        HardHat: HardHat,
        Layers: Layers,
        Receipt: Receipt,
        Wrench: Wrench,
        Laptop: Laptop,
        Coffee: Coffee,
    };

    const filteredCategories = categories.filter((cat) => {
        const query = searchQuery.toLowerCase();
        return (
            (cat.name_bn || '').toLowerCase().includes(query) ||
            (cat.name || '').toLowerCase().includes(query) ||
            (cat.description || '').toLowerCase().includes(query)
        );
    });

    const handleDelete = (cat) => {
        const count = cat.expenses_count || 0;
        if (count > 0) {
            alert(`এই ক্যাটাগরির অধীনে ${count}টি খরচের হিসাব বিদ্যমান রয়েছে। হিসাবের স্বচ্ছতা রক্ষার্থে এটি ডিলিট করা যাবে না। আপনি চাইলে ক্যাটাগরিটি এডিট করতে পারেন।`);
            return;
        }

        if (confirm(`আপনি কি নিশ্চিতভাবে "${cat.name_bn}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
            router.delete(`/categories/${cat.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-linear-to-r from-indigo-700 via-purple-700 to-pink-700 text-white shadow-xl shadow-purple-950/10">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
                            <Tag className="w-5 h-5 text-purple-200" />
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                            খরচের ধরন ব্যবস্থাপনা (Expense Categories)
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-2xl">
                        অফিসের প্রয়োজন অনুযায়ী নতুন খরচের ধরন তৈরি করুন, নাম ও বিবরণ এডিট করুন এবং অপ্রয়োজনীয় ধরন ডিলিট করুন।
                    </p>
                </div>

                {!isEmployee && (
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-purple-900 text-xs sm:text-sm font-bold shadow-md hover:bg-purple-50 active:scale-95 transition-all shrink-0"
                    >
                        <Plus className="w-4 h-4 text-purple-600" />
                        <span>+ নতুন খরচের ধরন</span>
                    </button>
                )}
            </div>

            {/* Special Notice: অন্যান্য খরচ নিয়ম */}
            <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-xs flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold block text-sm">বিশেষ নিয়ম — অন্যান্য খরচ (Other Expense):</span>
                    <p className="mt-0.5 text-amber-800 dark:text-amber-300/90">
                        এমপ্লয়ি যখন খরচের ধরন হিসেবে <strong>"অন্যান্য খরচ"</strong> নির্বাচন করবে, তখন সিস্টেমে স্বয়ংক্রিয়ভাবে একটি বাধ্যতামূলক অতিরিক্ত টেক্সট বক্স প্রদর্শিত হবে, যেখানে তাকে খরচের নির্দিষ্ট কারণ বিস্তারিত লিখতে হবে। কারণ উল্লেখ না করে কোনো বিল জমা দেওয়া যাবে না।
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ক্যাটাগরি বা বিবরণ দিয়ে খুঁজুন..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
                <span className="text-xs text-slate-500 font-semibold shrink-0">
                    মোট ধরন: {categories.length}টি
                </span>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => {
                    const IconComponent = iconMap[cat.icon] || Receipt;
                    const isOther = (cat.name_bn || '').includes('অন্যান্য') || (cat.name || '').toLowerCase().includes('other');
                    const expCount = cat.expenses_count || 0;

                    return (
                        <div
                            key={cat.id}
                            className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                                isOther
                                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-400/30'
                                    : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                            }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-2xl ${
                                            isOther 
                                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' 
                                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                                        }`}>
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <span>{cat.name_bn}</span>
                                                {isOther && (
                                                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-extrabold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                                                        বাধ্যতামূলক কারণ
                                                    </span>
                                                )}
                                            </h4>
                                            {cat.name && (
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    {cat.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons for Admin */}
                                    {!isEmployee && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => onOpenEditCategory(cat)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                                                title="এডিট করুন"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(cat)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                                title="ডিলিট করুন"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {cat.description && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2">
                                        {cat.description}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">ব্যবহৃত হিসাব:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {useBanglaDigits ? expCount.toLocaleString('bn-BD') : expCount}টি খরচ
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
