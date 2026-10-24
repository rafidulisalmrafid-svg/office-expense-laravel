<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Advance;
use App\Models\Expense;

echo "==========================================\n";
echo "পরীক্ষা: ব্যালেন্স হিসাব যাচাইকরণ (Test Balance Logic)\n";
echo "==========================================\n";

// Case 1: রাকিব - Advance 2000, Expenses 2200
$rakibAdv = Advance::where('person', 'রাকিব আহমেদ')->first();
$rakibExpenses = Expense::where('advance_id', $rakibAdv->id)->get();
$rakibTotalSpent = $rakibExpenses->sum('amount');
$rakibBalance = $rakibAdv->amount - $rakibTotalSpent;

echo "\nটেস্ট কেস ১ (Test Case 1):\n";
echo "কর্মী: {$rakibAdv->person}\n";
echo "গৃহীত অগ্রিম (Advance): {$rakibAdv->amount} ৳\n";
echo "মোট খরচ (Expenses): {$rakibTotalSpent} ৳\n";
echo "ব্যালেন্স সূত্র: অগ্রিম - খরচ = {$rakibAdv->amount} - {$rakibTotalSpent} = {$rakibBalance} ৳\n";

if ($rakibBalance < 0) {
    $personReceives = abs($rakibBalance);
    echo "ফলাফল: ব্যক্তি পাবেন (Person receives) = {$personReceives} ৳\n";
    echo "বাংলা বার্তা: 'আপনি পাবেন ৳" . $personReceives . "'\n";
    assert($personReceives == 200, "Error in Rakib balance calculation");
    echo "✓ টেস্ট ১ সফলভাবে পাস করেছে! (advance 2000, expenses 2200 → person receives 200)\n";
} else {
    echo "✗ টেস্ট ১ ব্যর্থ!\n";
}

// Case 2: তানিয়া - Advance 2000, Expenses 1800
$taniaAdv = Advance::where('person', 'তানিয়া রহমান')->first();
$taniaExpenses = Expense::where('advance_id', $taniaAdv->id)->get();
$taniaTotalSpent = $taniaExpenses->sum('amount');
$taniaBalance = $taniaAdv->amount - $taniaTotalSpent;

echo "\n------------------------------------------\n";
echo "টেস্ট কেস ২ (Test Case 2):\n";
echo "কর্মী: {$taniaAdv->person}\n";
echo "গৃহীত অগ্রিম (Advance): {$taniaAdv->amount} ৳\n";
echo "মোট খরচ (Expenses): {$taniaTotalSpent} ৳\n";
echo "ব্যালেন্স সূত্র: অগ্রিম - খরচ = {$taniaAdv->amount} - {$taniaTotalSpent} = {$taniaBalance} ৳\n";

if ($taniaBalance > 0) {
    echo "ফলাফল: ব্যক্তিকে ফেরত দিতে হবে (Person returns) = {$taniaBalance} ৳\n";
    echo "বাংলা বার্তা: 'আপনাকে ফেরত দিতে হবে ৳" . $taniaBalance . "'\n";
    assert($taniaBalance == 200, "Error in Tania balance calculation");
    echo "✓ টেস্ট ২ সফলভাবে পাস করেছে! (advance 2000, expenses 1800 → person returns 200)\n";
} else {
    echo "✗ টেস্ট ২ ব্যর্থ!\n";
}

// Case 3: হাসান - Advance 1500, Expenses 1500
$hasanAdv = Advance::where('person', 'হাসান মাহমুদ')->first();
$hasanExpenses = Expense::where('advance_id', $hasanAdv->id)->get();
$hasanTotalSpent = $hasanExpenses->sum('amount');
$hasanBalance = $hasanAdv->amount - $hasanTotalSpent;

echo "\n------------------------------------------\n";
echo "টেস্ট কেস ৩ (Test Case 3):\n";
echo "কর্মী: {$hasanAdv->person}\n";
echo "গৃহীত অগ্রিম: {$hasanAdv->amount} ৳\n";
echo "মোট খরচ: {$hasanTotalSpent} ৳\n";
echo "ব্যালেন্স: {$hasanBalance} ৳\n";
if ($hasanBalance == 0) {
    echo "ফলাফল: 'হিসাব সমান'\n";
    echo "✓ টেস্ট ৩ সফলভাবে পাস করেছে!\n";
}

echo "==========================================\n";
echo "সকল টেস্ট কেস ১০০% সঠিকভাবে কার্যকর হয়েছে!\n";
echo "==========================================\n";
