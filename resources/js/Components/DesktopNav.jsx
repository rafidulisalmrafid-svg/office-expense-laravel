import React from 'react';
import { 
    LayoutDashboard, 
    FolderKanban,
    HandCoins, 
    Receipt, 
    RotateCcw, 
    Users, 
    FileText, 
    History,
    Tags
} from 'lucide-react';

export default function DesktopNav({
    activeTab = 'overview',
    onTabChange,
    officeSummary = {},
    activeRole = 'admin',
    activeUserPendingAllocations = [],
}) {
    const isEmployee = activeRole === 'employee';

    const allTabs = [
        {
            id: 'overview',
            label: 'ড্যাশবোর্ড',
            icon: LayoutDashboard,
            badge: null,
        },
        {
            id: 'projects',
            label: isEmployee ? 'আমার প্রজেক্ট ও বরাদ্দ' : 'প্রজেক্ট খরচ ও বাজেট',
            icon: FolderKanban,
            badge: activeRole === 'admin' 
                ? (officeSummary.pending_settlements_count > 0 ? officeSummary.pending_settlements_count : null)
                : (officeSummary.pending_project_docs_count > 0 ? officeSummary.pending_project_docs_count : null),
            badgeColor: activeRole === 'admin' ? 'bg-amber-500' : 'bg-rose-500',
        },
        {
            id: 'requests',
            label: 'ফান্ড রিকোয়েস্ট ও বরাদ্দ',
            icon: HandCoins,
            badge: activeRole === 'admin' 
                ? (officeSummary.pending_fund_requests_count > 0 ? officeSummary.pending_fund_requests_count : null)
                : (activeUserPendingAllocations.length > 0 ? activeUserPendingAllocations.length : null),
            badgeColor: 'bg-amber-500',
        },
        {
            id: 'expenses',
            label: 'দৈনিক খরচ ও রসিদ',
            icon: Receipt,
            badge: activeRole === 'admin' && officeSummary.pending_expenses_count > 0 ? officeSummary.pending_expenses_count : null,
            badgeColor: 'bg-indigo-500',
        },
        {
            id: 'returns',
            label: 'অব্যবহৃত টাকা ফেরত',
            icon: RotateCcw,
            badge: null,
        },
        {
            id: 'categories',
            label: 'খরচের ধরন (Categories)',
            icon: Tags,
            badge: null,
            adminOnly: true,
        },
        {
            id: 'employees',
            label: 'কর্মচারী ও লেজার',
            icon: Users,
            badge: activeRole === 'admin' && officeSummary.pending_users_count > 0 ? officeSummary.pending_users_count : null,
            badgeColor: 'bg-purple-500',
            adminOnly: true,
        },
        {
            id: 'reports',
            label: 'অফিস PDF রিপোর্ট',
            icon: FileText,
            badge: 'PDF',
            badgeColor: 'bg-emerald-600',
            adminOnly: true,
        },
        {
            id: 'audit',
            label: isEmployee ? 'আমার লেনদেন হিস্ট্রি' : 'অডিট ট্রেইল',
            icon: History,
            badge: null,
        },
    ];

    const tabs = allTabs.filter(t => !isEmployee || !t.adminOnly);

    return (
        <div className="hidden lg:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 sm:top-20 z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                                    isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/80 shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${tab.badgeColor || 'bg-slate-500'}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
