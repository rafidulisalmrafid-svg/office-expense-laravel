import React, { useState } from 'react';
import { 
    FolderKanban, 
    PlusCircle, 
    HandCoins, 
    Receipt, 
    CheckCircle2, 
    AlertCircle, 
    FileQuestion, 
    Upload, 
    Eye, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight, 
    DollarSign, 
    ChevronRight, 
    Filter, 
    Users, 
    Calendar,
    Sparkles,
    FileText,
    ShieldCheck,
    ArrowLeft,
    X,
    Search,
    UserCheck,
    Info
} from 'lucide-react';
import { formatCurrency, formatDate, extractDateStr } from '../../utils/formatters';

export default function ProjectsTab({
    projects = [],
    activeUser = null,
    activeRole = 'admin',
    users = [],
    useBanglaDigits = true,
    onOpenCreateProject,
    onOpenAllocateFund,
    onOpenAddExpenseForProject,
    onOpenFinishProject,
    onOpenRequestDocument,
    onOpenUploadDocument,
    onOpenReviewSettlement,
    onOpenManageTeam,
    onViewReceipt,
}) {
    const isEmployee = activeRole === 'employee';

    // State for Selected Project Details View (SPA in-page, zero reload, preserves state)
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [expenseDateFilter, setExpenseDateFilter] = useState('');
    const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

    // Filter status for list view: 'all', 'active', 'pending_completion', 'completed'
    const [statusFilter, setStatusFilter] = useState('all');

    // Currently selected project
    const selectedProject = projects.find((p) => p.id === Number(selectedProjectId));

    // Filter projects for list view
    const filteredProjects = projects.filter((p) => {
        if (statusFilter === 'all') return true;
        return p.status === statusFilter;
    });

    // Employee specific: any pending document requests targeting this employee
    const myPendingDocRequests = [];
    projects.forEach(p => {
        (p.documentRequests || []).forEach(req => {
            if (req.user_id === activeUser?.id && req.status === 'pending') {
                myPendingDocRequests.push({ ...req, project: p });
            }
        });
    });

    // Overview Stats for list view
    const totalProjectsCount = projects.length;
    const activeProjectsCount = projects.filter(p => p.status === 'active').length;
    const pendingSettlementCount = projects.filter(p => p.status === 'pending_completion').length;
    const completedProjectsCount = projects.filter(p => p.status === 'completed').length;

    const totalAllocatedAll = projects.reduce((sum, p) => sum + (Number(p.financial_summary?.allocated_amount) || 0), 0);
    const totalSpentAll = projects.reduce((sum, p) => sum + (Number(p.financial_summary?.total_spent) || 0), 0);
    const totalRemainingAll = totalAllocatedAll - totalSpentAll;

    // =========================================================================
    // DEDICATED PROJECT DETAILS & EXPENSE VIEW (When a project is selected)
    // =========================================================================
    if (selectedProject) {
        const summary = selectedProject.financial_summary || {
            allocated_amount: 0,
            total_spent: 0,
            remaining_balance: 0,
            percentage_used: 0,
        };

        const allocated = Number(summary.allocated_amount) || 0;
        const spent = Number(summary.total_spent) || 0;
        const remaining = Number(summary.remaining_balance) || 0;
        const percent = Number(summary.percentage_used) || 0;

        const isPendingFinish = selectedProject.status === 'pending_completion';
        const isCompleted = selectedProject.status === 'completed';
        const isActive = selectedProject.status === 'active';

        const latestSettlement = (selectedProject.settlements || [])[0];
        const projectAllocations = selectedProject.allocations || [];
        const allProjectExpenses = selectedProject.expenses || [];
        const projectDocs = selectedProject.documents || [];
        const docRequests = selectedProject.documentRequests || [];

        // Filter project expenses by date and search query
        const filteredProjectExpenses = allProjectExpenses.filter((exp) => {
            if (expenseDateFilter) {
                const expDate = extractDateStr(exp.expense_date);
                if (expDate !== expenseDateFilter) return false;
            }
            if (expenseSearchQuery.trim()) {
                const q = expenseSearchQuery.toLowerCase();
                const catName = exp.category?.name_bn || exp.category?.name || '';
                const desc = exp.description || '';
                const userName = exp.user?.name || '';
                if (!catName.toLowerCase().includes(q) && !desc.toLowerCase().includes(q) && !userName.toLowerCase().includes(q)) {
                    return false;
                }
            }
            return true;
        });

        const filteredExpensesTotal = filteredProjectExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* 1. Header with Back Button and Quick Actions */}
                <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white shadow-xl shadow-emerald-950/15">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedProjectId(null)}
                                className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all backdrop-blur-xs text-white shrink-0 mt-0.5"
                                title="প্রজেক্ট তালিকায় ফিরে যান"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-white/20 backdrop-blur-xs text-emerald-100">
                                        {selectedProject.code}
                                    </span>
                                    {isActive && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                                            <span>চলতি প্রজেক্ট</span>
                                        </span>
                                    )}
                                    {isPendingFinish && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                                            <span>ফিনিশ রিভিউ অপেক্ষমাণ</span>
                                        </span>
                                    )}
                                    {isCompleted && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-400/20 text-slate-200 border border-slate-400/30 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                                            <span>সম্পন্ন</span>
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black mt-1.5 tracking-tight">
                                    {selectedProject.name}
                                </h1>
                                {selectedProject.description && (
                                    <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-3xl">
                                        {selectedProject.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {isActive && (
                                <button
                                    type="button"
                                    onClick={() => onOpenAddExpenseForProject(selectedProject, expenseDateFilter || null)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-emerald-900 text-xs sm:text-sm font-bold shadow-lg hover:bg-emerald-50 active:scale-95 transition-all"
                                >
                                    <Receipt className="w-4 h-4 text-emerald-700" />
                                    <span>+ নতুন প্রজেক্ট খরচ</span>
                                </button>
                            )}

                            {!isEmployee && (
                                <button
                                    type="button"
                                    onClick={() => onOpenManageTeam && onOpenManageTeam(selectedProject)}
                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold backdrop-blur-xs active:scale-95 transition-all"
                                >
                                    <Users className="w-4 h-4 text-emerald-200" />
                                    <span>টিম পরিচালনা</span>
                                </button>
                            )}

                            {!isEmployee && isActive && (
                                <button
                                    type="button"
                                    onClick={() => onOpenAllocateFund(selectedProject)}
                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold backdrop-blur-xs active:scale-95 transition-all"
                                >
                                    <HandCoins className="w-4 h-4 text-amber-300" />
                                    <span>+ বাজেট বরাদ্দ</span>
                                </button>
                            )}

                            {isActive && (
                                <button
                                    type="button"
                                    onClick={() => onOpenFinishProject(selectedProject)}
                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-100 text-xs sm:text-sm font-bold border border-emerald-400/40 backdrop-blur-xs active:scale-95 transition-all"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                    <span>Finish Project</span>
                                </button>
                            )}

                            {isPendingFinish && !isEmployee && latestSettlement && (
                                <button
                                    type="button"
                                    onClick={() => onOpenReviewSettlement(latestSettlement)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-lg active:scale-95 transition-all"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>হিসাব অডিট ও অনুমোদন</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Financial Metrics KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            মোট বরাদ্দকৃত বাজেট
                        </span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(allocated, useBanglaDigits)}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">প্রজেক্টের অনুমোদিত মোট তহবিল</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            মোট খরচ হয়েছে
                        </span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(spent, useBanglaDigits)}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{allProjectExpenses.length}টি খরচ এন্ট্রি সম্পন্ন</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            বর্তমান অবশিষ্ট ব্যালেন্স
                        </span>
                        <div className="flex items-baseline justify-between mt-2">
                            <span className={`text-2xl font-black ${remaining >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {formatCurrency(Math.abs(remaining), useBanglaDigits)}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                                {remaining >= 0 ? 'হাতে ফান্ড' : 'অতিরিক্ত খরচ'}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">শুধুমাত্র এই প্রজেক্টের জন্যই প্রযোজ্য</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span>বাজেট ব্যবহারের অগ্রগতি</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                {useBanglaDigits ? percent.toLocaleString('bn-BD') : percent}%
                            </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                    percent > 90
                                        ? 'bg-rose-500'
                                        : percent > 60
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                            ></div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                            {percent <= 100 ? 'বাজেটের মধ্যে পরিচালিত' : 'বাজেট সীমা অতিক্রম করেছে'}
                        </p>
                    </div>
                </div>

                {/* 3. Assigned Employees & Team Management */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    দায়িত্বপ্রাপ্ত টিম ও কর্মচারী
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    এই প্রজেক্টে কর্মরত সদস্যদের ব্যক্তিগত বরাদ্দ ও ভূমিকা
                                </p>
                            </div>
                        </div>

                        {!isEmployee && (
                            <button
                                type="button"
                                onClick={() => onOpenManageTeam && onOpenManageTeam(selectedProject)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shrink-0"
                            >
                                <Users className="w-3.5 h-3.5" />
                                <span>টিম সদস্য যোগ / পরিবর্তন</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {projectAllocations.length === 0 ? (
                            <div className="col-span-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500">
                                কোনো কর্মচারী বরাদ্দ করা নেই
                            </div>
                        ) : (
                            projectAllocations.map((alloc) => (
                                <div
                                    key={alloc.id}
                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                                            {alloc.user?.name ? alloc.user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {alloc.user?.name || 'কর্মচারী'}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                {alloc.user?.designation || 'টিম সদস্য'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-semibold text-slate-400 block">ব্যক্তিগত বরাদ্দ</span>
                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(alloc.allocated_amount, useBanglaDigits)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 4. Project Expenses Section with Calendar Date Filter */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                    
                    {/* Section Header & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                        প্রজেক্ট খরচের হিসাব ও ভাউচার
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        তারিখভিত্তিক প্রজেক্ট খরচসমূহ দেখুন এবং নতুন খরচ যুক্ত করুন
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isActive && (
                            <button
                                type="button"
                                onClick={() => onOpenAddExpenseForProject(selectedProject, expenseDateFilter || null)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>+ নতুন প্রজেক্ট খরচ যোগ করুন</span>
                            </button>
                        )}
                    </div>

                    {/* Filter Bar: Date Picker & Search */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">তারিখ ফিল্টার:</span>
                                <input
                                    type="date"
                                    value={expenseDateFilter}
                                    onChange={(e) => setExpenseDateFilter(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            {expenseDateFilter && (
                                <button
                                    type="button"
                                    onClick={() => setExpenseDateFilter('')}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>সকল তারিখ</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="খাত বা বিবরণ খুঁজুন..."
                                    value={expenseSearchQuery}
                                    onChange={(e) => setExpenseSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                {expenseSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setExpenseSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                                {useBanglaDigits ? filteredProjectExpenses.length.toLocaleString('bn-BD') : filteredProjectExpenses.length}টি রেকর্ড
                            </span>
                        </div>
                    </div>

                    {/* Filter Summary Metric if filter is active */}
                    {expenseDateFilter && (
                        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                            <span>
                                <strong>{formatDate(expenseDateFilter, useBanglaDigits)}</strong> তারিখের মোট খরচ:
                            </span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                                {formatCurrency(filteredExpensesTotal, useBanglaDigits)}
                            </span>
                        </div>
                    )}

                    {/* Expense Records List */}
                    {filteredProjectExpenses.length === 0 ? (
                        <div className="p-10 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center border border-dashed border-slate-200 dark:border-slate-700">
                            <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {expenseDateFilter ? 'এই তারিখে কোনো খরচ পাওয়া যায়নি' : 'এখনও কোনো প্রজেক্ট খরচ এন্ট্রি করা হয়নি'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {expenseDateFilter
                                    ? 'অন্য কোনো তারিখ নির্বাচন করুন অথবা এই নির্দিষ্ট তারিখে নতুন খরচ এন্ট্রি করুন।'
                                    : 'প্রজেক্ট চলাকালীন যেকোনো খরচের জন্য সাথে সাথে ভাউচার সংযুক্ত করে এন্ট্রি সংরক্ষণ করুন।'}
                            </p>
                            {isActive && (
                                <button
                                    type="button"
                                    onClick={() => onOpenAddExpenseForProject(selectedProject, expenseDateFilter || null)}
                                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>+ এই তারিখে খরচ যোগ করুন</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                            <table className="w-full min-w-[640px] text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-3">তারিখ</th>
                                        <th className="py-3 px-3">খাত / বিবরণ</th>
                                        <th className="py-3 px-3">খরচকারী</th>
                                        <th className="py-3 px-3">ফান্ডের উৎস</th>
                                        <th className="py-3 px-3 text-right">পরিমাণ</th>
                                        <th className="py-3 px-3 text-center">ভাউচার / রসিদ</th>
                                        <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredProjectExpenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                                                {formatDate(exp.expense_date, useBanglaDigits)}
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <div className="space-y-0.5">
                                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                                        {exp.category?.name_bn || exp.category?.name || 'সাধারণ'}
                                                    </span>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {exp.description}
                                                    </p>
                                                    {exp.other_reason && (
                                                        <p className="text-[11px] text-slate-400 italic">
                                                            নোট: {exp.other_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                                                {exp.user?.name || 'কর্মচারী'}
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    exp.fund_source === 'own_pocket'
                                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                                        : 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                                                }`}>
                                                    {exp.fund_source === 'own_pocket' ? 'নিজস্ব পকেট' : 'প্রজেক্ট বরাদ্দ'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-right whitespace-nowrap font-black text-sm text-slate-900 dark:text-white">
                                                {formatCurrency(exp.amount, useBanglaDigits)}
                                            </td>
                                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                {exp.receipt_image ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onViewReceipt && onViewReceipt({ src: exp.receipt_image, title: exp.description })}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold text-[11px] transition-all"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>ভাউচার</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">রসিদ নেই</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                {exp.is_draft ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        ড্রাফট
                                                    </span>
                                                ) : exp.status === 'approved' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                                        অনুমোদিত
                                                    </span>
                                                ) : exp.status === 'paid' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                                                        পরিশোধিত
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                                                        অপেক্ষমাণ
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 5. Documents & Audits Section */}
                {projectDocs.length > 0 && (
                    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-teal-600" />
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">সংযুক্ত নথিপত্র ও প্রমাণাদি ({projectDocs.length})</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {projectDocs.map((doc) => (
                                <div key={doc.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.title || doc.file_name || 'ডকুমেন্ট'}</p>
                                        <p className="text-[10px] text-slate-400">{formatDate(doc.created_at, useBanglaDigits)}</p>
                                    </div>
                                    {doc.file_path && (
                                        <button
                                            type="button"
                                            onClick={() => onViewReceipt && onViewReceipt({ src: doc.file_path, title: doc.title })}
                                            className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 hover:bg-teal-100"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        );
    }

    // =========================================================================
    // MAIN PROJECTS LIST VIEW (Default)
    // =========================================================================
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* 1. Header Banner & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xl shadow-emerald-950/10">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
                            <FolderKanban className="w-5 h-5 text-emerald-200" />
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                            {isEmployee ? 'আমার প্রজেক্টভিত্তিক বরাদ্দ ও খরচ' : 'প্রজেক্ট ও ফান্ড ব্যবস্থাপনা'}
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
                        {isEmployee 
                            ? 'প্রতিটি প্রজেক্টের বরাদ্দ সম্পূর্ণ আলাদা। প্রজেক্টভিত্তিক খরচ এন্ট্রি করুন এবং কাজ শেষে ফিনিশ রিকোয়েস্ট পাঠান।'
                            : 'এমপ্লয়িভিত্তিক স্বাধীন প্রজেক্ট তৈরি করুন, একাধিক কর্মচারী বরাদ্দ করুন এবং খরচ অডিট করুন।'
                        }
                    </p>
                </div>

                {!isEmployee && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={onOpenCreateProject}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-emerald-800 text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
                        >
                            <PlusCircle className="w-4 h-4 text-emerald-600" />
                            <span>নতুন প্রজেক্ট তৈরি ও বরাদ্দ</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 2. Employee Urgent Notification Banner: Requested Documents */}
            {isEmployee && myPendingDocRequests.length > 0 && (
                <div className="space-y-2">
                    {myPendingDocRequests.map((req) => (
                        <div
                            key={req.id}
                            className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-2xl bg-amber-500 text-white shrink-0 mt-0.5">
                                    <FileQuestion className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 uppercase">
                                            প্রমাণপত্র প্রয়োজন
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            {req.project?.name} ({req.project?.code})
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100 mt-1">
                                        {req.title}
                                    </h4>
                                    {req.description && (
                                        <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                                            {req.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => onOpenUploadDocument(req.project, req)}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all shrink-0"
                            >
                                <Upload className="w-4 h-4" />
                                <span>প্রমাণপত্র আপলোড করুন</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {isEmployee ? 'আমার সক্রিয় প্রজেক্ট' : 'মোট প্রজেক্ট সংখ্যা'}
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {useBanglaDigits ? activeProjectsCount.toLocaleString('bn-BD') : activeProjectsCount}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            চলতি
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        মোট বরাদ্দকৃত টাকা
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(totalAllocatedAll, useBanglaDigits)}
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        মোট খরচ হয়েছে
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(totalSpentAll, useBanglaDigits)}
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        বর্তমান অবশিষ্ট টাকা
                    </span>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className={`text-2xl font-black ${totalRemainingAll >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatCurrency(Math.abs(totalRemainingAll), useBanglaDigits)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                            {totalRemainingAll >= 0 ? 'হাতে আছে' : 'অতিরিক্ত খরচ'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 4. Filter Tabs */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                    <button
                        type="button"
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'all'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        সকল প্রজেক্ট ({projects.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('active')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'active'
                                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        চলতি ({activeProjectsCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('pending_completion')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'pending_completion'
                                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        অনুমোদন অপেক্ষমাণ ({pendingSettlementCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter('completed')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === 'completed'
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        সম্পন্ন ({completedProjectsCount})
                    </button>
                </div>
            </div>

            {/* 5. Projects Grid */}
            {filteredProjects.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">কোনো প্রজেক্ট পাওয়া যায়নি</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        {isEmployee 
                            ? 'আপনার নামে এখনও কোনো সক্রিয় প্রজেক্ট বরাদ্দ করা হয়নি।' 
                            : 'নতুন প্রজেক্ট তৈরি করে নির্দিষ্ট কর্মচারীদের নামে বাজেট বরাদ্দ করুন।'}
                    </p>
                    {!isEmployee && (
                        <button
                            type="button"
                            onClick={onOpenCreateProject}
                            className="mt-4 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700"
                        >
                            + নতুন প্রজেক্ট তৈরি করুন
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project) => {
                        const summary = project.financial_summary || {
                            allocated_amount: 0,
                            total_spent: 0,
                            remaining_balance: 0,
                            percentage_used: 0,
                        };

                        const allocated = Number(summary.allocated_amount) || 0;
                        const spent = Number(summary.total_spent) || 0;
                        const remaining = Number(summary.remaining_balance) || 0;
                        const percent = Number(summary.percentage_used) || 0;

                        const isPendingFinish = project.status === 'pending_completion';
                        const isCompleted = project.status === 'completed';
                        const isActive = project.status === 'active';

                        const latestSettlement = (project.settlements || [])[0];

                        // Allocations list
                        const projectAllocations = project.allocations || [];
                        const projectExpenses = project.expenses || [];
                        const projectDocs = project.documents || [];
                        const docRequests = project.documentRequests || [];

                        return (
                            <div
                                key={project.id}
                                className={`rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                                    isPendingFinish
                                        ? 'border-amber-300 dark:border-amber-800 ring-2 ring-amber-400/20'
                                        : isCompleted
                                            ? 'border-slate-200 dark:border-slate-800 opacity-90'
                                            : 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                                }`}
                            >
                                {/* Card Top */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5">
                                            <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {project.code}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                                                {project.name}
                                            </h3>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="shrink-0">
                                            {isActive && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/80 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    <span>সক্রিয়</span>
                                                </span>
                                            )}
                                            {isPendingFinish && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/80 flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                                                    <span>ফিনিশ রিভিউ</span>
                                                </span>
                                            )}
                                            {isCompleted && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-slate-500" />
                                                    <span>সম্পন্ন</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {project.description && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* Assigned Employees */}
                                    <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                টিম: {projectAllocations.map(a => a.user?.name || 'কর্মচারী').join(', ') || 'অনির্ধারিত'}
                                            </span>
                                        </div>

                                        {!isEmployee && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenManageTeam && onOpenManageTeam(project)}
                                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                                            >
                                                টিম পরিবর্তন
                                            </button>
                                        )}
                                    </div>

                                    {/* Financial Ledger Snapshot */}
                                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">বরাদ্দকৃত বাজেট:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(allocated, useBanglaDigits)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">মোট খরচ হয়েছে:</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                {formatCurrency(spent, useBanglaDigits)}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                            <span className="text-slate-700 dark:text-slate-300 font-bold">অবশিষ্ট ফান্ড:</span>
                                            <span className={`font-black text-sm ${remaining >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {formatCurrency(Math.abs(remaining), useBanglaDigits)}
                                                {remaining < 0 && <span className="text-[10px] ml-1 font-bold text-rose-500">(পাওনা)</span>}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="pt-1">
                                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                        percent > 90
                                                            ? 'bg-rose-500'
                                                            : percent > 60
                                                                ? 'bg-amber-500'
                                                                : 'bg-emerald-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, percent)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                                                <span>ব্যয়িত: {useBanglaDigits ? percent.toLocaleString('bn-BD') : percent}%</span>
                                                <span>{projectExpenses.length}টি খরচ এন্ট্রি</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document requests or attachments indicator */}
                                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5 text-teal-500" />
                                            <span>{projectDocs.length}টি প্রমাণপত্র সংযুক্ত</span>
                                        </span>
                                        {docRequests.length > 0 && (
                                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                                                <FileQuestion className="w-3.5 h-3.5" />
                                                <span>{docRequests.length}টি রিকোয়েস্ট</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Card Bottom Actions */}
                                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    
                                    {/* Primary Button: View Details & Expenses */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedProjectId(project.id);
                                            setExpenseDateFilter('');
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-sm active:scale-98 transition-all"
                                    >
                                        <Eye className="w-4 h-4 text-emerald-400 dark:text-white" />
                                        <span>প্রজেক্টের বিস্তারিত ও খরচ দেখুন</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    {/* Secondary Action Buttons */}
                                    <div className="flex items-center gap-2 pt-1">
                                        {isActive && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenAddExpenseForProject(project)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 active:scale-95 transition-all border border-indigo-200 dark:border-indigo-800/60"
                                            >
                                                <Receipt className="w-3.5 h-3.5" />
                                                <span>+ দৈনিক খরচ</span>
                                            </button>
                                        )}

                                        {isActive && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenFinishProject(project)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 active:scale-95 transition-all border border-emerald-300 dark:border-emerald-800"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Finish Project</span>
                                            </button>
                                        )}

                                        {isPendingFinish && !isEmployee && latestSettlement && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenReviewSettlement(latestSettlement)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all shadow-xs"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>হিসাব অডিট</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
