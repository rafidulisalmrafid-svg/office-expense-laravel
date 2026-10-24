import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    User, 
    Moon, 
    Sun, 
    Bell, 
    RotateCcw, 
    ChevronDown, 
    Sparkles, 
    Layers,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    Users,
    LogOut,
    Calendar
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { formatLiveClock } from '../utils/formatters';

export default function Header({
    activeRole = 'admin',
    onRoleChange,
    users = [],
    activeUser = null,
    onUserChange,
    useBanglaDigits = true,
    onToggleDigits,
    darkMode = false,
    onToggleDarkMode,
    officeSummary = {},
    activeUserPendingAllocations = [],
}) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => new Date());

    // Continuous 1-second real-time live clock ticker
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const liveTime = formatLiveClock(currentTime, useBanglaDigits);

    // Compute notification count
    const totalNotifications = (activeRole === 'admin')
        ? (officeSummary.pending_fund_requests_count || 0) + 
          (officeSummary.pending_expenses_count || 0) + 
          (officeSummary.pending_users_count || 0)
        : (activeUserPendingAllocations.length || 0);

    const handleResetDemo = () => {
        if (confirm('আপনি কি সমস্ত ডেমো ডেটা পুনরায় রিসেট করতে চান? সব ট্রানজেকশন প্রারম্ভিক অবস্থায় ফিরে যাবে।')) {
            router.post('/reset-demo');
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
                    
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="relative flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/20">
                            <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
                            <span className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="font-bold text-sm sm:text-xl tracking-tight text-slate-900 dark:text-white">
                                    NexGen <span className="text-indigo-600 dark:text-indigo-400">Expense</span>
                                </span>
                                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800">
                                    PRO
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                                অফিস ফান্ড ও দৈনিক ব্যয় ব্যবস্থাপনা
                            </p>
                        </div>
                    </div>

                    {/* Middle: Role Switcher (Admin vs Employee Simulation - ONLY for Admin/Managers) */}
                    {activeUser?.role !== 'employee' && (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                            <button
                                type="button"
                                onClick={() => onRoleChange('admin')}
                                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeRole === 'admin'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Shield className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">অ্যাডমিন প্যানেল</span>
                                <span className="inline md:hidden">অ্যাডমিন</span>
                                {activeRole !== 'admin' && (officeSummary.pending_fund_requests_count + officeSummary.pending_expenses_count) > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => onRoleChange('employee')}
                                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    activeRole === 'employee'
                                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">কর্মচারী ভিউ</span>
                                <span className="inline md:hidden">কর্মী</span>
                                {activeUserPendingAllocations.length > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Live Real-Time Date & Clock Indicator */}
                    <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                        <div className="relative flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75"></span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>
                        </div>
                        <div className="text-left leading-tight">
                            <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>{liveTime.dateText}</span>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{liveTime.timeText}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded-sm bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-sans font-bold ml-1">
                                    লাইভ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Controls: Persona Picker, Notifications, Theme, Reset */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        
                        {/* Profile Info / Persona Picker */}
                        {activeUser?.role === 'employee' ? (
                            /* Strictly locked single employee profile chip - No switching to other employees */
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                    {activeUser?.name?.charAt(0) || 'E'}
                                </div>
                                <div className="max-w-[130px] truncate">
                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                        {activeUser?.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                        {activeUser?.employee_id} • {activeUser?.department}
                                    </div>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
                                    আমার আইডি
                                </span>
                            </div>
                        ) : (
                            /* Admin Persona Switcher (For testing/simulation by Admin) */
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                                        {activeRole === 'admin' ? 'A' : (activeUser?.name?.charAt(0) || 'E')}
                                    </div>
                                    <div className="hidden md:block max-w-[120px] truncate">
                                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {activeRole === 'admin' ? 'অ্যাডমিন তাহমিদ' : activeUser?.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate">
                                            {activeRole === 'admin' ? 'ম্যানেজিং ডিরেক্টর' : activeUser?.designation}
                                        </div>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>

                                {/* Dropdown for Switching User Simulation */}
                                {isUserMenuOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setIsUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                                            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                    ব্যবহারকারী সুইচ করুন (সিমুলেশন)
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                    যেকোনো কর্মচারীর দৃষ্টিকোণ থেকে ওয়ালেট ও হিসাব দেখার সুবিধা
                                                </p>
                                            </div>

                                            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                                                {users.map((u) => {
                                                    const isCurrent = activeUser?.id === u.id;
                                                    return (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => {
                                                                onUserChange(u);
                                                                if (u.role === 'admin') {
                                                                    onRoleChange('admin');
                                                                } else {
                                                                    onRoleChange('employee');
                                                                }
                                                                setIsUserMenuOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                                                                isCurrent
                                                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            <div className="truncate pr-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span>{u.name}</span>
                                                                    {u.role === 'admin' && (
                                                                        <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                                                                            Admin
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 truncate">
                                                                    {u.employee_id} • {u.designation || u.department}
                                                                </div>
                                                            </div>
                                                            <div className="text-right text-[11px] shrink-0 font-medium">
                                                                {u.balance_summary?.remaining_office_funds > 0 ? (
                                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                                        ৳{u.balance_summary.remaining_office_funds}
                                                                    </span>
                                                                ) : u.balance_summary?.employee_payable > 0 ? (
                                                                    <span className="text-amber-600 dark:text-amber-400">
                                                                        পাওনা ৳{u.balance_summary.employee_payable}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400">৳০</span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm('আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট থেকে লগআউট করতে চান?')) {
                                                                localStorage.removeItem('office_active_role');
                                                                router.post('/logout');
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span>লগআউট করুন</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="নোটিফিকেশন"
                            >
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                                {totalNotifications > 0 && (
                                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
                                        {totalNotifications}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotificationOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setIsNotificationOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                নোটিফিকেশন ও অ্যালার্ট ({totalNotifications})
                                            </h4>
                                            <span className="text-[10px] text-slate-400">লাইভ আপডেট</span>
                                        </div>

                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {activeRole === 'admin' ? (
                                                <>
                                                    {officeSummary.pending_fund_requests_count > 0 && (
                                                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                                                            <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{officeSummary.pending_fund_requests_count}টি নতুন ফান্ড রিকোয়েস্ট অপেক্ষায়!</span>
                                                            </div>
                                                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                                                                কর্মচারীদের আবেদনের অনুমোদন বা আংশিক বরাদ্দ প্রদান করুন।
                                                            </p>
                                                        </div>
                                                    )}

                                                    {officeSummary.pending_expenses_count > 0 && (
                                                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs">
                                                            <div className="flex items-center gap-1.5 font-semibold text-indigo-800 dark:text-indigo-300">
                                                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{officeSummary.pending_expenses_count}টি দৈনিক খরচের রসিদ যাচাই বাকি</span>
                                                            </div>
                                                            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-1">
                                                                ভাউচার ও রসিদ যাচাই করে অনুমোদন দিন।
                                                            </p>
                                                        </div>
                                                    )}

                                                    {officeSummary.pending_users_count > 0 && (
                                                        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs">
                                                            <div className="flex items-center gap-1.5 font-semibold text-purple-800 dark:text-purple-300">
                                                                <Users className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{officeSummary.pending_users_count} জন নতুন কর্মচারী অনুমোদনের অপেক্ষায়</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {totalNotifications === 0 && (
                                                        <p className="text-center py-6 text-xs text-slate-400">
                                                            কোনো পেন্ডিং অ্যাকশন নেই! সব হিসাব আপ-টু-ডেট আছে।
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {activeUserPendingAllocations.length > 0 ? (
                                                        activeUserPendingAllocations.map(alloc => (
                                                            <div key={alloc.id} className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                                                                <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                                    <span>টাকা প্রদান করা হয়েছে: ৳{alloc.amount}</span>
                                                                </div>
                                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                                                                    {alloc.money_provider} আপনাকে ৳{alloc.amount} প্রদান করেছেন। প্রাপ্তি নিশ্চিত করতে কনফার্ম করুন।
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center py-6 text-xs text-slate-400">
                                                            আপনার কোনো অপেক্ষমান নোটিফিকেশন নেই।
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Bengali / English Numbers Toggle */}
                        <button
                            type="button"
                            onClick={onToggleDigits}
                            className="px-2 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            title="সংখ্যা ফরম্যাট পরিবর্তন"
                        >
                            {useBanglaDigits ? '১২৩' : '123'}
                        </button>

                        {/* Dark Mode Toggle */}
                        <button
                            type="button"
                            onClick={onToggleDarkMode}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={darkMode ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
                        >
                            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>

                        {/* Reset Demo Button (Admin Only) */}
                        {activeUser?.role !== 'employee' && activeRole === 'admin' && (
                            <button
                                type="button"
                                onClick={handleResetDemo}
                                className="p-2 rounded-xl text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors hidden sm:block"
                                title="ডেমো ডেটা রিসেট করুন"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        )}

                        {/* Logout Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm('আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট থেকে লগআউট করতে চান?')) {
                                    localStorage.removeItem('office_active_role');
                                    router.post('/logout');
                                }
                            }}
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer shrink-0"
                            title="লগআউট করুন"
                        >
                            <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span className="hidden sm:inline">লগআউট</span>
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}
