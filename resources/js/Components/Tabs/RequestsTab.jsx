import React, { useState } from 'react';
import { 
    HandCoins, 
    Plus, 
    Search, 
    Filter, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    XCircle, 
    SendHorizontal,
    Calendar,
    User,
    FileText,
    ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function RequestsTab({
    activeRole = 'admin',
    activeUser = null,
    fundRequests = [],
    onOpenRequestModal,
    onOpenReviewModal,
    onOpenDisburseModal,
    onConfirmAllocation,
    useBanglaDigits = true,
}) {
    const isEmployee = activeRole === 'employee';
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter by active employee if in employee mode
    const visibleRequests = fundRequests.filter(req => {
        if (isEmployee && req.user_id !== activeUser?.id) return false;

        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        const matchesSearch = 
            (req.purpose || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.user?.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" /> অপেক্ষমান (Pending)
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> সম্পূর্ণ অনুমোদিত
                    </span>
                );
            case 'partially_approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <AlertTriangle className="w-3 h-3" /> আংশিক অনুমোদিত
                    </span>
                );
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <SendHorizontal className="w-3 h-3" /> টাকা প্রদান সম্পন্ন (Paid)
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
        <div className="space-y-5">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <HandCoins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span>ফান্ড রিকোয়েস্ট ও বরাদ্দ ব্যবস্থাপনা</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isEmployee ? 'আপনার প্রেরিত ফান্ডের আবেদন ও বরাদ্দের তালিকা' : 'সব কর্মচারীর ফান্ডের আবেদন, অনুমোদন ও পেমেন্ট রেকর্ড'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenRequestModal}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>নতুন ফান্ডের আবেদন</span>
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="কাজের কারণ, নাম বা আইডি দিয়ে খুঁজুন..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[
                        { id: 'all', label: 'সবগুলো' },
                        { id: 'pending', label: 'অপেক্ষমান' },
                        { id: 'approved', label: 'অনুমোদিত' },
                        { id: 'partially_approved', label: 'আংশিক' },
                        { id: 'paid', label: 'প্রদানকৃত' },
                        { id: 'rejected', label: 'বাতিল' },
                    ].map(st => (
                        <button
                            key={st.id}
                            type="button"
                            onClick={() => setStatusFilter(st.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                statusFilter === st.id
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fund Request Cards Grid */}
            <div className="space-y-3.5">
                {visibleRequests.length > 0 ? (
                    visibleRequests.map((req) => {
                        const allocation = req.allocation;
                        return (
                            <div 
                                key={req.id}
                                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                                            {req.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {req.user?.name}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    ({req.user?.employee_id})
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {req.user?.designation} • {req.user?.department}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(req.status)}
                                        <span className="text-xs text-slate-400">
                                            {formatDate(req.created_at, useBanglaDigits)}
                                        </span>
                                    </div>
                                </div>

                                {/* Body Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div className="md:col-span-2 space-y-1.5">
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">কাজের উদ্দেশ্য / কারণ:</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                {req.purpose}
                                            </span>
                                        </div>
                                        {req.details && (
                                            <p className="text-slate-600 dark:text-slate-400">
                                                {req.details}
                                            </p>
                                        )}
                                        {req.rejection_reason && (
                                            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium">
                                                <strong>মন্তব্য / কারণ:</strong> {req.rejection_reason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Financial Breakdown Box */}
                                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">চাহিদার পরিমাণ:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(req.requested_amount, useBanglaDigits)}
                                            </span>
                                        </div>
                                        {req.approved_amount && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 dark:text-slate-400">অনুমোদিত পরিমাণ:</span>
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                    {formatCurrency(req.approved_amount, useBanglaDigits)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-500 dark:text-slate-400">তার পূর্ববর্তী অবশিষ্ট ফান্ড:</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                {formatCurrency(req.previous_remaining, useBanglaDigits)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Allocation / Handshake Footer */}
                                {allocation && (
                                    <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                টাকা প্রদানকারী: {allocation.money_provider}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400 ml-2">
                                                ({allocation.payment_method} • Trx: {allocation.transaction_ref})
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {allocation.is_received_by_employee ? (
                                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="w-4 h-4" /> কর্মচারী কর্তৃক প্রাপ্তি নিশ্চিত হয়েছে
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                                                        <Clock className="w-4 h-4" /> প্রাপ্তি কনফার্মেশনের অপেক্ষায়
                                                    </span>
                                                    {isEmployee && req.user_id === activeUser?.id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onConfirmAllocation(allocation)}
                                                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                                                        >
                                                            টাকা বুঝে পেয়েছি
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Action Buttons */}
                                {!isEmployee && (
                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        {req.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenReviewModal(req)}
                                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                                            >
                                                <span>যাচাই ও সিদ্ধান্ত নিন</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}

                                        {(req.status === 'approved' || req.status === 'partially_approved') && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenDisburseModal(req)}
                                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                                            >
                                                <SendHorizontal className="w-3.5 h-3.5" />
                                                <span>টাকা প্রদান করুন (Disburse)</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                        <HandCoins className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            কোনো ফান্ডের রিকোয়েস্ট পাওয়া যায়নি
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                            নতুন ফান্ডের আবেদন তৈরি করতে উপরের বাটনে ক্লিক করুন।
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
