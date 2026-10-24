import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    Building2, 
    Shield, 
    Lock, 
    Mail, 
    User, 
    Phone, 
    Briefcase, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    Sparkles, 
    SendHorizontal,
    Sun,
    Moon,
    Eye,
    EyeOff,
    Users,
    KeyRound,
    UserPlus,
    Clock
} from 'lucide-react';

export default function Login({
    flash = {},
    from_email = 'rafidul.labar.bd@gmail.com',
}) {
    const { errors = {} } = usePage().props;
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('office_dark_mode') === 'true');

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Register Form State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirmation, setRegPasswordConfirmation] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [regRole, setRegRole] = useState('employee');
    const [regPhone, setRegPhone] = useState('');
    const [regDepartment, setRegDepartment] = useState('Operations');
    const [regDesignation, setRegDesignation] = useState('Field Officer');
    const [isRegistering, setIsRegistering] = useState(false);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem('office_dark_mode', String(next));
        if (next) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        router.post('/login', {
            email: loginEmail,
            password: loginPassword,
            remember: rememberMe,
        }, {
            onFinish: () => setIsLoggingIn(false),
        });
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        setIsRegistering(true);
        router.post('/register', {
            name: regName,
            email: regEmail,
            password: regPassword,
            password_confirmation: regPasswordConfirmation,
            role: regRole,
            phone: regPhone,
            department: regDepartment,
            designation: regDesignation,
        }, {
            onFinish: () => setIsRegistering(false),
            onSuccess: () => {
                // Pre-fill login email and switch to login tab
                setLoginEmail(regEmail);
                setLoginPassword('');
                setActiveTab('login');
                setRegName('');
                setRegEmail('');
                setRegPassword('');
                setRegPasswordConfirmation('');
                setRegPhone('');
            }
        });
    };

    // Quick demo login trigger
    const handleQuickDemo = (role) => {
        router.get(`/demo-login/${role}`);
    };

    // Quick credentials autofill helper
    const fillCredentials = (email, password) => {
        setLoginEmail(email);
        setLoginPassword(password);
    };

    return (
        <div className={`min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8 transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 text-slate-800'}`}>
            <Head title="লগইন ও রেজিস্ট্রেশন - অফিস খরচ ব্যবস্থাপনা" />

            {/* Dark Mode Floating Toggle */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-all"
                    title={darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
                >
                    {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-400/20 mb-3 animate-in zoom-in-75 duration-300">
                    <Building2 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    অফিস <span className="text-indigo-600 dark:text-indigo-400">খরচ</span>
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                    অফিস তহবিল, দৈনিক ব্যয় ও কর্মচারী হিসাব ব্যবস্থাপনা সিস্টেম
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
                <div className="bg-white dark:bg-slate-900 py-7 px-5 sm:px-9 shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800 transition-all">
                    
                    {/* Flash Alerts */}
                    {flash.success && (
                        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-start gap-3 animate-in fade-in duration-200">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {(flash.error || Object.keys(errors).length > 0) && (
                        <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-300 flex items-start gap-3 animate-in fade-in duration-200">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                {flash.error && <div>{flash.error}</div>}
                                {Object.values(errors).map((err, idx) => (
                                    <div key={idx} className="text-rose-700 dark:text-rose-300">• {err}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mode Navigation Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'login'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <KeyRound className="w-4 h-4" />
                            <span>লগইন করুন</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'register'
                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>নতুন অ্যাকাউন্ট রেজিস্ট্রেশন</span>
                        </button>
                    </div>

                    {/* TAB 1: LOGIN FORM */}
                    {activeTab === 'login' && (
                        <div className="space-y-5 animate-in fade-in duration-150">
                            
                            {/* Role Quick Pickers & Demo Logins */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>রোল নির্বাচন করুন অথবা ১-ক্লিকে ডেমো লগইন:</span>
                                </span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {/* Admin Card */}
                                    <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900 dark:text-purple-200">
                                                <Shield className="w-3.5 h-3.5 text-purple-600" />
                                                <span>অ্যাডমিন (Admin)</span>
                                            </div>
                                            <div className="text-[10px] text-purple-700 dark:text-purple-300 mt-0.5 truncate">
                                                admin@company.com
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => fillCredentials('admin@company.com', 'password123')}
                                                className="flex-1 py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900 text-[10px] font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all text-center"
                                                title="ইনপুট বক্সে বসান"
                                            >
                                                ফিল্ডে বসান
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickDemo('admin')}
                                                className="flex-1 py-1 px-1.5 rounded-lg bg-purple-600 text-[10px] font-bold text-white hover:bg-purple-700 transition-all text-center shadow-xs"
                                                title="সরাসরি ১-ক্লিকে লগইন"
                                            >
                                                ১-ক্লিক লগইন
                                            </button>
                                        </div>
                                    </div>

                                    {/* Employee Card */}
                                    <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                                                <User className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>কর্মচারী (Employee)</span>
                                            </div>
                                            <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">
                                                rahim@company.com
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => fillCredentials('rahim@company.com', 'password123')}
                                                className="flex-1 py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all text-center"
                                                title="ইনপুট বক্সে বসান"
                                            >
                                                ফিল্ডে বসান
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickDemo('employee')}
                                                className="flex-1 py-1 px-1.5 rounded-lg bg-emerald-600 text-[10px] font-bold text-white hover:bg-emerald-700 transition-all text-center shadow-xs"
                                                title="সরাসরি ১-ক্লিকে লগইন"
                                            >
                                                ১-ক্লিক লগইন
                                            </button>
                                        </div>
                                    </div>

                                    {/* Accounts Card */}
                                    <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900 dark:text-blue-200">
                                                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                                                <span>হিসাবরক্ষক (Accounts)</span>
                                            </div>
                                            <div className="text-[10px] text-blue-700 dark:text-blue-300 mt-0.5 truncate">
                                                accounts@company.com
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => fillCredentials('accounts@company.com', 'password123')}
                                                className="flex-1 py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900 text-[10px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all text-center"
                                                title="ইনপুট বক্সে বসান"
                                            >
                                                ফিল্ডে বসান
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickDemo('accounts')}
                                                className="flex-1 py-1 px-1.5 rounded-lg bg-blue-600 text-[10px] font-bold text-white hover:bg-blue-700 transition-all text-center shadow-xs"
                                                title="সরাসরি ১-ক্লিকে লগইন"
                                            >
                                                ১-ক্লিক লগইন
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex py-1 items-center">
                                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                                <span className="shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">অথবা ইমেইল ও পাসওয়ার্ড লিখুন</span>
                                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        ইমেইল ঠিকানা (Email Address) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            placeholder="admin@company.com বা rahim@company.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        পাসওয়ার্ড (Password) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showLoginPassword ? 'text' : 'password'}
                                            required
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            title={showLoginPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                                        >
                                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                        <span className="text-slate-600 dark:text-slate-400">লগইন মনে রাখুন</span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('register')}
                                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        অ্যাকাউন্ট নেই? নতুন রেজিস্ট্রেশন
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <span>{isLoggingIn ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* TAB 2: REGISTRATION FORM */}
                    {activeTab === 'register' && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                            
                            {/* Admin Approval Notice Banner */}
                            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>অ্যাডমিন অনুমোদন আবশ্যক:</span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                                    রেজিস্ট্রেশন করার পর আপনার অ্যাকাউন্টটি অ্যাডমিনের অনুমোদনের অপেক্ষায় থাকবে। অ্যাডমিন অনুমোদন দিলে আপনার ইমেইলে কনফার্মেশন ও লগইন পাসওয়ার্ড পাঠানো হবে। অ্যাডমিনের অনুমোদন ছাড়া লগইন করা সম্ভব নয়।
                                </p>
                            </div>

                            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        আপনার পূর্ণ নাম (Full Name) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            placeholder="যেমন: সাকিব আল হাসান"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        ইমেইল ঠিকানা (Email Address) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            placeholder="sakib@company.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        অ্যাকাউন্টের ধরন / পদমর্যাদা (Role) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setRegRole('employee')}
                                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                                                regRole === 'employee'
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            কর্মচারী
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRegRole('admin')}
                                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                                                regRole === 'admin'
                                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            অ্যাডমিন
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRegRole('accounts_manager')}
                                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                                                regRole === 'accounts_manager'
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            হিসাবরক্ষক
                                        </button>
                                    </div>
                                </div>

                                {/* Password & Confirmation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showRegPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowRegPassword(!showRegPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            >
                                                {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type={showRegPassword ? 'text' : 'password'}
                                                required
                                                minLength={6}
                                                value={regPasswordConfirmation}
                                                onChange={(e) => setRegPasswordConfirmation(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            বিভাগ (Department) <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={regDepartment}
                                            onChange={(e) => setRegDepartment(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                        >
                                            <option value="Operations">Operations</option>
                                            <option value="Marketing & Sales">Marketing & Sales</option>
                                            <option value="IT & Tech Support">IT & Tech Support</option>
                                            <option value="Procurement">Procurement</option>
                                            <option value="Human Resources">Human Resources</option>
                                            <option value="Accounts & Finance">Accounts & Finance</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            পদবি (Designation) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={regDesignation}
                                            onChange={(e) => setRegDesignation(e.target.value)}
                                            placeholder="যেমন: Field Officer"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        মোবাইল নম্বর (Phone - ঐচ্ছিক)
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            placeholder="01819-000000"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isRegistering}
                                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <span>{isRegistering ? 'রেজিস্ট্রেশন সম্পন্ন হচ্ছে...' : 'রেজিস্ট্রেশন সম্পূর্ণ করুন'}</span>
                                    <SendHorizontal className="w-4 h-4" />
                                </button>
                            </form>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('login')}
                                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                >
                                    আগে থেকেই অ্যাকাউন্ট আছে? <strong className="text-indigo-600 dark:text-indigo-400">লগইন করুন</strong>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <div className="text-center mt-6 text-xs text-slate-400">
                অফিস খরচ ব্যবস্থাপনা সিস্টেম • NexGen Expense
            </div>
        </div>
    );
}
