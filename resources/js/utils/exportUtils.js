import * as XLSX from 'xlsx';

/**
 * Export table data to Excel (.xlsx)
 */
export function exportToExcel(data, fileName = 'office-expense-report') {
    if (!data || !data.length) {
        alert('এক্সপোর্ট করার মতো কোনো তথ্য নেই!');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense_Report');

    // Auto-fit column widths
    const maxProps = Object.keys(data[0] || {});
    worksheet['!cols'] = maxProps.map(prop => ({
        wch: Math.max(...data.map(row => (row[prop] ? String(row[prop]).length : 5)), prop.length + 3)
    }));

    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Trigger browser print (can save as PDF)
 */
export function printPage() {
    window.print();
}
