import React from 'react';
import { 
    CalendarDays, 
    Plus, 
    AlertTriangle, 
    CheckCircle2, 
    Trash2, 
    ReceiptText, 
    DollarSign,
    Calendar,
    Tag
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function EventsTab({
    events = [],
    expenses = [],
    role = 'admin',
    useBanglaDigits = true,
    onOpenAddEvent,
    onDeleteEvent,
}) {
    return (
        <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <CalendarDays className="w-6 h-6 text-purple-600" />
                        <span>ইভেন্ট ও বিশেষ বাজেট ট্র্যাকিং</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        বিশেষ প্রজেক্ট বা ইভেন্টের জন্য নির্ধারিত বাজেট ও খরচের হিসাব
                    </p>
                </div>

                <button
                    onClick={onOpenAddEvent}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ নতুন ইভেন্ট তৈরি</span>
                </button>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
                    <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                        কোনো ইভেন্ট বা বিশেষ প্রজেক্ট নেই
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        নতুন কোনো মিটিং, পার্টি, ভ্রমণ বা বিশেষ আয়োজনের জন্য বাজেট নির্ধারণ করতে "+ নতুন ইভেন্ট তৈরি" বাটনে ক্লিক করুন।
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {events.map((ev) => {
                        // Expenses tagged to this event
                        const eventExpenses = expenses.filter(e => Number(e.event_id) === Number(ev.id));
                        const totalSpent = eventExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                        const budget = Number(ev.budget) || 0;
                        const percentage = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
                        const isOverBudget = totalSpent > budget;

                        // Category breakdown for this event
                        const catBreakdown = {};
                        eventExpenses.forEach(e => {
                            catBreakdown[e.category] = (catBreakdown[e.category] || 0) + (Number(e.amount) || 0);
                        });

                        return (
                            <div
                                key={ev.id}
                                className={`p-6 rounded-3xl bg-white dark:bg-slate-800 border transition-all shadow-xs space-y-4 ${
                                    isOverBudget
                                        ? 'border-rose-300 dark:border-rose-800/80 ring-2 ring-rose-500/10'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                {/* Top Title & Date */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                                {ev.name}
                                            </h3>
                                            {isOverBudget ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3 text-rose-600" /> বাজেট অতিক্রম!
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> বাজেটের মধ্যে
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>তারিখ: {formatDate(ev.date, useBanglaDigits)}</span>
                                        </div>
                                    </div>

                                    {role === 'admin' && (
                                        <button
                                            onClick={() => onDeleteEvent(ev)}
                                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                                            title="ইভেন্ট মুছুন"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {ev.description && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl">
                                        {ev.description}
                                    </p>
                                )}

                                {/* Budget vs Spent Card */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">
                                            খরচ: <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(totalSpent, useBanglaDigits)}</span>
                                        </span>
                                        <span className="text-slate-500">
                                            বাজেট: <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(budget, useBanglaDigits)}</span>
                                        </span>
                                    </div>

                                    {/* Progress Bar (turns red if over budget) */}
                                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                isOverBudget
                                                    ? 'bg-rose-500 animate-pulse'
                                                    : percentage > 80
                                                    ? 'bg-amber-500'
                                                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                            }`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className={isOverBudget ? 'font-bold text-rose-600' : 'text-slate-400'}>
                                            {isOverBudget ? `বাজেটের চেয়ে ${formatCurrency(totalSpent - budget, useBanglaDigits)} বেশি!` : `বাজেট বাকি: ${formatCurrency(budget - totalSpent, useBanglaDigits)}`}
                                        </span>
                                        <span className="font-bold text-slate-600 dark:text-slate-400">
                                            {percentage}% ব্যবহৃত
                                        </span>
                                    </div>
                                </div>

                                {/* Category-wise Breakdown */}
                                {Object.keys(catBreakdown).length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            খাতওয়ারী খরচ বিভাজন:
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(catBreakdown).map(([cat, amt]) => (
                                                <span
                                                    key={cat}
                                                    className="text-xs px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/60 font-medium"
                                                >
                                                    {cat}: <strong className="font-bold">{formatCurrency(amt, useBanglaDigits)}</strong>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}
