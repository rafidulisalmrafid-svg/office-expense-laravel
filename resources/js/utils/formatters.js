// Bengali number and real-time date/time formatting utilities

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const banglaMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const englishMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const banglaDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const englishDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Convert string or number digits to Bengali
 */
export function toBanglaDigits(num) {
    if (num === null || num === undefined) return '';
    return String(num).replace(/[0-9]/g, (w) => banglaDigits[+w]);
}

/**
 * Format currency with ৳ symbol and optional Bengali digits
 */
export function formatCurrency(amount, useBangla = true) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return useBangla ? '৳ ০' : '৳ 0';
    }
    const num = Math.round(Number(amount));
    const formattedWithCommas = num.toLocaleString('en-US');
    
    if (useBangla) {
        return `৳ ${toBanglaDigits(formattedWithCommas)}`;
    }
    return `৳ ${formattedWithCommas}`;
}

/**
 * Get current real-time local date in YYYY-MM-DD format (avoids UTC timezone day shifting)
 */
export function getLocalDateStr(date = new Date()) {
    const d = (typeof date === 'string' || typeof date === 'number') ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Safely extract local YYYY-MM-DD from any date input (string, ISO UTC, or Date)
 * Guarantees that UTC representations resolve accurately to the local calendar date.
 */
export function extractDateStr(dateVal) {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') {
        const trimmed = dateVal.trim();
        // If pure YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
        }
        // If ISO or datetime with timezone, parse into Date to obtain local date
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) {
            return getLocalDateStr(d);
        }
        return trimmed.split('T')[0];
    }
    if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
        return getLocalDateStr(dateVal);
    }
    return '';
}

/**
 * Get current real-time local date & time in YYYY-MM-DDTHH:mm format
 */
export function getLocalDateTimeStr(date = new Date()) {
    const d = (typeof date === 'string' || typeof date === 'number') ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format date nicely, with protection against UTC rollover for YYYY-MM-DD strings
 */
export function formatDate(dateString, useBangla = true) {
    if (!dateString) return '';
    try {
        if (typeof dateString === 'string') {
            const trimmed = dateString.trim();
            const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (ymdMatch) {
                const year = Number(ymdMatch[1]);
                const monthIdx = Number(ymdMatch[2]) - 1;
                const day = Number(ymdMatch[3]);
                if (useBangla) {
                    return `${toBanglaDigits(day)} ${banglaMonths[monthIdx]}, ${toBanglaDigits(year)}`;
                }
                return `${day} ${englishMonths[monthIdx]} ${year}`;
            }
        }

        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        
        const day = d.getDate();
        const monthIdx = d.getMonth();
        const year = d.getFullYear();

        if (useBangla) {
            return `${toBanglaDigits(day)} ${banglaMonths[monthIdx]}, ${toBanglaDigits(year)}`;
        }
        return `${day} ${englishMonths[monthIdx]} ${year}`;
    } catch {
        return dateString;
    }
}

/**
 * Format Date & Time
 */
export function formatDateTime(dateTimeString, useBangla = true) {
    if (!dateTimeString) return '';
    try {
        const d = new Date(dateTimeString);
        if (isNaN(d.getTime())) return dateTimeString;
        
        const datePart = formatDate(dateTimeString, useBangla);
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const isPM = hours >= 12;
        hours = hours % 12 || 12;

        if (useBangla) {
            const timeStr = `${toBanglaDigits(hours)}:${toBanglaDigits(minutes)} ${isPM ? 'বিকাল/রাত' : 'সকাল'}`;
            return `${datePart} ${timeStr}`;
        }
        return `${datePart} ${hours}:${minutes} ${isPM ? 'PM' : 'AM'}`;
    } catch {
        return dateTimeString;
    }
}

/**
 * Format live real-time clock with seconds for header & real-time badge
 */
export function formatLiveClock(date = new Date(), useBangla = true) {
    const d = (typeof date === 'string' || typeof date === 'number') ? new Date(date) : date;
    const dayName = useBangla ? banglaDays[d.getDay()] : englishDays[d.getDay()];
    const dateFormatted = formatDate(getLocalDateStr(d), useBangla);
    let hours = d.getHours();
    const rawHours = hours;
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    const isPM = hours >= 12;
    hours = hours % 12 || 12;
    
    if (useBangla) {
        let period = 'সকাল';
        if (rawHours >= 19 || rawHours < 4) period = 'রাত';
        else if (rawHours >= 16) period = 'সন্ধ্যা/বিকাল';
        else if (rawHours >= 12) period = 'দুপুর';

        return {
            dateText: `${dayName}, ${dateFormatted}`,
            timeText: `${toBanglaDigits(hours)}:${toBanglaDigits(mins)}:${toBanglaDigits(secs)} ${period}`,
            fullText: `${dayName}, ${dateFormatted} | ${toBanglaDigits(hours)}:${toBanglaDigits(mins)}:${toBanglaDigits(secs)} ${period}`
        };
    }
    const period = isPM ? 'PM' : 'AM';
    return {
        dateText: `${dayName}, ${dateFormatted}`,
        timeText: `${hours}:${mins}:${secs} ${period}`,
        fullText: `${dayName}, ${dateFormatted} | ${hours}:${mins}:${secs} ${period}`
    };
}
