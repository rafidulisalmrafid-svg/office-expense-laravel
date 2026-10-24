import React, { useState, useMemo } from 'react';
import { 
    Users, 
    UserPlus, 
    Search, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Wallet, 
    TrendingUp, 
    FileText, 
    ArrowUpRight,
    Building2,
    Phone,
    Mail,
    ArrowLeft,
    FolderKanban,
    Receipt,
    HandCoins,
    ChevronRight,
    ZoomIn,
    AlertCircle,
    Calendar,
    Eye
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatCurrency, formatDate, extractDateStr } from '../../utils/formatters';

export default function EmployeesTab({
    activeRole = 'admin',
    users = [],
    expenses = [],
    fundAllocations = [],
    projects = [],
    onOpenAddEmployeeModal,
    onOpenEmailSetupModal,
    onSelectUserForSimulation,
    onViewReceipt,
    useBanglaDigits = true,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTabSub, setActiveTabSub] = useState('approved'); // approved, pending
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [ledgerSubTab, setLedgerSubTab] = useState('office_expenses'); // office_expenses, projects, allocations

    const employees = users.filter(u => u.role === 'employee');
    const approvedEmployees = employees.filter(u => u.status === 'approved');
    const pendingEmployees = employees.filter(u => u.status === 'pending');

    const visibleEmployees = (activeTabSub === 'approved' ? approvedEmployees : pendingEmployees).filter(emp => {
        return (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (emp.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (emp.designation || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleApproveUser = (userId) => {
        router.post(`/users/${userId}/approve`);
    };

    // Selected Employee for Detailed Ledger
    const selectedEmployee = useMemo(() => {
        if (!selectedEmployeeId) return null;
        return users.find(u => u.id === selectedEmployeeId);
    }, [selectedEmployeeId, users]);

    // Data specifically belonging to selected employee
    const employeeAllocations = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return (fundAllocations || []).filter(a => a.user_id === selectedEmployeeId);
    }, [selectedEmployeeId, fundAllocations]);

    const employeeOfficeExpenses = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return (expenses || []).filter(e => e.user_id === selectedEmployeeId && !e.project_id);
    }, [selectedEmployeeId, expenses]);

    const employeeProjectExpenses = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return (expenses || []).filter(e => e.user_id === selectedEmployeeId && e.project_id);
    }, [selectedEmployeeId, expenses]);

    const employeeAssignedProjects = useMemo(() => {
        if (!selectedEmployeeId) return [];
        return (projects || []).filter(p => {
            return (p.allocations || []).some(a => a.user_id === selectedEmployeeId && a.status === 'active');
        });
    }, [selectedEmployeeId, projects]);

    // Financial Metrics for Selected Employee
    const employeeBalance = selectedEmployee?.balance_summary || {
        remaining_office_funds: 0,
        employee_payable: 0,
        pending_claims: 0,
        total_received: 0,
        total_approved_expenses: 0,
    };

    const totalOfficeSpent = useMemo(() => {
        return employeeOfficeExpenses
            .filter(e => e.status !== 'rejected')
            .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    }, [employeeOfficeExpenses]);

    // =========================================================================
    // VIEW 1: DETAILED EMPLOYEE FINANCIAL LEDGER VIEW
    // =========================================================================
    if (selectedEmployee) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Navigation & Header Toolbar */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedEmployeeId(null)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>কর্মচারী তালিকায় ফিরে যান</span>
                        </button>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                        <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {selectedEmployee.name} - আর্থিক লেজার ও খতিয়ান
                        </span>
                    </div>

                    {/* Employee Switcher Dropdown (Switch between employees seamlessly) */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                            অন্য কর্মচারী দেখুন:
                        </span>
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.employee_id}) - {emp.designation}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Profile Card Banner */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-white font-black text-2xl flex items-center justify-center shadow-md">
                            {selectedEmployee.name?.charAt(0) || 'E'}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold tracking-tight text-white">
                                    {selectedEmployee.name}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                    {selectedEmployee.employee_id}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    {selectedEmployee.status === 'approved' ? 'অনুমোদিত' : 'পেন্ডিং'}
                                </span>
                            </div>
                            <p className="text-xs text-indigo-200">
                                {selectedEmployee.designation} • {selectedEmployee.department}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/80 pt-1">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-indigo-300" />
                                    <span>{selectedEmployee.email}</span>
                                </span>
                                {selectedEmployee.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-indigo-300" />
                                        <span>{selectedEmployee.phone}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                            type="button"
                            onClick={() => onSelectUserForSimulation(selectedEmployee)}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Eye className="w-4 h-4 text-indigo-300" />
                            <span>কর্মচারীর দৃষ্টিকোণ থেকে দেখুন</span>
                        </button>
                    </div>
                </div>

                {/* 4 Financial Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: মোট অফিস বরাদ্দ */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                মোট অফিস বরাদ্দ প্রাপ্তি
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(employeeBalance.total_received, useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                                {employeeAllocations.length}টি ফান্ড বরাদ্দ থেকে
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <HandCoins className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 2: মোট অফিস খরচ */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                মোট দৈনিক অফিস খরচ
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                {formatCurrency(totalOfficeSpent, useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                                মোট {employeeOfficeExpenses.length}টি ভাউচার এন্ট্রি
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <Receipt className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 3: বর্তমান অফিস ব্যালেন্স */}
                    <div className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs flex items-center justify-between ${
                        employeeBalance.remaining_office_funds < 0 
                            ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20' 
                            : 'border-slate-200 dark:border-slate-800'
                    }`}>
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                {employeeBalance.remaining_office_funds < 0 ? 'অফিসের কাছে পাওনা (ঘাটতি)' : 'অফিস ফান্ডের অবশিষ্ট ব্যালেন্স'}
                            </span>
                            <div className={`text-xl sm:text-2xl font-black ${
                                employeeBalance.remaining_office_funds < 0 
                                    ? 'text-rose-600 dark:text-rose-400' 
                                    : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                                {formatCurrency(Math.abs(employeeBalance.remaining_office_funds), useBanglaDigits)}
                            </div>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                                {employeeBalance.remaining_office_funds < 0 ? 'বরাদ্দের অতিরিক্ত খরচ' : 'কর্মচারীর হাতে অবশিষ্ট ক্যাশ'}
                            </span>
                        </div>
                        <div className={`p-3 rounded-2xl ${
                            employeeBalance.remaining_office_funds < 0 
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        }`}>
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 4: দায়িত্বপ্রাপ্ত প্রজেক্ট সংখ্যা */}
                    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                                দায়িত্বপ্রাপ্ত প্রজেক্ট
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400">
                                {useBanglaDigits ? employeeAssignedProjects.length.toLocaleString('bn-BD') : employeeAssignedProjects.length} টি
                            </div>
                            <span className="text-[11px] text-teal-700 dark:text-teal-400/80 mt-0.5 block">
                                সক্রিয় প্রজেক্ট দায়িত্ব
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                            <FolderKanban className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Section: Assigned Projects Overview */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {selectedEmployee.name} এর দায়িত্বপ্রাপ্ত প্রজেক্টসমূহ ({employeeAssignedProjects.length}টি)
                            </h3>
                        </div>
                        <span className="text-xs text-slate-400">
                            প্রজেক্টের ফান্ড ও খরচ সম্পূর্ণ স্বাধীন
                        </span>
                    </div>

                    {employeeAssignedProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {employeeAssignedProjects.map(proj => {
                                const myAlloc = (proj.allocations || []).find(a => a.user_id === selectedEmployeeId && a.status === 'active');
                                const allocated = Number(myAlloc?.allocated_amount) || 0;
                                const spent = (proj.expenses || [])
                                    .filter(e => e.user_id === selectedEmployeeId && e.status !== 'rejected')
                                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                                const rem = allocated - spent;

                                return (
                                    <div
                                        key={proj.id}
                                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                                                    #{proj.code}
                                                </span>
                                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                    {proj.name}
                                                </h4>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                                                দায়িত্বপ্রাপ্ত
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 dark:border-slate-700/60 text-xs">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">বরাদ্দ</span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {formatCurrency(allocated, useBanglaDigits)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">খরচ</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                    {formatCurrency(spent, useBanglaDigits)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">অবশিষ্ট</span>
                                                <span className={`font-black ${rem >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {formatCurrency(rem, useBanglaDigits)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                            এই কর্মচারী বর্তমানে কোনো প্রজেক্টের দায়িত্বে নেই।
                        </div>
                    )}
                </div>

                {/* Sub-tabs for Detailed Transactions & Records */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
                        <button
                            type="button"
                            onClick={() => setLedgerSubTab('office_expenses')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                ledgerSubTab === 'office_expenses'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            দৈনিক অফিস খরচ ({employeeOfficeExpenses.length}টি)
                        </button>

                        <button
                            type="button"
                            onClick={() => setLedgerSubTab('projects')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                ledgerSubTab === 'projects'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            প্রজেক্টের খরচ ({employeeProjectExpenses.length}টি)
                        </button>

                        <button
                            type="button"
                            onClick={() => setLedgerSubTab('allocations')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                ledgerSubTab === 'allocations'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            অফিস ফান্ড প্রাপ্তির ইতিহাস ({employeeAllocations.length}টি)
                        </button>
                    </div>

                    {/* Sub-tab 1: Daily Office Expenses */}
                    {ledgerSubTab === 'office_expenses' && (
                        <div className="space-y-3">
                            {employeeOfficeExpenses.length > 0 ? (
                                employeeOfficeExpenses.map(exp => (
                                    <div
                                        key={exp.id}
                                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <Receipt className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                                        {exp.category_name}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {formatDate(exp.expense_date, useBanglaDigits)}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        #{exp.transaction_ref}
                                                    </span>
                                                </div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {exp.description}
                                                </h4>
                                                {exp.other_reason && (
                                                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                                                        কারণ: {exp.other_reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                            <div className="text-right">
                                                <div className="text-sm font-black text-slate-900 dark:text-white">
                                                    {formatCurrency(exp.amount, useBanglaDigits)}
                                                </div>
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                                    {exp.status === 'draft' ? 'খসড়া' : exp.status === 'pending' ? 'যাচাই বাকি' : 'অনুমোদিত'}
                                                </span>
                                            </div>

                                            {exp.receipt_image && (
                                                <button
                                                    type="button"
                                                    onClick={() => onViewReceipt && onViewReceipt(exp.receipt_image, `ভাউচার - ${exp.category_name}`)}
                                                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                                    title="রশিদ দেখুন"
                                                >
                                                    <ZoomIn className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    এই কর্মচারীর কোনো দৈনিক অফিস খরচ রেকর্ড নেই।
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sub-tab 2: Project Expenses */}
                    {ledgerSubTab === 'projects' && (
                        <div className="space-y-3">
                            {employeeProjectExpenses.length > 0 ? (
                                employeeProjectExpenses.map(exp => {
                                    const proj = projects.find(p => p.id === exp.project_id);

                                    return (
                                        <div
                                            key={exp.id}
                                            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                                                    <FolderKanban className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                                                            {proj ? proj.name : 'প্রজেক্ট'}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            {exp.category_name}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {formatDate(exp.expense_date, useBanglaDigits)}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {exp.description}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end sm:self-center">
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-teal-600 dark:text-teal-400">
                                                        {formatCurrency(exp.amount, useBanglaDigits)}
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        {exp.status === 'draft' ? 'খসড়া' : exp.status === 'pending' ? 'যাচাই বাকি' : 'অনুমোদিত'}
                                                    </span>
                                                </div>

                                                {exp.receipt_image && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onViewReceipt && onViewReceipt(exp.receipt_image, `প্রজেক্ট ভাউচার - ${exp.category_name}`)}
                                                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                                        title="রশিদ দেখুন"
                                                    >
                                                        <ZoomIn className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    এই কর্মচারীর কোনো প্রজেক্টভিত্তিক খরচের রেকর্ড নেই।
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sub-tab 3: Office Fund Allocation History */}
                    {ledgerSubTab === 'allocations' && (
                        <div className="space-y-3">
                            {employeeAllocations.length > 0 ? (
                                employeeAllocations.map(alloc => (
                                    <div
                                        key={alloc.id}
                                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <HandCoins className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        টাকা প্রদানকারী: {alloc.money_provider || 'কোম্পানি ফান্ড'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        ({alloc.payment_method})
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {formatDate(alloc.disbursed_at, useBanglaDigits)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    {alloc.notes || 'অফিস খরচের জন্য অগ্রিম বরাদ্দ'}
                                                </p>
                                                <span className="text-[10px] font-mono text-slate-400">
                                                    #{alloc.transaction_ref}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                +{formatCurrency(alloc.amount, useBanglaDigits)}
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                                {alloc.is_received_by_employee ? '✓ বুঝে পেয়েছে' : 'অপেক্ষমান'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    এই কর্মচারীকে এখনো কোনো অফিস ফান্ড প্রদান করা হয়নি।
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        );
    }

    // =========================================================================
    // VIEW 2: MASTER EMPLOYEES LIST VIEW (All Employees Overview)
    // =========================================================================
    return (
        <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span>কর্মচারী ও লেজার ব্যবস্থাপনা</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        সকল কর্মচারীর পৃথক ব্যালেন্স, অফিস ও প্রজেক্ট খরচের লেজার খতিয়ান
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenEmailSetupModal}
                        className="px-3.5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Mail className="w-4 h-4" />
                        <span>ইমেইল সেটিংস</span>
                    </button>

                    <button
                        type="button"
                        onClick={onOpenAddEmployeeModal}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>নতুন কর্মচারী যোগ করুন</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTabSub('approved')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTabSub === 'approved'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        অনুমোদিত কর্মচারী ({approvedEmployees.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTabSub('pending')}
                        className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTabSub === 'pending'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        <span>অনুমোদন অপেক্ষায় ({pendingEmployees.length})</span>
                        {pendingEmployees.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1 animate-pulse"></span>
                        )}
                    </button>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="নাম, আইডি বা বিভাগ দিয়ে খুঁজুন..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                </div>
            </div>

            {/* Pending Approvals Notice Banner if on pending tab */}
            {activeTabSub === 'pending' && pendingEmployees.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                    <strong>বিজ্ঞপ্তি:</strong> এই কর্মচারীরা সেলফ-রেজিস্ট্রেশন করেছেন। অ্যাডমিন অনুমোদন প্রদান করার পরই তারা অফিসের ফান্ডের আবেদন ও খরচ এন্ট্রি করতে পারবেন।
                </div>
            )}

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleEmployees.map((emp) => {
                    const balance = emp.balance_summary || {
                        remaining_office_funds: 0,
                        employee_payable: 0,
                        pending_claims: 0,
                        total_received: 0,
                        total_approved_expenses: 0,
                    };

                    const assignedCount = (projects || []).filter(p => {
                        return (p.allocations || []).some(a => a.user_id === emp.id && a.status === 'active');
                    }).length;

                    return (
                        <div
                            key={emp.id}
                            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all flex flex-col justify-between space-y-4"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shadow-xs">
                                        {emp.name?.charAt(0) || 'E'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                            {emp.name}
                                        </h4>
                                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                                            {emp.employee_id}
                                        </span>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {emp.designation}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {emp.status === 'approved' ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                            অনুমোদিত
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                            পেন্ডিং
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                                <div className="flex items-center gap-2 truncate">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>বিভাগ: {emp.department}</span>
                                </div>
                                <div className="flex items-center gap-2 truncate">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{emp.email}</span>
                                </div>
                                {emp.phone && (
                                    <div className="flex items-center gap-2 truncate">
                                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{emp.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Distinct Financial Position Metrics */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">অবশিষ্ট অফিস ফান্ড:</span>
                                    <span className={`font-extrabold text-sm ${balance.remaining_office_funds < 0 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                        {formatCurrency(balance.remaining_office_funds, useBanglaDigits)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">অফিসের কাছে পাওনা:</span>
                                    <span className={`font-bold ${balance.employee_payable > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                                        {formatCurrency(balance.employee_payable, useBanglaDigits)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">দায়িত্বপ্রাপ্ত প্রজেক্ট:</span>
                                    <span className="font-bold text-teal-600 dark:text-teal-400">
                                        {useBanglaDigits ? assignedCount.toLocaleString('bn-BD') : assignedCount} টি
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 space-y-2">
                                {emp.status === 'pending' ? (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => handleApproveUser(emp.id)}
                                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>অনুমোদন ও মেইলে পাসওয়ার্ড পাঠান</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm(`আপনি কি ${emp.name} এর রেজিস্ট্রেশন আবেদন বাতিল করতে চান?`)) {
                                                    router.post(`/users/${emp.id}/reject`);
                                                }
                                            }}
                                            className="w-full py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                                        >
                                            আবেদন বাতিল করুন
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* View Details Button (Requirement 1) */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEmployeeId(emp.id)}
                                            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>বিস্তারিত দেখুন</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onSelectUserForSimulation(emp)}
                                            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                            title="কর্মচারীর ভিউতে প্রবেশ করুন"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>ভিউতে যান</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
