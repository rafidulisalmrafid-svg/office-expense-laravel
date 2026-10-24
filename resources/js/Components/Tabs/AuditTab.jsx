import React, { useState } from 'react';
import { 
    History, 
    Search, 
    ShieldCheck, 
    Calendar, 
    User, 
    ArrowRight,
    Tag,
    Clock
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function AuditTab({
    activeRole = 'admin',
    auditLogs = [],
    useBanglaDigits = true,
}) {
    const isEmployee = activeRole === 'employee';
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLogs = auditLogs.filter(log => {
        return (log.transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (log.action_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (log.remarks || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
               (log.actor_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getActionBadge = (type) => {
        if (type.includes('disbursed') || type.includes('received')) {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200">ফান্ড বিতরণ</span>;
        }
        if (type.includes('expense')) {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">খরচ এন্ট্রি/যাচাই</span>;
        }
        if (type.includes('return')) {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200">টাকা ফেরত</span>;
        }
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300">সিস্টেম অডিট</span>;
    };

    return (
        <div className="space-y-5">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span>{isEmployee ? 'আমার ব্যক্তিগত লেনদেন ও অডিট রেকর্ড' : 'অডিট ট্রেইল ও লেনদেন নিরাপত্তা রেকর্ড (Audit Logs)'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isEmployee 
                            ? 'আপনার অ্যাকাউন্টের মাধ্যমে সম্পন্ন ফান্ড রিকোয়েস্ট, বরাদ্দ গ্রহণ ও খরচের ইতিহাস'
                            : 'প্রতিটি আর্থিক পরিবর্তনের অপরিবর্তনযোগ্য ইতিহাস ও ট্রানজেকশন ট্র্যাকিং'}
                    </p>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ট্রানজেকশন ID বা বিবরণ খুঁজুন..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                </div>
            </div>

            {/* Audit Log Timeline Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="p-3.5">ট্রানজেকশন ID</th>
                                <th className="p-3.5">সময় ও তারিখ</th>
                                <th className="p-3.5">লেনদেনের ধরন</th>
                                <th className="p-3.5">পরিমাণ</th>
                                <th className="p-3.5">অ্যাক্টর / ইউজার</th>
                                <th className="p-3.5">বিস্তারিত বিবরণ ও অডিট নোট</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {log.transaction_id}
                                        </td>
                                        <td className="p-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {formatDateTime(log.created_at, useBanglaDigits)}
                                        </td>
                                        <td className="p-3.5 whitespace-nowrap">
                                            {getActionBadge(log.action_type)}
                                        </td>
                                        <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                            {log.amount > 0 ? formatCurrency(log.amount, useBanglaDigits) : '-'}
                                        </td>
                                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            {log.actor_name || log.user?.name || 'System'}
                                        </td>
                                        <td className="p-3.5 text-slate-600 dark:text-slate-400">
                                            {log.remarks}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">
                                        কোনো অডিট রেকর্ড পাওয়া যায়নি।
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
