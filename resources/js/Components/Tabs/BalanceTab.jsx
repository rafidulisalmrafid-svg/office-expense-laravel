import React, { useState } from 'react';
import { 
    Scale, 
    User, 
    Building2, 
    CheckCircle2, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    History,
    ShieldCheck,
    Coins,
    HelpCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function BalanceTab({
    advances = [],
    expenses = [],
    settlements = [],
    persons = [],
    role = 'admin',
    selectedPerson = '',
    setSelectedPerson,
    useBanglaDigits = true,
    onSettleAdvance,
}) {
    // Two views: 'my_view' (আমার হিসাব) and 'company_view' (কোম্পানি ভিউ)
    const [viewMode, setViewMode] = useState(role === 'employee' ? 'my_view' : 'company_view');

    // Current person for My View
    const activePerson = role === 'employee' ? selectedPerson : (selectedPerson || persons[0] || '');

    // Helper: calculate person summary
    const calculatePersonData = (personName) => {
        const personAdv = advances.filter(a => a.person === personName);
        const personExp = expenses.filter(e => e.person === personName);

        const totalAdv = personAdv.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        const totalExp = personExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const balance = totalAdv - totalExp; // balance = advance - expenses

        let status = 'equal';
        let statusTextMyView = 'হিসাব সমান';
        let statusTextCompanyView = 'হিসাব সমান';

        if (balance > 0) {
            status = 'return_to_company'; // person owes company
            statusTextMyView = `আপনাকে ফেরত দিতে হবে ${formatCurrency(balance, useBanglaDigits)}`;
            statusTextCompanyView = `কোম্পানি ফেরত পাবে ${formatCurrency(balance, useBanglaDigits)}`;
        } else if (balance < 0) {
            status = 'receive_from_company'; // company owes person
            statusTextMyView = `আপনি পাবেন ${formatCurrency(Math.abs(balance), useBanglaDigits)}`;
            statusTextCompanyView = `কোম্পানি দেবে ${formatCurrency(Math.abs(balance), useBanglaDigits)}`;
        }

        return {
            person: personName,
            advances: personAdv,
            expenses: personExp,
            totalAdv,
            totalExp,
            balance,
            status,
            statusTextMyView,
            statusTextCompanyView,
        };
    };

    // All persons calculation
    const allPersonsData = persons.map(p => calculatePersonData(p));

    // Company view totals
    const totalCompanyWillReceive = allPersonsData
        .filter(d => d.balance > 0)
        .reduce((sum, d) => sum + d.balance, 0);

    const totalCompanyWillPay = allPersonsData
        .filter(d => d.balance < 0)
        .reduce((sum, d) => sum + Math.abs(d.balance), 0);

    // My view data
    const myData = calculatePersonData(activePerson);

    return (
        <div className="space-y-6">
            
            {/* Header & View Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Scale className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
                        <span>ব্যালেন্স ও দেনা-পাওনা হিসাব</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        অগ্রিম থেকে খরচ বাদ দিয়ে স্বয়ংক্রিয় সমন্বয় ও নিষ্পত্তি
                    </p>
                </div>

                {/* Two views toggle */}
                <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl border border-slate-300 dark:border-slate-700">
                    <button
                        onClick={() => setViewMode('my_view')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            viewMode === 'my_view'
                                ? 'bg-white text-indigo-900 shadow-sm dark:bg-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>আমার হিসাব (My View)</span>
                    </button>
                    <button
                        onClick={() => setViewMode('company_view')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            viewMode === 'company_view'
                                ? 'bg-white text-indigo-900 shadow-sm dark:bg-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                    >
                        <Building2 className="w-4 h-4 text-cyan-500" />
                        <span>কোম্পানি ভিউ (Company View)</span>
                    </button>
                </div>
            </div>

            {/* View Mode 1: My View */}
            {viewMode === 'my_view' && (
                <div className="space-y-6">
                    {/* Person selector for Admin testing My View */}
                    {role === 'admin' && (
                        <div className="flex items-center gap-2 bg-indigo-50/60 dark:bg-slate-800 p-3 rounded-2xl border border-indigo-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">কর্মী নির্বাচন করুন:</span>
                            <select
                                value={activePerson}
                                onChange={(e) => setSelectedPerson(e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs sm:text-sm font-semibold focus:outline-none"
                            >
                                {persons.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <span className="text-[11px] text-slate-400 hidden sm:inline">(এডমিন যেকোনো কর্মীর ভিউ দেখতে পারেন)</span>
                        </div>
                    )}

                    {/* Big Persona Status Banner */}
                    <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
                        myData.balance > 0
                            ? 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-700/60'
                            : myData.balance < 0
                            ? 'bg-gradient-to-br from-indigo-500/15 via-cyan-500/5 to-transparent border-indigo-300 dark:border-indigo-700/60'
                            : 'bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent border-emerald-300 dark:border-emerald-700/60'
                    }`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                                        কর্মী: {activePerson}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        হিসাবের সূত্র: অগ্রিম − খরচ
                                    </span>
                                </div>

                                <div className="text-2xl sm:text-4xl font-black tracking-tight">
                                    {myData.balance > 0 ? (
                                        <div className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                            <ArrowDownRight className="w-8 h-8" />
                                            <span>আপনাকে ফেরত দিতে হবে {formatCurrency(myData.balance, useBanglaDigits)}</span>
                                        </div>
                                    ) : myData.balance < 0 ? (
                                        <div className="text-indigo-600 dark:text-cyan-400 flex items-center gap-2">
                                            <ArrowUpRight className="w-8 h-8" />
                                            <span>আপনি পাবেন {formatCurrency(Math.abs(myData.balance), useBanglaDigits)}</span>
                                        </div>
                                    ) : (
                                        <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                            <CheckCircle2 className="w-8 h-8" />
                                            <span>হিসাব সমান (৳ ০)</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                    {myData.balance > 0
                                        ? `আপনি কোম্পানি থেকে মোট ${formatCurrency(myData.totalAdv, useBanglaDigits)} অগ্রিম গ্রহণ করেছিলেন এবং ${formatCurrency(myData.totalExp, useBanglaDigits)} খরচ করেছেন। বাকি উদ্বৃত্ত টাকা কোম্পানিকে ফেরত দিতে হবে।`
                                        : myData.balance < 0
                                        ? `আপনি কোম্পানি থেকে মোট ${formatCurrency(myData.totalAdv, useBanglaDigits)} অগ্রিম পেয়েছিলেন কিন্তু মোট খরচ হয়েছে ${formatCurrency(myData.totalExp, useBanglaDigits)}। অতিরিক্ত টাকা আপনি কোম্পানি থেকে ফেরত পাবেন।`
                                        : `আপনি অগ্রিম নিয়েছিলেন ${formatCurrency(myData.totalAdv, useBanglaDigits)} এবং মোট খরচ হয়েছে ${formatCurrency(myData.totalExp, useBanglaDigits)}। হিসাব সম্পূর্ণ সমান রয়েছে।`}
                                </p>
                            </div>

                            {/* Stat Chips */}
                            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-center flex-1">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">মোট অগ্রিম গ্রহণ</div>
                                    <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(myData.totalAdv, useBanglaDigits)}
                                    </div>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-center flex-1">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">মোট খরচ ভাউচার</div>
                                    <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                                        {formatCurrency(myData.totalExp, useBanglaDigits)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown by Advance for this Person */}
                    <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center justify-between">
                            <span>অগ্রিম ভিত্তিক বিস্তারিত হিসাব ও সমন্বয়</span>
                            <span className="text-xs text-slate-400 font-normal">
                                প্রতিটি অগ্রিমের আলাদা ব্যালেন্স
                            </span>
                        </h3>

                        {myData.advances.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl text-center border border-slate-200 dark:border-slate-700 text-slate-400">
                                এই কর্মীর কোনো অগ্রিম গ্রহণের রেকর্ড নেই।
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myData.advances.map((adv) => {
                                    const linkedExp = expenses.filter(e => Number(e.advance_id) === Number(adv.id));
                                    const spent = linkedExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                                    const advBal = (Number(adv.amount) || 0) - spent;

                                    return (
                                        <div
                                            key={adv.id}
                                            className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {adv.purpose || 'অগ্রিম টাকা গ্রহণ'}
                                                    </h4>
                                                    <p className="text-xs text-slate-400">
                                                        উৎস: {adv.from_who} • {formatDate(adv.date_time, useBanglaDigits)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(adv.amount, useBanglaDigits)}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">মূল অগ্রিম</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                                                <div className="flex justify-between text-slate-500">
                                                    <span>মোট খরচ হয়েছে:</span>
                                                    <span className="font-bold text-rose-600">{formatCurrency(spent, useBanglaDigits)}</span>
                                                </div>

                                                <div className={`p-2.5 rounded-xl border font-bold flex justify-between items-center ${
                                                    advBal > 0
                                                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-300'
                                                        : advBal < 0
                                                        ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 text-cyan-800 dark:text-cyan-300'
                                                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                                                }`}>
                                                    <span>
                                                        {advBal > 0
                                                            ? 'আপনাকে ফেরত দিতে হবে'
                                                            : advBal < 0
                                                            ? 'আপনি পাবেন'
                                                            : 'হিসাব সমান'}
                                                    </span>
                                                    <span className="text-sm">
                                                        {advBal === 0 ? '৳ ০' : formatCurrency(Math.abs(advBal), useBanglaDigits)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Settle Action */}
                                            <div className="pt-1 flex items-center justify-between">
                                                <span className="text-[11px] text-slate-400">
                                                    {adv.is_settled ? (
                                                        <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> পরিশোধ সম্পন্ন
                                                        </span>
                                                    ) : (
                                                        'পরিশোধ পেন্ডিং'
                                                    )}
                                                </span>

                                                {!adv.is_settled && (
                                                    <button
                                                        onClick={() => onSettleAdvance(adv)}
                                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>পরিশোধ হয়েছে</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* View Mode 2: Company View */}
            {viewMode === 'company_view' && (
                <div className="space-y-6">
                    {/* Company Summary Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 shadow-xs space-y-1">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                                কোম্পানি ফেরত পাবে (উদ্বৃত্ত অগ্রিম)
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                                {formatCurrency(totalCompanyWillReceive, useBanglaDigits)}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                কর্মীরা গৃহীত অগ্রিমের চেয়ে কম খরচ করেছেন। এই টাকা অফিসে ফেরতযোগ্য।
                            </p>
                        </div>

                        <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent border border-cyan-300 dark:border-indigo-700/60 shadow-xs space-y-1">
                            <span className="text-xs font-bold text-indigo-700 dark:text-cyan-300 uppercase tracking-wider">
                                কোম্পানি প্রদান করবে (অতিরিক্ত খরচ)
                            </span>
                            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-cyan-400">
                                {formatCurrency(totalCompanyWillPay, useBanglaDigits)}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                কর্মীরা অগ্রিমের চেয়ে বেশি খরচ করেছেন। এই টাকা কোম্পানি পরিশোধ করবে।
                            </p>
                        </div>
                    </div>

                    {/* Person-wise Detailed Balance Cards */}
                    <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                            কর্মী ভিত্তিক সার্বিক দেনা-পাওনার তালিকা
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allPersonsData.map((data) => (
                                <div
                                    key={data.person}
                                    className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {data.person}
                                                </h4>
                                                <p className="text-[11px] text-slate-400">
                                                    {data.advances.length} অগ্রিম • {data.expenses.length} খরচ
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Figures */}
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                                            <span className="text-slate-400 text-[10px]">মোট অগ্রিম:</span>
                                            <p className="font-bold text-emerald-600">{formatCurrency(data.totalAdv, useBanglaDigits)}</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
                                            <span className="text-slate-400 text-[10px]">মোট খরচ:</span>
                                            <p className="font-bold text-rose-600">{formatCurrency(data.totalExp, useBanglaDigits)}</p>
                                        </div>
                                    </div>

                                    {/* Company View Balance Status Badge */}
                                    <div className={`p-3 rounded-2xl border text-xs font-bold text-center ${
                                        data.balance > 0
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-300'
                                            : data.balance < 0
                                            ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 text-cyan-800 dark:text-cyan-300'
                                            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                                    }`}>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">
                                            কোম্পানি হিসাব:
                                        </div>
                                        <div className="text-sm">
                                            {data.statusTextCompanyView}
                                        </div>
                                    </div>

                                    {/* Action to switch to My View */}
                                    <button
                                        onClick={() => {
                                            setSelectedPerson(data.person);
                                            setViewMode('my_view');
                                        }}
                                        className="w-full py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        এই কর্মীর সম্পূর্ণ বিবরণ দেখুন →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settlements History Table */}
                    {settlements && settlements.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-indigo-600" />
                                <span>নিষ্পত্তি ও পরিশোধের ইতিহাস</span>
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400">
                                            <th className="py-2.5">তারিখ</th>
                                            <th className="py-2.5">কর্মী</th>
                                            <th className="py-2.5">পরিমাণ</th>
                                            <th className="py-2.5">মন্তব্য / নোট</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {settlements.map((s) => (
                                            <tr key={s.id} className="text-slate-700 dark:text-slate-300">
                                                <td className="py-2.5 font-medium">{formatDate(s.settlement_date, useBanglaDigits)}</td>
                                                <td className="py-2.5 font-bold text-slate-900 dark:text-white">{s.person}</td>
                                                <td className="py-2.5 font-bold text-emerald-600">{formatCurrency(s.amount, useBanglaDigits)}</td>
                                                <td className="py-2.5 text-slate-500">{s.note || 'সম্পন্ন'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
