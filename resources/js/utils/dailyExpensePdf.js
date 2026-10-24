import { formatCurrency, formatDate, toBanglaDigits } from './formatters';

/**
 * Generate full HTML document for Daily Expense PDF / Print
 */
export function generateDailyExpenseHtml({
    user = null,
    date = '',
    expenses = [],
    allocatedAmount = 0,
    useBanglaDigits = true,
}) {
    // Filter expenses if mixed dates
    const dayExpenses = (expenses || []).filter(exp => {
        if (!date) return true;
        const eDate = exp.expense_date ? (exp.expense_date.split('T')[0] || exp.expense_date) : '';
        return !eDate || eDate === date;
    });

    const totalExpense = dayExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const alloc = Number(allocatedAmount) || 0;
    const remainingBalance = alloc - totalExpense;

    // Category breakdown
    const categoryMap = {};
    dayExpenses.forEach(exp => {
        const cat = exp.category_name || 'অন্যান্য খরচ';
        categoryMap[cat] = (categoryMap[cat] || 0) + (Number(exp.amount) || 0);
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));

    // Status mapping in Bengali
    const getStatusText = (status) => {
        switch (status) {
            case 'draft': return 'খসড়া (Draft)';
            case 'pending': return 'জমা হয়েছে (Pending)';
            case 'revision': return 'সংশোধনে ফেরত (Revision)';
            case 'approved': return 'অনুমোদিত (Approved)';
            case 'paid': return 'পরিশোধিত (Paid)';
            case 'received': return 'টাকা বুঝে পেয়েছি (Received)';
            case 'rejected': return 'বাতিল (Rejected)';
            default: return status || 'খসড়া';
        }
    };

    const getFundSourceText = (source) => {
        return source === 'own_pocket' ? 'পকেট খরচ (দাবিযোগ্য)' : 'অফিস অগ্রিম ফান্ড';
    };

    const formattedDate = formatDate(date, useBanglaDigits);
    const voucherRef = `VCH-${(date || '').replace(/-/g, '')}-${user?.employee_id || user?.id || 'EMP'}`;
    const generatedAt = new Date().toLocaleString('bn-BD', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    const rowsHtml = dayExpenses.length > 0 ? dayExpenses.map((exp, idx) => {
        const sl = useBanglaDigits ? toBanglaDigits(idx + 1) : (idx + 1);
        const amt = formatCurrency(exp.amount, useBanglaDigits);
        const receiptText = exp.receipt_image ? '✓ রসিদ যুক্ত' : '—';
        const notes = exp.other_reason ? `<br><small style="color: #64748b;">(অন্যান্য কারণ: ${exp.other_reason})</small>` : '';
        const revisionNote = (exp.revision_notes && exp.status === 'revision') 
            ? `<br><small style="color: #c2410c; font-weight: 600;">⚠️ রিভিশন নোট: ${exp.revision_notes}</small>` 
            : '';

        return `
            <tr>
                <td style="text-align: center; font-weight: bold; width: 40px;">${sl}</td>
                <td style="font-weight: 600; color: #1e293b; width: 140px;">${exp.category_name || 'অন্যান্য'}</td>
                <td>
                    <div style="font-weight: 500; color: #0f172a;">${exp.description || '—'}</div>
                    ${notes}
                    ${revisionNote}
                </td>
                <td style="text-align: center; font-size: 11px; width: 120px;">
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 600; background: ${exp.fund_source === 'own_pocket' ? '#fef3c7; color: #92400e;' : '#ecfdf5; color: #065f46;'}">
                        ${getFundSourceText(exp.fund_source)}
                    </span>
                </td>
                <td style="text-align: center; font-size: 11px; width: 90px; color: ${exp.receipt_image ? '#059669' : '#94a3b8'}; font-weight: 600;">
                    ${receiptText}
                </td>
                <td style="text-align: right; font-weight: 700; color: #0f172a; width: 100px;">${amt}</td>
                <td style="text-align: center; font-size: 11px; width: 100px;">
                    <span style="font-weight: 600; color: #475569;">${getStatusText(exp.status)}</span>
                </td>
            </tr>
        `;
    }).join('') : `
        <tr>
            <td colspan="7" style="text-align: center; padding: 24px; color: #64748b; font-style: italic;">
                এই তারিখে কোনো খরচের হিসাব পাওয়া যায়নি।
            </td>
        </tr>
    `;

    const categoryBadgesHtml = categoryBreakdown.map(cat => `
        <div style="display: inline-block; margin: 4px 6px 4px 0; padding: 4px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11.5px;">
            <strong style="color: #334155;">${cat.name}:</strong> 
            <span style="color: #4f46e5; font-weight: 700; margin-left: 4px;">${formatCurrency(cat.amount, useBanglaDigits)}</span>
        </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>দৈনিক খরচের ভাউচার - ${user?.name || 'কর্মচারী'} - ${date}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            background: #f1f5f9;
            padding: 20px;
            font-size: 12.5px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .page-container {
            max-width: 820px;
            margin: 0 auto;
            background: #ffffff;
            padding: 32px 36px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }

        /* Top Action Bar (hidden when printing) */
        .no-print-bar {
            max-width: 820px;
            margin: 0 auto 16px auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 18px;
            background: #1e1b4b;
            color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(30, 27, 75, 0.2);
        }
        .no-print-btn {
            background: #4f46e5;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-family: inherit;
            transition: all 0.15s ease;
        }
        .no-print-btn:hover {
            background: #4338ca;
            transform: translateY(-1px);
        }
        .no-print-close {
            background: transparent;
            color: #cbd5e1;
            border: 1px solid #475569;
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
        }
        .no-print-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
        }

        /* Header */
        .voucher-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 18px;
            border-bottom: 2px solid #0f172a;
            margin-bottom: 18px;
        }
        .company-logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .company-logo-box {
            width: 48px;
            height: 48px;
            background: #312e81;
            color: #ffffff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 900;
        }
        .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .company-tagline {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
        }
        .company-sub {
            font-size: 10px;
            color: #94a3b8;
        }
        .voucher-title-area {
            text-align: right;
        }
        .voucher-badge {
            display: inline-block;
            background: #eef2ff;
            color: #3730a3;
            border: 1px solid #c7d2fe;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            margin-bottom: 4px;
        }
        .voucher-date {
            font-size: 12px;
            font-weight: 600;
            color: #1e293b;
        }
        .voucher-ref {
            font-size: 10px;
            color: #64748b;
            font-family: 'Inter', monospace;
        }

        /* Employee Info Grid */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            padding: 12px 14px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 16px;
        }
        .info-cell {
            font-size: 11px;
        }
        .info-label {
            color: #64748b;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            display: block;
            margin-bottom: 2px;
        }
        .info-value {
            color: #0f172a;
            font-weight: 700;
            font-size: 12px;
        }

        /* Summary Cards */
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
        }
        .summary-card {
            padding: 10px 14px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .summary-card.alloc {
            background: #eef2ff;
            border-color: #c7d2fe;
        }
        .summary-card.expense {
            background: #f8fafc;
            border-color: #cbd5e1;
        }
        .summary-card.balance-positive {
            background: #ecfdf5;
            border-color: #a7f3d0;
        }
        .summary-card.balance-negative {
            background: #fffbeb;
            border-color: #fde68a;
        }
        .card-label {
            font-size: 10.5px;
            font-weight: 600;
            margin-bottom: 2px;
            display: block;
        }
        .alloc .card-label { color: #3730a3; }
        .expense .card-label { color: #475569; }
        .balance-positive .card-label { color: #065f46; }
        .balance-negative .card-label { color: #92400e; }

        .card-amount {
            font-size: 17px;
            font-weight: 800;
        }
        .alloc .card-amount { color: #1e1b4b; }
        .expense .card-amount { color: #0f172a; }
        .balance-positive .card-amount { color: #064e3b; }
        .balance-negative .card-amount { color: #78350f; }

        .card-sub {
            font-size: 9.5px;
            color: #64748b;
            margin-top: 2px;
            display: block;
        }

        /* Category Breakdown */
        .category-section {
            margin-bottom: 16px;
            padding: 10px 12px;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
        }
        .section-heading {
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 6px;
            text-transform: uppercase;
        }

        /* Itemized Table */
        .table-section {
            margin-bottom: 24px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
        }
        th {
            background: #1e293b;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            font-size: 11px;
            letter-spacing: 0.3px;
        }
        td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .total-row td {
            background-color: #f1f5f9 !important;
            font-weight: 800;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            font-size: 12px;
        }

        /* Declaration & Signature Block */
        .declaration-box {
            background: #f8fafc;
            border-left: 3px solid #6366f1;
            padding: 8px 12px;
            font-size: 10.5px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.4;
        }
        .signature-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-top: 36px;
            padding-top: 10px;
        }
        .signature-col {
            text-align: center;
        }
        .signature-line {
            border-top: 1px dashed #94a3b8;
            margin-bottom: 6px;
            padding-top: 6px;
        }
        .signature-name {
            font-size: 11.5px;
            font-weight: 700;
            color: #0f172a;
        }
        .signature-role {
            font-size: 10px;
            color: #64748b;
        }

        /* Footer */
        .voucher-footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 9.5px;
            color: #94a3b8;
        }

        /* Print Media Styles */
        @media print {
            body {
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .no-print-bar {
                display: none !important;
            }
            .page-container {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 10mm 12mm !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
            }
            @page {
                size: A4 portrait;
                margin: 8mm 10mm 8mm 10mm;
            }
            tr {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>

    <!-- On-Screen Action Bar (Hidden in Print) -->
    <div class="no-print-bar">
        <div>
            <strong style="font-size: 13px;">📄 দৈনিক খরচের ভাউচার ও অডিট রিপোর্ট (PDF ভিউ)</strong>
            <p style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">
                প্রিন্ট ডায়ালগ থেকে 'Save as PDF' নির্বাচন করে সরাসরি আপনার ডিভাইসে সংরক্ষণ করুন।
            </p>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="no-print-btn" onclick="window.print();">
                🖨️ PDF ডাউনলোড / প্রিন্ট করুন
            </button>
            <button class="no-print-close" onclick="window.close();">
                ✕ বন্ধ করুন
            </button>
        </div>
    </div>

    <!-- Official Printable A4 Document -->
    <div class="page-container">
        
        <!-- Header -->
        <div class="voucher-header">
            <div class="company-logo-area">
                <div class="company-logo-box">N</div>
                <div>
                    <h1 class="company-name">NEXGEN INNOVATIONS LTD.</h1>
                    <p class="company-tagline">OFFICE EXPENSE & FUND MANAGEMENT SYSTEM</p>
                    <p class="company-sub">কর্পোরেট হেড অফিস, ঢাকা, বাংলাদেশ • হিসাবরক্ষণ ও অডিট বিভাগ</p>
                </div>
            </div>
            <div class="voucher-title-area">
                <div class="voucher-badge">DAILY EXPENSE VOUCHER</div>
                <div class="voucher-date">তারিখ: <strong>${formattedDate}</strong></div>
                <div class="voucher-ref">Ref: ${voucherRef}</div>
            </div>
        </div>

        <!-- Employee Info -->
        <div class="info-grid">
            <div class="info-cell">
                <span class="info-label">কর্মচারীর নাম</span>
                <span class="info-value">${user?.name || 'অনুল্লিখিত'}</span>
            </div>
            <div class="info-cell">
                <span class="info-label">এমপ্লয়ি আইডি</span>
                <span class="info-value">${user?.employee_id || 'EMP-N/A'}</span>
            </div>
            <div class="info-cell">
                <span class="info-label">পদবি ও বিভাগ</span>
                <span class="info-value">${user?.designation || 'Staff'} • ${user?.department || 'Office'}</span>
            </div>
            <div class="info-cell">
                <span class="info-label">ভাউচারের স্ট্যাটাস</span>
                <span class="info-value" style="color: #4f46e5;">দৈনিক খতিয়ান রিপোর্ট</span>
            </div>
        </div>

        <!-- Financial Summary -->
        <div class="summary-cards">
            <div class="summary-card alloc">
                <span class="card-label">আজকের মোট বরাদ্দ (Daily Advance)</span>
                <div class="card-amount">${formatCurrency(alloc, useBanglaDigits)}</div>
                <span class="card-sub">অফিস ফান্ড থেকে প্রাপ্ত অগ্রিম</span>
            </div>
            <div class="summary-card expense">
                <span class="card-label">সারাদিনের মোট খরচ (Total Spent)</span>
                <div class="card-amount">${formatCurrency(totalExpense, useBanglaDigits)}</div>
                <span class="card-sub">মোট ${useBanglaDigits ? toBanglaDigits(dayExpenses.length) : dayExpenses.length}টি খরচের যোগফল</span>
            </div>
            <div class="summary-card ${remainingBalance >= 0 ? 'balance-positive' : 'balance-negative'}">
                <span class="card-label">${remainingBalance >= 0 ? 'অবশিষ্ট ফান্ড (Remaining Cash)' : 'অতিরিক্ত খরচ (পকেট ক্লেইম)'}</span>
                <div class="card-amount">${formatCurrency(Math.abs(remainingBalance), useBanglaDigits)}</div>
                <span class="card-sub">${remainingBalance >= 0 ? 'হাতে থাকা অফিস ফান্ড' : 'অফিসের নিকট কর্মচারীর পাওনা'}</span>
            </div>
        </div>

        <!-- Category Breakdown -->
        ${categoryBreakdown.length > 0 ? `
            <div class="category-section">
                <div class="section-heading">খাতভিত্তিক ব্যয়ের সারাংশ (Category Breakdown):</div>
                <div>${categoryBadgesHtml}</div>
            </div>
        ` : ''}

        <!-- Itemized Expense Table -->
        <div class="table-section">
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">নং</th>
                        <th>খরচের খাত</th>
                        <th>খরচের বিবরণ ও উদ্দেশ্য</th>
                        <th style="text-align: center;">ফান্ডের উৎস</th>
                        <th style="text-align: center;">রসিদ/মেমো</th>
                        <th style="text-align: right;">পরিমাণ (BDT)</th>
                        <th style="text-align: center;">স্ট্যাটাস</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="5" style="text-align: right; padding-right: 14px;">
                            সারাদিনের সর্বমোট খরচ (Grand Total):
                        </td>
                        <td style="text-align: right; color: #4338ca;">
                            ${formatCurrency(totalExpense, useBanglaDigits)}
                        </td>
                        <td style="text-align: center; font-size: 10px; color: #64748b;">
                            ${useBanglaDigits ? toBanglaDigits(dayExpenses.length) : dayExpenses.length}টি আইটেম
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Official Declaration -->
        <div class="declaration-box">
            <strong>ঘোষণাপত্র:</strong> আমি প্রত্যয়ন করছি যে উপরে বর্ণিত সমস্ত খরচ অফিসের দৈনন্দিন প্রশাসনিক/অফিসিয়াল কাজের উদ্দেশ্যে যথাযথভাবে ব্যয় করা হয়েছে। প্রতিটি খরচের বিবরণ সঠিক এবং প্রযোজ্য ক্ষেত্রে অনুমোদিত রসিদ/ভাউচার সংযুক্ত করা হয়েছে।
        </div>

        <!-- Signature Blocks -->
        <div class="signature-grid">
            <div class="signature-col">
                <div class="signature-line">
                    <div class="signature-name">${user?.name || 'কর্মচারীর নাম'}</div>
                    <div class="signature-role">প্রস্তুতকারী (কর্মচারী স্বাক্ষর)</div>
                </div>
            </div>
            <div class="signature-col">
                <div class="signature-line">
                    <div class="signature-name">অফিস হিসাব বিভাগ</div>
                    <div class="signature-role">যাচাইকারী / হিসাবরক্ষক</div>
                </div>
            </div>
            <div class="signature-col">
                <div class="signature-line">
                    <div class="signature-name">প্রশাসক / অনুমোদক</div>
                    <div class="signature-role">চূড়ান্ত অনুমোদনকারী স্বাক্ষর</div>
                </div>
            </div>
        </div>

        <!-- Document Footer -->
        <div class="voucher-footer">
            <span>সিস্টেম জেনারেটেড ডিজিটাল ভাউচার • NexGen Expense Engine v2.0</span>
            <span>প্রিন্ট / জেনারেটের সময়: ${generatedAt}</span>
        </div>

    </div>

    <script>
        // Auto trigger print dialog shortly after load
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Focus window and prompt print
                window.focus();
                window.print();
            }, 300);
        });
    </script>
</body>
</html>`;
}

/**
 * Open print window and trigger PDF print/download
 */
export function openDailyExpensePdf(params) {
    const html = generateDailyExpenseHtml(params);
    const printWindow = window.open('', '_blank', 'width=950,height=900,menubar=no,toolbar=no,location=no,status=no');

    if (!printWindow) {
        // Fallback for pop-up blocked: use hidden iframe
        printDailyExpenseViaIframe(html);
        return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}

/**
 * Fallback: Print via hidden iframe in case pop-up is blocked
 */
export function printDailyExpenseViaIframe(html) {
    let iframe = document.getElementById('daily-expense-print-iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'daily-expense-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow || iframe.contentDocument;
    if (doc.document) {
        doc.document.open();
        doc.document.write(html);
        doc.document.close();
        iframe.contentWindow.focus();
        setTimeout(() => {
            iframe.contentWindow.print();
        }, 400);
    }
}
