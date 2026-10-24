import React, { useState, useMemo } from 'react';
import { 
    Receipt, 
    Plus, 
    Search, 
    Filter, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    ZoomIn, 
    Calendar,
    User,
    Layers,
    FileCheck,
    Send,
    Edit3,
    HandCoins,
    RotateCcw,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Wallet,
    Building2,
    CalendarDays,
    Trash2,
    ShieldAlert,
    Printer
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, formatDate, getLocalDateStr, extractDateStr } from '../../utils/formatters';
import FinalSubmitModal from '../Modals/FinalSubmitModal';
import DailyExpenseReportCard from '../DailyExpenseReportCard';
import { openDailyExpensePdf } from '../../utils/dailyExpensePdf';

export default function ExpensesTab({
    activeRole = 'admin',
    activeUser = null,
    expenses = [],
    categories = [],
    fundAllocations = [],
    users = [],
    onOpenExpenseModal,
    onOpenVerifyModal,
    onOpenPayModal,
    onOpenEditModal,
    onViewReceipt,
    useBanglaDigits = true,
}) {
    const isEmployee = activeRole === 'employee';

    // Current Date & Day Helpers (Always Real-Time Local Date)
    const getTodayDateStr = () => getLocalDateStr();
    const [selectedDate, setSelectedDate] = useState(getTodayDateStr);
    const [timeframe, setTimeframe] = useState('daily'); // 'daily', 'weekly', 'monthly', 'all'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isSubmittingDay, setIsSubmittingDay] = useState(false);
    const [confirmingExpenseId, setConfirmingExpenseId] = useState(null);
    const [deletingExpenseId, setDeletingExpenseId] = useState(null);
    const [isFinalSubmitModalOpen, setIsFinalSubmitModalOpen] = useState(false);
    const [adminViewMode, setAdminViewMode] = useState('daily_reports'); // 'daily_reports', 'all_items'

    // Bengali Weekdays & Months
    const banglaWeekdays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

    const getBanglaDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const y = Number(parts[0]);
            const m = Number(parts[1]);
            const day = Number(parts[2]);
            const d = new Date(y, m - 1, day);
            if (!isNaN(d.getTime())) {
                const dayName = banglaWeekdays[d.getDay()];
                const monthName = banglaMonths[d.getMonth()];
                const year = d.getFullYear();
                return `${dayName}, ${day} ${monthName} ${year}`;
            }
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const dayName = banglaWeekdays[d.getDay()];
        const day = d.getDate();
        const monthName = banglaMonths[d.getMonth()];
        const year = d.getFullYear();
        return `${dayName}, ${day} ${monthName} ${year}`;
    };

    // Date navigation (Strictly local calendar shift, prevents UTC day shift)
    const handleShiftDate = (days) => {
        if (!selectedDate) return;
        const parts = selectedDate.split('-');
        if (parts.length === 3) {
            const y = Number(parts[0]);
            const m = Number(parts[1]);
            const d = Number(parts[2]);
            const target = new Date(y, m - 1, d + days);
            setSelectedDate(getLocalDateStr(target));
            return;
        }
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(getLocalDateStr(d));
    };

    // Filter by active employee if employee role
    const userExpenses = useMemo(() => {
        return expenses.filter(exp => {
            if (isEmployee && exp.user_id !== activeUser?.id) return false;
            return true;
        });
    }, [expenses, isEmployee, activeUser]);

    // Apply Timeframe & Filters
    const filteredExpenses = useMemo(() => {
        const now = new Date(selectedDate);
        return userExpenses.filter(exp => {
            const expDate = extractDateStr(exp.expense_date);
            
            // Timeframe filter
            if (timeframe === 'daily') {
                if (expDate !== selectedDate) return false;
            } else if (timeframe === 'weekly') {
                const target = new Date(selectedDate);
                const dayOfWeek = target.getDay();
                const weekStart = new Date(target);
                weekStart.setDate(target.getDate() - dayOfWeek);
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                const eDate = new Date(expDate);
                if (eDate < weekStart || eDate > weekEnd) return false;
            } else if (timeframe === 'monthly') {
                if (expDate.slice(0, 7) !== selectedDate.slice(0, 7)) return false;
            }

            // Status filter
            if (statusFilter !== 'all' && exp.status !== statusFilter) return false;

            // Category filter
            if (categoryFilter !== 'all' && exp.category_id !== Number(categoryFilter)) return false;

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matches = 
                    (exp.description || '').toLowerCase().includes(q) ||
                    (exp.category_name || '').toLowerCase().includes(q) ||
                    (exp.user?.name || '').toLowerCase().includes(q) ||
                    (exp.transaction_ref || '').toLowerCase().includes(q) ||
                    (exp.other_reason || '').toLowerCase().includes(q);
                if (!matches) return false;
            }

            return true;
        });
    }, [userExpenses, timeframe, selectedDate, statusFilter, categoryFilter, searchQuery]);

    // Financial Breakdown Calculation for the active timeframe/day
    const summary = useMemo(() => {
        let total = 0;
        let officeAdvance = 0;
        let ownPocket = 0;
        let draftCount = 0;
        let pendingCount = 0;
        let approvedCount = 0;
        let paidCount = 0;
        let receivedCount = 0;

        filteredExpenses.forEach(exp => {
            const amt = Number(exp.amount) || 0;
            total += amt;

            const offAmt = Number(exp.office_fund_amount) || 0;
            const ownAmt = Number(exp.own_pocket_amount) || 0;

            if (offAmt > 0 || ownAmt > 0) {
                officeAdvance += offAmt;
                ownPocket += ownAmt;
            } else if (exp.fund_source === 'own_pocket') {
                ownPocket += amt;
            } else {
                officeAdvance += amt;
            }

            if (exp.status === 'draft') draftCount++;
            if (exp.status === 'pending') pendingCount++;
            if (exp.status === 'approved') approvedCount++;
            if (exp.status === 'paid') paidCount++;
            if (exp.status === 'received') receivedCount++;
        });

        // Compute Category Breakdown for active items
        const catMap = {};
        filteredExpenses.forEach(exp => {
            const cat = exp.category_name || 'অন্যান্য খরচ';
            catMap[cat] = (catMap[cat] || 0) + (Number(exp.amount) || 0);
        });
        const categoryBreakdown = Object.entries(catMap).map(([name, amount]) => ({ name, amount }));

        return {
            total,
            officeAdvance,
            ownPocket,
            draftCount,
            pendingCount,
            approvedCount,
            paidCount,
            receivedCount,
            totalItems: filteredExpenses.length,
            categoryBreakdown,
        };
    }, [filteredExpenses]);

    // 1. Daily Allocation, Expense & Remaining Balance for the Selected Date (Requirement 1)
    const dayAllocations = useMemo(() => {
        return (fundAllocations || []).filter(alloc => {
            if (isEmployee && alloc.user_id !== activeUser?.id) return false;
            const allocDate = extractDateStr(alloc.disbursed_at);
            return allocDate === selectedDate && alloc.is_received_by_employee;
        });
    }, [fundAllocations, isEmployee, activeUser, selectedDate]);

    const dayAllocatedTotal = useMemo(() => {
        const directSum = dayAllocations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        if (directSum > 0) return directSum;
        // If no direct allocation logged specifically on this date, show available remaining office funds
        return Number(activeUser?.balance_summary?.remaining_office_funds) || 0;
    }, [dayAllocations, activeUser]);

    const dayExpenseTotal = summary.total;
    const dayRemainingBalance = dayAllocatedTotal - dayExpenseTotal;

    // 5. Admin Grouped Submitted Daily Reports (Requirement 5)
    const submittedDailyReports = useMemo(() => {
        if (isEmployee) return [];
        const groups = {};
        expenses.forEach(exp => {
            if (exp.status === 'draft') return; // Only submitted/pending/approved/paid
            const expDate = extractDateStr(exp.expense_date);
            const key = `${exp.user_id}_${expDate}`;
            if (!groups[key]) {
                groups[key] = {
                    key,
                    userId: exp.user_id,
                    user: exp.user || (users || []).find(u => u.id === exp.user_id),
                    date: expDate,
                    expenses: [],
                };
            }
            groups[key].expenses.push(exp);
        });
        return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, isEmployee, users]);

    const handleApproveDay = (targetUserId, targetDate) => {
        router.post('/expenses/approve-day', {
            user_id: targetUserId,
            expense_date: targetDate,
        }, { preserveScroll: true });
    };

    const handleRevisionDay = (targetUserId, targetDate, notes, callback) => {
        router.post('/expenses/revision-day', {
            user_id: targetUserId,
            expense_date: targetDate,
            revision_notes: notes,
        }, {
            preserveScroll: true,
            onFinish: () => {
                if (callback) callback();
            }
        });
    };

    // Open Final Submit Review Modal
    const handleSubmitDayBill = () => {
        setIsFinalSubmitModalOpen(true);
    };

    // Confirm & Submit Day's Bill Action
    const handleConfirmFinalSubmit = () => {
        setIsSubmittingDay(true);
        router.post('/expenses/submit-day', {
            expense_date: selectedDate,
            user_id: activeUser?.id,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingDay(false);
                setIsFinalSubmitModalOpen(false);
            },
            onError: () => {
                setIsSubmittingDay(false);
            }
        });
    };

    // Delete Draft / Revision Expense Action
    const handleDeleteExpense = (exp) => {
        if (!confirm(`আপনি কি "${exp.category_name}" (৳${exp.amount}) খরচের হিসাবটি তালিকা থেকে মুছে ফেলতে চান?`)) {
            return;
        }

        setDeletingExpenseId(exp.id);
        router.delete(`/expenses/${exp.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingExpenseId(null);
            }
        });
    };

    // Employee Confirm Received Action
    const handleConfirmReceived = (exp) => {
        if (!confirm(`আপনি কি এই খরচের প্রাপ্য ৳${exp.amount} টাকা বুঝে পেয়েছেন তা নিশ্চিত করতে চান?`)) {
            return;
        }

        setConfirmingExpenseId(exp.id);
        router.post(`/expenses/${exp.id}/confirm-received`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingExpenseId(null);
            },
            onError: () => {
                setConfirmingExpenseId(null);
            }
        });
    };

    // Single Expense Submit Action (for drafts)
    const handleSubmitSingle = (exp) => {
        router.post(`/expenses/${exp.id}/submit`, {}, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (exp) => {
        switch (exp.status) {
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        <Edit3 className="w-3 h-3 text-slate-500" /> খসড়া (Draft)
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" /> জমা হয়েছে / যাচাই বাকি
                    </span>
                );
            case 'revision':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 animate-pulse">
                        <RotateCcw className="w-3 h-3" /> সংশোধনে ফেরত
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <CheckCircle2 className="w-3 h-3" /> অনুমোদিত (পেমেন্ট বাকি)
                    </span>
                );
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <HandCoins className="w-3 h-3" /> টাকা পরিশোধিত (Paid)
                    </span>
                );
            case 'received':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> টাকা বুঝে পেয়েছি
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <XCircle className="w-3 h-3" /> বাতিল (Rejected)
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* 1. Header with Live Date & Day (Requirement 1) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white shadow-xl shadow-indigo-950/15">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-xs text-xs font-bold flex items-center gap-1.5 text-indigo-100">
                                <CalendarDays className="w-3.5 h-3.5 text-indigo-200" />
                                <span>দৈনিক খরচ ও রসিদ ব্যবস্থাপনা</span>
                            </span>
                            {selectedDate === getTodayDateStr() && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                                    আজকের দিন (Today)
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                            {getBanglaDateDisplay(selectedDate)}
                        </h2>
                        <p className="text-xs text-indigo-200/90 mt-1">
                            {isEmployee 
                                ? 'আপনার প্রতিদিনের অফিসিয়াল খরচ এন্ট্রি করুন, রসিদ সংরক্ষণ করুন ও বিল জমা দিন' 
                                : 'সব কর্মচারীর দৈনিক খরচ যাচাই, ভাউচার অডিট, বিল অনুমোদন ও টাকা প্রদান'}
                        </p>
                    </div>

                    {/* Quick Date Switcher Controls */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
                        <button
                            type="button"
                            onClick={() => handleShiftDate(-1)}
                            className="p-2 rounded-xl hover:bg-white/20 text-white transition-all active:scale-95"
                            title="পূর্ববর্তী দিন"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-white/40"
                        />

                        <button
                            type="button"
                            onClick={() => handleShiftDate(1)}
                            className="p-2 rounded-xl hover:bg-white/20 text-white transition-all active:scale-95"
                            title="পরবর্তী দিন"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedDate(getTodayDateStr())}
                            className="px-2.5 py-1.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 active:scale-95 transition-all"
                        >
                            আজ
                        </button>
                    </div>
                </div>

                {/* Timeframe Selector Tabs (Requirement 10) */}
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/15 overflow-x-auto no-scrollbar">
                    <span className="text-xs text-indigo-200 font-semibold shrink-0">ভিউ ফিল্টার:</span>
                    {[
                        { id: 'daily', label: 'আজকের দিন (Daily Sheet)' },
                        { id: 'weekly', label: 'চলতি সপ্তাহ (Weekly)' },
                        { id: 'monthly', label: 'চলতি মাস (Monthly)' },
                        { id: 'all', label: 'সকল খরচ (All Records)' },
                    ].map(tf => (
                        <button
                            key={tf.id}
                            type="button"
                            onClick={() => setTimeframe(tf.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                timeframe === tf.id
                                    ? 'bg-white text-indigo-900 shadow-sm'
                                    : 'text-indigo-100 hover:bg-white/15'
                            }`}
                        >
                            {tf.label}
                        </button>
                    ))}

                    <div className="ml-auto shrink-0 flex items-center gap-2">
                        {timeframe === 'daily' && (
                            <button
                                type="button"
                                onClick={() => openDailyExpensePdf({
                                    user: activeUser,
                                    date: selectedDate,
                                    expenses: userExpenses.filter(e => extractDateStr(e.expense_date) === selectedDate),
                                    allocatedAmount: dayAllocatedTotal,
                                    useBanglaDigits,
                                })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
                                title="নির্বাচিত দিনের খরচের পূর্ণাঙ্গ ভাউচার PDF ডাউনলোড / প্রিন্ট করুন"
                            >
                                <Printer className="w-3.5 h-3.5 text-indigo-200" />
                                <span className="hidden sm:inline">ভাউচার PDF</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => onOpenExpenseModal(selectedDate)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>নতুন খরচ যোগ করুন</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 1. Daily Allocation & Balance Summary (Requirement 1) */}
            {timeframe === 'daily' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Card 1: আজকের মোট বরাদ্দ */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                আজকের মোট বরাদ্দ
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(dayAllocatedTotal, useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                                {dayAllocations.length > 0 ? 'আজকের অগ্রিম বরাদ্দকৃত ফান্ড' : 'মোট প্রাপ্ত অগ্রিম অফিস ফান্ড'}
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 2: আজকের মোট খরচ */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                আজকের মোট খরচ
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                                {formatCurrency(dayExpenseTotal, useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-blue-700 dark:text-blue-400/80 mt-0.5 block">
                                মোট {summary.totalItems}টি খরচের তালিকাভুক্ত
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <Receipt className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 3: অবশিষ্ট টাকা */}
                    <div className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs flex items-center justify-between ${
                        dayRemainingBalance >= 0 
                            ? 'border-emerald-200 dark:border-emerald-800/60' 
                            : 'border-rose-200 dark:border-rose-800/60'
                    }`}>
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                {dayRemainingBalance >= 0 ? 'অবশিষ্ট টাকা (ব্যালেন্স)' : 'অতিরিক্ত খরচ (দাবিযোগ্য)'}
                            </span>
                            <div className={`text-xl sm:text-2xl font-black ${
                                dayRemainingBalance >= 0 
                                    ? 'text-emerald-600 dark:text-emerald-400' 
                                    : 'text-rose-600 dark:text-rose-400'
                            }`}>
                                {formatCurrency(Math.abs(dayRemainingBalance), useBanglaDigits)}
                            </div>
                            <span className={`text-[11px] mt-0.5 block ${
                                dayRemainingBalance >= 0 
                                    ? 'text-emerald-700 dark:text-emerald-400/80' 
                                    : 'text-rose-700 dark:text-rose-400/80'
                            }`}>
                                {dayRemainingBalance >= 0 
                                    ? 'বরাদ্দ থেকে খরচ বাদে হাতে থাকা টাকা' 
                                    : 'বরাদ্দের চেয়ে অতিরিক্ত ব্যয়'}
                            </span>
                        </div>
                        <div className={`p-3 rounded-2xl ${
                            dayRemainingBalance >= 0 
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}>
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Fallback for weekly/monthly/all */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                নির্বাচিত সময়ের মোট খরচ
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(summary.total, useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                                মোট {summary.totalItems}টি খরচের হিসাব
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Receipt className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                অফিস ফান্ড থেকে ব্যয় (Advance)
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(summary.officeAdvance, useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400/80 mt-0.5 block">
                                অফিস অগ্রিম থেকে সমন্বয়
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                নিজের পকেট থেকে খরচ (প্রাপ্য দাবি)
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                                {formatCurrency(summary.ownPocket, useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-amber-700 dark:text-amber-400/80 mt-0.5 block">
                                অফিসের কাছে কর্মচারীর পাওনা
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            )}

            {/* Category Breakdown (কোন খাতে কত টাকা খরচ হয়েছে) */}
            {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {timeframe === 'daily' ? `${getBanglaDateDisplay(selectedDate)} তারিখে খাতভিত্তিক খরচের মোট:` : 'নির্বাচিত সময়ের খাতভিত্তিক খরচের মোট:'}
                        </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        {summary.categoryBreakdown.map((cat, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                <span className="text-slate-700 dark:text-slate-300">{cat.name}:</span>
                                <span className="font-black text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(cat.amount, useBanglaDigits)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4 & 6. Batch Bill Submission Prompt (Requirement 3 & 4) */}
            {isEmployee && summary.draftCount > 0 && (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-50 via-indigo-50/70 to-emerald-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800 border-2 border-indigo-400 dark:border-indigo-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md animate-in fade-in duration-200">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-md shadow-indigo-600/20">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{formatDate(selectedDate, useBanglaDigits)} তারিখের {summary.draftCount}টি খরচ তালিকায় সংরক্ষিত আছে</span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                    ব্যালেন্স সমন্বিত
                                </span>
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                সংরক্ষিত খরচের টাকা ইতিমধ্যে আপনার ফান্ড ব্যালেন্স থেকে বাদ দেওয়া হয়েছে। কোনো খরচ বাদ পড়লে নতুন যুক্ত করুন অথবা ভুল হলে ডিলিট করুন (সংরক্ষিত খরচ সরাসরি এডিট করা যায় না)। সারাদিনের সব খরচ ও রসিদ যাচাই শেষে অ্যাডমিনের কাছে সম্পূর্ণ দৈনিক রিপোর্ট একসঙ্গে চূড়ান্ত সাবমিট করুন।
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => openDailyExpensePdf({
                                user: activeUser,
                                date: selectedDate,
                                expenses: userExpenses.filter(e => extractDateStr(e.expense_date) === selectedDate),
                                allocatedAmount: dayAllocatedTotal,
                                useBanglaDigits,
                            })}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                            title="আজকের খরচের হিসাব PDF হিসেবে ডাউনলোড বা প্রিন্ট করুন"
                        >
                            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>ভাউচার PDF</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmitDayBill}
                            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            <span>সম্পূর্ণ দৈনিক রিপোর্ট সাবমিট করুন</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Admin Audit View Switch (Requirement 5) */}
            {!isEmployee && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setAdminViewMode('daily_reports')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                adminViewMode === 'daily_reports'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <FileCheck className="w-4 h-4" />
                            <span>দৈনিক খরচের পূর্ণাঙ্গ অডিট রিপোর্ট ({submittedDailyReports.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAdminViewMode('all_items')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                adminViewMode === 'all_items'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Receipt className="w-4 h-4" />
                            <span>একক খরচের তালিকা ({filteredExpenses.length})</span>
                        </button>
                    </div>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400 px-2">
                        {adminViewMode === 'daily_reports' ? 'এমপ্লয়ি ও তারিখভিত্তিক গ্রুপকৃত অডিট সারাংশ' : 'প্রতিটি ভাউচারের পৃথক তালিকা'}
                    </span>
                </div>
            )}

            {!isEmployee && adminViewMode === 'daily_reports' ? (
                <div className="space-y-4">
                    {submittedDailyReports.length > 0 ? (
                        submittedDailyReports.map((report) => (
                            <DailyExpenseReportCard
                                key={report.key}
                                reportKey={report.key}
                                userId={report.userId}
                                user={report.user}
                                date={report.date}
                                expenses={report.expenses}
                                allocations={fundAllocations}
                                onApproveDay={handleApproveDay}
                                onRevisionDay={handleRevisionDay}
                                onViewReceipt={onViewReceipt}
                                useBanglaDigits={useBanglaDigits}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                            <FileCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                অডিটের জন্য কোনো জমাকৃত দৈনিক রিপোর্ট নেই
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                কর্মচারীরা তাদের সারাদিনের বিল সাবমিট করলে এখানে তারিখ ও কর্মচারী অনুযায়ী পূর্ণাঙ্গ হিসাব প্রদর্শিত হবে।
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Search & Filters Toolbar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="বিবরণ, কারণ, নাম বা ভাউচার আইডি খুঁজুন..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                </div>

                <div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                        <option value="all">সব ক্যাটাগরি ({categories.length}টি)</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name_bn}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                        <option value="all">সব স্ট্যাটাস</option>
                        <option value="draft">খসড়া (Draft)</option>
                        <option value="pending">যাচাই বাকি (Pending)</option>
                        <option value="revision">সংশোধনে ফেরত (Revision)</option>
                        <option value="approved">অনুমোদিত (Approved)</option>
                        <option value="paid">পরিশোধিত (Paid)</option>
                        <option value="received">টাকা বুঝে পেয়েছি (Received)</option>
                        <option value="rejected">বাতিল (Rejected)</option>
                    </select>
                </div>
            </div>

            {/* Expenses List */}
            <div className="space-y-3.5">
                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((exp) => (
                        <div
                            key={exp.id}
                            className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                exp.status === 'revision'
                                    ? 'border-orange-300 dark:border-orange-700 shadow-md ring-1 ring-orange-500/20'
                                    : exp.status === 'paid' && isEmployee && !exp.is_received_by_employee
                                    ? 'border-purple-300 dark:border-purple-700 shadow-md ring-1 ring-purple-500/20'
                                    : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            {/* Left: Info */}
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                                            {exp.category_name}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {formatDate(exp.expense_date, useBanglaDigits)}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-mono">
                                            #{exp.transaction_ref}
                                        </span>

                                        {/* Fund Source Tag (Requirement 5) */}
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                            exp.fund_source === 'own_pocket' || (Number(exp.own_pocket_amount) > 0 && Number(exp.office_fund_amount) === 0)
                                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                                                : exp.fund_source === 'split' || (Number(exp.own_pocket_amount) > 0 && Number(exp.office_fund_amount) > 0)
                                                ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                                                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                        }`}>
                                            {exp.fund_source === 'own_pocket' 
                                                ? 'পকেট থেকে (Claimable)' 
                                                : exp.fund_source === 'split' 
                                                ? `স্প্লিট (অফিস: ৳${exp.office_fund_amount} • পকেট: ৳${exp.own_pocket_amount})` 
                                                : 'অফিস ফান্ড থেকে'}
                                        </span>
                                    </div>

                                    {/* Description (Requirement 3) */}
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {exp.description}
                                    </h4>

                                    {/* Other Expense Specific Reason (Special Rule) */}
                                    {exp.other_reason && (
                                        <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 text-amber-900 dark:text-amber-200 text-xs">
                                            <span className="font-bold text-amber-800 dark:text-amber-300">⚠️ অন্যান্য খরচের কারণ:</span> {exp.other_reason}
                                        </div>
                                    )}

                                    {/* Revision Note (Requirement 7) */}
                                    {exp.revision_notes && exp.status === 'revision' && (
                                        <div className="mt-2 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-200 text-xs">
                                            <span className="font-bold text-orange-800 dark:text-orange-300">📝 সংশোধনের নির্দেশনা:</span> {exp.revision_notes}
                                        </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {exp.rejection_reason && (
                                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">
                                            বাতিলের কারণ: {exp.rejection_reason}
                                        </p>
                                    )}

                                    {/* Submitter & Verification Trail (Requirement 8 & 9) */}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        খরচকারী: <strong>{exp.user?.name}</strong> ({exp.user?.employee_id})
                                        {exp.verified_by && (
                                            <span> • যাচাইকারী: <strong className="text-slate-700 dark:text-slate-300">{exp.verified_by}</strong></span>
                                        )}
                                        {exp.is_paid && (
                                            <span className="text-purple-600 dark:text-purple-400 font-semibold"> • পরিশোধ মাধ্যম: {exp.payment_method}</span>
                                        )}
                                        {exp.is_received_by_employee && (
                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> • টাকা বুঝে পেয়েছে: ✓</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Middle & Right: Amount, Status & Interactive Workflow Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                                <div className="text-left md:text-right">
                                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                                        {formatCurrency(exp.amount, useBanglaDigits)}
                                    </div>
                                    <div className="mt-0.5">
                                        {getStatusBadge(exp)}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Receipt Zoom (Requirement 4) */}
                                    {exp.receipt_image && (
                                        <button
                                            type="button"
                                            onClick={() => onViewReceipt(exp.receipt_image, `ভাউচার - ${exp.category_name} (${formatCurrency(exp.amount, useBanglaDigits)})`)}
                                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                            title="রসিদ দেখুন"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* EMPLOYEE ACTIONS */}
                                    {/* Draft: Delete only (Editing not permitted per strict rule 1) */}
                                    {isEmployee && exp.status === 'draft' && (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={deletingExpenseId === exp.id}
                                                onClick={() => handleDeleteExpense(exp)}
                                                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer text-xs font-bold"
                                                title="ভুল এন্ট্রি হলে ডিলিট করুন (টাকা ফান্ড ব্যালেন্সে ফেরত যাবে)"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>ডিলিট</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Revision: Delete to replace with fresh entry */}
                                    {isEmployee && exp.status === 'revision' && (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={deletingExpenseId === exp.id}
                                                onClick={() => handleDeleteExpense(exp)}
                                                className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                                                title="সংশোধনের জন্য এই ভুল এন্ট্রিটি ডিলিট করুন"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>ডিলিট করে নতুন দিন</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Locked Indicators for Submitted/Pending/Approved */}
                                    {isEmployee && exp.status === 'pending' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title="অ্যাডমিনের অনুমোদনের অপেক্ষায় বিল লক করা">
                                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                            <span>লক করা</span>
                                        </span>
                                    )}

                                    {isEmployee && exp.status === 'approved' && !exp.is_paid && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" title="অনুমোদিত বিল অপরিবর্তনীয়">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                            <span>অনুমোদিত</span>
                                        </span>
                                    )}

                                    {/* Paid: Employee Confirm Received (Requirement 9) */}
                                    {isEmployee && exp.status === 'paid' && !exp.is_received_by_employee && (
                                        <button
                                            type="button"
                                            disabled={confirmingExpenseId === exp.id}
                                            onClick={() => handleConfirmReceived(exp)}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5 animate-bounce disabled:opacity-50"
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                            <span>{confirmingExpenseId === exp.id ? 'নিশ্চিত হচ্ছে...' : 'টাকা পেয়েছি (Confirm Received)'}</span>
                                        </button>
                                    )}

                                    {/* ADMIN ACTIONS */}
                                    {/* Pending: Verify Modal (Requirement 7) */}
                                    {!isEmployee && exp.status === 'pending' && (
                                        <button
                                            type="button"
                                            onClick={() => onOpenVerifyModal(exp)}
                                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                                        >
                                            যাচাই করুন
                                        </button>
                                    )}

                                    {/* Approved: Pay Expense Claim (Requirement 8) */}
                                    {!isEmployee && exp.status === 'approved' && !exp.is_paid && (
                                        <button
                                            type="button"
                                            onClick={() => onOpenPayModal(exp)}
                                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                                        >
                                            <HandCoins className="w-3.5 h-3.5" />
                                            <span>টাকা প্রদান করুন (Pay)</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            কোনো খরচের এন্ট্রি পাওয়া যায়নি
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            {timeframe === 'daily' 
                                ? `${getBanglaDateDisplay(selectedDate)} তারিখে কোনো খরচ রেকর্ড নেই। নতুন খরচ যুক্ত করতে পারেন।`
                                : 'নির্বাচিত ফিল্টারের অধীনে কোনো খরচের রেকর্ড নেই।'}
                        </p>
                        <button
                            type="button"
                            onClick={() => onOpenExpenseModal(selectedDate)}
                            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>দৈনিক খরচ যোগ করুন</span>
                        </button>
                    </div>
                )}
            </div>
            </>
            )}

            {/* Final Bill Review & Submission Modal */}
            <FinalSubmitModal
                isOpen={isFinalSubmitModalOpen}
                onClose={() => setIsFinalSubmitModalOpen(false)}
                selectedDate={selectedDate}
                expenses={userExpenses}
                allocatedAmount={dayAllocatedTotal}
                user={activeUser}
                onConfirmSubmit={handleConfirmFinalSubmit}
                isSubmitting={isSubmittingDay}
                useBanglaDigits={useBanglaDigits}
            />

        </div>
    );
}
