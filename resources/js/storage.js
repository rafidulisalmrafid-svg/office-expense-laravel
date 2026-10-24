/**
 * Storage Layer for Office Expense Manager (অফিস খরচ)
 * 
 * All data access and calculations are centralized here.
 * If switching to Supabase or another API backend later, 
 * you only need to swap the methods in this file!
 */

const STORAGE_KEYS = {
    ADVANCES: 'office_expenses_advances',
    EXPENSES: 'office_expenses_items',
    EVENTS: 'office_expenses_events',
    CATEGORIES: 'office_expenses_categories',
    SETTLEMENTS: 'office_expenses_settlements',
};

// Default initial categories
export const DEFAULT_CATEGORIES = [
    'যাতায়াত',
    'নাস্তা',
    'প্রিন্টিং',
    'ইন্টারনেট',
    'অফিস সাপ্লাই',
    'অন্যান্য',
];

// Helper to safely get from localStorage
function getLocalItem(key, defaultValue = []) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

// Helper to safely save to localStorage
function setLocalItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Storage quota exceeded or error saving:', e);
    }
}

export const Storage = {
    // Categories
    getCategories() {
        const cats = getLocalItem(STORAGE_KEYS.CATEGORIES, null);
        if (!cats || cats.length === 0) {
            setLocalItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
            return DEFAULT_CATEGORIES;
        }
        return cats;
    },

    addCategory(categoryName) {
        const cats = this.getCategories();
        if (!cats.includes(categoryName.trim())) {
            cats.push(categoryName.trim());
            setLocalItem(STORAGE_KEYS.CATEGORIES, cats);
        }
        return cats;
    },

    // Advances
    getAdvances() {
        return getLocalItem(STORAGE_KEYS.ADVANCES, []);
    },

    saveAdvance(advance) {
        const advances = this.getAdvances();
        const newAdvance = {
            id: advance.id || Date.now(),
            person: advance.person,
            from_who: advance.from_who || 'কোম্পানি',
            amount: Number(advance.amount) || 0,
            date_time: advance.date_time || new Date().toISOString(),
            purpose: advance.purpose || '',
            is_settled: !!advance.is_settled,
            settled_at: advance.settled_at || null,
            settlement_note: advance.settlement_note || null,
            created_at: new Date().toISOString(),
        };
        advances.unshift(newAdvance);
        setLocalItem(STORAGE_KEYS.ADVANCES, advances);
        return newAdvance;
    },

    settleAdvance(advanceId, note = '', date = null) {
        const advances = this.getAdvances();
        const idx = advances.findIndex(a => a.id === advanceId);
        if (idx !== -1) {
            advances[idx].is_settled = true;
            advances[idx].settled_at = date || new Date().toISOString();
            advances[idx].settlement_note = note || 'পরিশোধ সম্পন্ন';
            setLocalItem(STORAGE_KEYS.ADVANCES, advances);
        }
        return advances;
    },

    deleteAdvance(id) {
        const advances = this.getAdvances().filter(a => a.id !== id);
        setLocalItem(STORAGE_KEYS.ADVANCES, advances);
        return advances;
    },

    // Expenses
    getExpenses() {
        return getLocalItem(STORAGE_KEYS.EXPENSES, []);
    },

    saveExpense(expense) {
        const expenses = this.getExpenses();
        const newExpense = {
            id: expense.id || Date.now(),
            date: expense.date || new Date().toISOString().slice(0, 10),
            amount: Number(expense.amount) || 0,
            category: expense.category,
            person: expense.person,
            advance_id: expense.advance_id ? Number(expense.advance_id) : null,
            event_id: expense.event_id ? Number(expense.event_id) : null,
            note: expense.note || '',
            receipt_image: expense.receipt_image || null,
            created_at: new Date().toISOString(),
        };
        expenses.unshift(newExpense);
        setLocalItem(STORAGE_KEYS.EXPENSES, expenses);
        return newExpense;
    },

    deleteExpense(id) {
        const expenses = this.getExpenses().filter(e => e.id !== id);
        setLocalItem(STORAGE_KEYS.EXPENSES, expenses);
        return expenses;
    },

    // Events
    getEvents() {
        return getLocalItem(STORAGE_KEYS.EVENTS, []);
    },

    saveEvent(event) {
        const events = this.getEvents();
        const newEvent = {
            id: event.id || Date.now(),
            name: event.name,
            date: event.date || new Date().toISOString().slice(0, 10),
            budget: Number(event.budget) || 0,
            description: event.description || '',
            created_at: new Date().toISOString(),
        };
        events.push(newEvent);
        setLocalItem(STORAGE_KEYS.EVENTS, events);
        return newEvent;
    },

    deleteEvent(id) {
        const events = this.getEvents().filter(e => e.id !== id);
        setLocalItem(STORAGE_KEYS.EVENTS, events);
        return events;
    },

    // Settlements
    getSettlements() {
        return getLocalItem(STORAGE_KEYS.SETTLEMENTS, []);
    },

    saveSettlement(settlement) {
        const settlements = this.getSettlements();
        const newSettlement = {
            id: settlement.id || Date.now(),
            advance_id: settlement.advance_id ? Number(settlement.advance_id) : null,
            person: settlement.person,
            amount: Number(settlement.amount) || 0,
            settlement_date: settlement.settlement_date || new Date().toISOString().slice(0, 10),
            note: settlement.note || '',
            created_at: new Date().toISOString(),
        };
        settlements.unshift(newSettlement);
        setLocalItem(STORAGE_KEYS.SETTLEMENTS, settlements);
        return newSettlement;
    },

    /**
     * CORE BALANCE LOGIC
     * 
     * For each advance: balance = advance.amount - sum(expenses linked to this advance)
     * - balance > 0: person owes company ("আপনাকে ফেরত দিতে হবে ৳X")
     * - balance < 0: company owes person ("আপনি পাবেন ৳X")
     * - balance === 0: "হিসাব সমান"
     */
    calculateAdvanceBalance(advance, allExpenses) {
        if (!advance) return { totalExpense: 0, balance: 0, status: 'equal', text: 'হিসাব সমান', amount: 0 };
        
        const linkedExpenses = allExpenses.filter(e => Number(e.advance_id) === Number(advance.id));
        const totalExpense = linkedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const advAmount = Number(advance.amount) || 0;
        const balance = advAmount - totalExpense;

        let status = 'equal';
        let text = 'হিসাব সমান';
        let amount = 0;

        if (balance > 0) {
            status = 'return_to_company'; // Person owes company
            text = 'আপনাকে ফেরত দিতে হবে';
            amount = balance;
        } else if (balance < 0) {
            status = 'receive_from_company'; // Company owes person
            text = 'আপনি পাবেন';
            amount = Math.abs(balance);
        }

        return {
            advanceAmount: advAmount,
            totalExpense,
            balance,
            status,
            text,
            amount,
            isSettled: !!advance.is_settled,
        };
    },

    /**
     * Person-wise summary calculation
     */
    calculatePersonSummary(personName, allAdvances, allExpenses) {
        const personAdvances = allAdvances.filter(a => a.person === personName);
        const personExpenses = allExpenses.filter(e => e.person === personName);

        const totalAdvance = personAdvances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        const totalExpense = personExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const netBalance = totalAdvance - totalExpense;

        let status = 'equal';
        let text = 'হিসাব সমান';
        let amount = 0;

        if (netBalance > 0) {
            status = 'return_to_company';
            text = 'আপনাকে ফেরত দিতে হবে';
            amount = netBalance;
        } else if (netBalance < 0) {
            status = 'receive_from_company';
            text = 'আপনি পাবেন';
            amount = Math.abs(netBalance);
        }

        return {
            person: personName,
            totalAdvance,
            totalExpense,
            netBalance,
            status,
            text,
            amount,
            advancesCount: personAdvances.length,
            expensesCount: personExpenses.length,
        };
    },

    /**
     * Load Demo Data for test cases:
     * - Rakib: advance 2000, expenses 2200 -> receives 200
     * - Tania: advance 2000, expenses 1800 -> returns 200
     * - Hasan: advance 1500, expenses 1500 -> equal
     */
    loadDemoData() {
        const now = new Date();
        const formatDateStr = (d) => d.toISOString().slice(0, 10);
        
        const d4 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
        const d3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const d2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

        const demoAdvances = [
            {
                id: 101,
                person: 'রাকিব আহমেদ',
                from_who: 'কোম্পানি ফান্ড',
                amount: 2000,
                date_time: d4.toISOString(),
                purpose: 'জরুরি ক্লায়েন্ট মিটিং ও ফিল্ড ভিজিট',
                is_settled: false,
                settled_at: null,
                settlement_note: null,
            },
            {
                id: 102,
                person: 'তানিয়া রহমান',
                from_who: 'কোম্পানি ফান্ড',
                amount: 2000,
                date_time: d3.toISOString(),
                purpose: 'ডকুমেন্টেশন ও প্রিন্টিং এর অগ্রিম',
                is_settled: false,
                settled_at: null,
                settlement_note: null,
            },
            {
                id: 103,
                person: 'হাসান মাহমুদ',
                from_who: 'কোম্পানি ফান্ড',
                amount: 1500,
                date_time: d2.toISOString(),
                purpose: 'অফিস ইন্টারনেট ও রাউটার বিল',
                is_settled: false,
                settled_at: null,
                settlement_note: null,
            }
        ];

        const demoEvents = [
            {
                id: 201,
                name: 'অফিস বার্ষিক পুনর্মিলনী ২০২৬',
                date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                budget: 35000,
                description: 'টিম ডিনার, গিফট সামগ্রী এবং সাজসজ্জা',
            },
            {
                id: 202,
                name: 'ক্লায়েন্ট সম্মেলন ও ওয়ার্কশপ',
                date: formatDateStr(d2),
                budget: 15000,
                description: 'ব্রোশার প্রিন্টিং ও রিফ্রেশমেন্ট',
            }
        ];

        const demoExpenses = [
            // Rakib: 1200 + 1000 = 2200 (Advance 2000 -> Person receives 200)
            {
                id: 301,
                date: formatDateStr(d4),
                amount: 1200,
                category: 'যাতায়াত',
                advance_id: 101,
                event_id: 202,
                person: 'রাকিব আহমেদ',
                note: 'উবার ও সিএনজি ভাড়া (ক্লায়েন্ট অফিস ভিজিট)',
            },
            {
                id: 302,
                date: formatDateStr(d3),
                amount: 1000,
                category: 'নাস্তা',
                advance_id: 101,
                event_id: null,
                person: 'রাকিব আহমেদ',
                note: 'টিম লাঞ্চ ও রিফ্রেশমেন্ট',
            },
            // Tania: 1100 + 700 = 1800 (Advance 2000 -> Person returns 200)
            {
                id: 303,
                date: formatDateStr(d3),
                amount: 1100,
                category: 'প্রিন্টিং',
                advance_id: 102,
                event_id: 202,
                person: 'তানিয়া রহমান',
                note: '৫০ কপি ক্যাটালগ প্রিন্ট ও স্পাইরাল বাইন্ডিং',
            },
            {
                id: 304,
                date: formatDateStr(d2),
                amount: 700,
                category: 'নাস্তা',
                advance_id: 102,
                event_id: null,
                person: 'তানিয়া রহমান',
                note: 'বিকেলের চা ও স্ন্যাক্স',
            },
            // Hasan: 1500 (Advance 1500 -> Equal)
            {
                id: 305,
                date: formatDateStr(d2),
                amount: 1500,
                category: 'ইন্টারনেট',
                advance_id: 103,
                event_id: null,
                person: 'হাসান মাহমুদ',
                note: 'অফিসের মাসিক ব্রডব্যান্ড বিল পরিশোধ',
            },
            // Today's expense
            {
                id: 306,
                date: formatDateStr(now),
                amount: 350,
                category: 'নাস্তা',
                advance_id: null,
                event_id: null,
                person: 'রাকিব আহমেদ',
                note: 'আজকের সকালের নাস্তা ও চা',
            }
        ];

        setLocalItem(STORAGE_KEYS.ADVANCES, demoAdvances);
        setLocalItem(STORAGE_KEYS.EXPENSES, demoExpenses);
        setLocalItem(STORAGE_KEYS.EVENTS, demoEvents);
        setLocalItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
        setLocalItem(STORAGE_KEYS.SETTLEMENTS, []);

        return {
            advances: demoAdvances,
            expenses: demoExpenses,
            events: demoEvents,
            categories: DEFAULT_CATEGORIES,
            settlements: [],
        };
    },

    clearAllData() {
        setLocalItem(STORAGE_KEYS.ADVANCES, []);
        setLocalItem(STORAGE_KEYS.EXPENSES, []);
        setLocalItem(STORAGE_KEYS.EVENTS, []);
        setLocalItem(STORAGE_KEYS.SETTLEMENTS, []);
    }
};
