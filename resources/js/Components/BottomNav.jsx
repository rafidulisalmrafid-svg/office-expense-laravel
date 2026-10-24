import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    FolderKanban,
    HandCoins, 
    Receipt, 
    RotateCcw, 
    FileText,
    History,
    Users,
    Tags,
    MoreHorizontal,
    X,
    ChevronRight,
    Sparkles
} from 'lucide-react';

export default function BottomNav({
    activeTab = 'overview',
    onTabChange,
    officeSummary = {},
    activeRole = 'admin',
    activeUserPendingAllocations = [],
}) {
    const isEmployee = activeRole === 'employee';
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    // Primary items visible directly in the mobile bottom bar
    const primaryMobileTabs = isEmployee ? [
        {
            id: 'overview',
            label: 'হোম',
            icon: LayoutDashboard,
        },
        {
            id: 'projects',
            label: 'প্রজেক্ট',
            icon: FolderKanban,
            hasBadge: officeSummary.pending_project_docs_count > 0,
        },
        {
            id: 'expenses',
            label: 'দৈনিক খরচ',
            icon: Receipt,
        },
        {
            id: 'requests',
            label: 'বরাদ্দ',
            icon: HandCoins,
            hasBadge: activeUserPendingAllocations.length > 0,
        },
        {
            id: 'returns',
            label: 'ফেরত',
            icon: RotateCcw,
        },
        {
            id: 'audit',
            label: 'হিস্ট্রি',
            icon: History,
        },
    ] : [
        {
            id: 'overview',
            label: 'হোম',
            icon: LayoutDashboard,
        },
        {
            id: 'projects',
            label: 'প্রজেক্ট',
            icon: FolderKanban,
            hasBadge: officeSummary.pending_settlements_count > 0,
        },
        {
            id: 'expenses',
            label: 'খরচ',
            icon: Receipt,
            hasBadge: officeSummary.pending_expenses_count > 0,
        },
        {
            id: 'employees',
            label: 'লেজার',
            icon: Users,
            hasBadge: officeSummary.pending_users_count > 0,
        },
        {
            id: 'requests',
            label: 'রিকোয়েস্ট',
            icon: HandCoins,
            hasBadge: officeSummary.pending_fund_requests_count > 0,
        },
    ];

    // Secondary items inside the "More (আরও)" menu drawer for Admin
    const moreMenuTabs = [
        {
            id: 'returns',
            label: 'অব্যবহৃত টাকা ফেরত (Returns)',
            desc: 'কর্মচারীদের ফেরত দেওয়া ক্যাশ গ্রহণ ও অনুমোদন',
            icon: RotateCcw,
        },
        {
            id: 'categories',
            label: 'খরচের ধরন ও খাত (Categories)',
            desc: 'খরচের ক্যাটাগরি তৈরি, এডিট ও বাজেট সীমা',
            icon: Tags,
        },
        {
            id: 'reports',
            label: 'অফিস PDF রিপোর্ট (Reports)',
            desc: 'দৈনিক ও মাসিক হিসাবের অফিশিয়াল প্রিন্ট ও সামারি',
            icon: FileText,
            badge: 'PDF',
        },
        {
            id: 'audit',
            label: 'অডিট ট্রেইল (Audit Trail)',
            desc: 'সিস্টেমের সমস্ত লেনদেনের ডিজিটাল লগ ও রেকর্ড',
            icon: History,
        },
    ];

    const handleSelectTab = (tabId) => {
        onTabChange(tabId);
        setIsMoreOpen(false);
    };

    return (
        <>
            {/* More Menu Drawer / Bottom Sheet */}
            {isMoreOpen && (
                <div className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-200">
                    <div 
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMoreOpen(false)}
                    />
                    
                    <div className="fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-250 z-50">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    আরও অপশন ও মেনু
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMoreOpen(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {moreMenuTabs.map((item) => {
                                const Icon = item.icon;
                                const isCurrent = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelectTab(item.id)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${
                                            isCurrent
                                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                                                : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${
                                                isCurrent 
                                                    ? 'bg-indigo-600 text-white' 
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold">{item.label}</span>
                                                    {item.badge && (
                                                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1 px-1.5 shadow-lg safe-bottom">
                <div className="flex items-center justify-around">
                    {primaryMobileTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onTabChange(tab.id)}
                                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                                    isActive
                                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                                }`}
                            >
                                <div className="relative">
                                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : ''} transition-transform`} />
                                    {tab.hasBadge && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                                    )}
                                </div>
                                <span className="text-[10px] mt-0.5 whitespace-nowrap">{tab.label}</span>
                            </button>
                        );
                    })}

                    {/* Admin "More" Tab to trigger Drawer */}
                    {!isEmployee && (
                        <button
                            type="button"
                            onClick={() => setIsMoreOpen(true)}
                            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                                moreMenuTabs.some(t => t.id === activeTab)
                                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                            }`}
                        >
                            <MoreHorizontal className="w-5 h-5" />
                            <span className="text-[10px] mt-0.5 whitespace-nowrap">আরও</span>
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
