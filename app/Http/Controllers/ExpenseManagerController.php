<?php

namespace App\Http\Controllers;

use App\Models\Advance;
use App\Models\Category;
use App\Models\Expense;
use App\Models\ExpenseEvent;
use App\Models\Settlement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;
use Carbon\Carbon;

class ExpenseManagerController extends Controller
{
    /**
     * Display the main expense manager application.
     */
    public function index()
    {
        $advances = Advance::with(['expenses', 'settlements'])->orderBy('date_time', 'desc')->get();
        $expenses = Expense::with(['advance', 'event'])->orderBy('date', 'desc')->orderBy('id', 'desc')->get();
        $events = ExpenseEvent::with('expenses')->orderBy('date', 'asc')->get();
        $categories = Category::orderBy('name', 'asc')->get();
        $settlements = Settlement::with('advance')->orderBy('settlement_date', 'desc')->get();

        // Get unique list of persons from advances and expenses
        $advancePersons = Advance::pluck('person')->filter();
        $expensePersons = Expense::pluck('person')->filter();
        $persons = $advancePersons->merge($expensePersons)->unique()->values()->all();

        if (empty($persons)) {
            $persons = ['রাকিব আহমেদ', 'তানিয়া রহমান', 'হাসান মাহমুদ'];
        }

        return Inertia::render('OfficeExpense', [
            'advances' => $advances,
            'expenses' => $expenses,
            'events' => $events,
            'categories' => $categories,
            'settlements' => $settlements,
            'persons' => $persons,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store a new advance / fund entry.
     */
    public function storeAdvance(Request $request)
    {
        $validated = $request->validate([
            'person' => 'required|string|max:255',
            'from_who' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'date_time' => 'required|string',
            'purpose' => 'nullable|string|max:1000',
        ]);

        Advance::create([
            'person' => trim($validated['person']),
            'from_who' => trim($validated['from_who']),
            'amount' => $validated['amount'],
            'date_time' => Carbon::parse($validated['date_time']),
            'purpose' => $validated['purpose'] ?? '',
            'is_settled' => false,
        ]);

        return redirect()->back()->with('success', 'টাকা গ্রহণ (অগ্রিম) সফলভাবে যুক্ত হয়েছে!');
    }

    /**
     * Mark an advance as settled.
     */
    public function settleAdvance(Request $request, Advance $advance)
    {
        $validated = $request->validate([
            'settlement_date' => 'nullable|date',
            'note' => 'nullable|string|max:1000',
            'amount' => 'nullable|numeric',
        ]);

        $settlementDate = $validated['settlement_date'] ? Carbon::parse($validated['settlement_date']) : Carbon::now();
        $note = $validated['note'] ?? 'হিসাব নিষ্পত্তি সম্পন্ন';

        $advance->update([
            'is_settled' => true,
            'settled_at' => $settlementDate,
            'settlement_note' => $note,
        ]);

        // Calculate settled amount if not provided
        $totalSpent = $advance->expenses()->sum('amount');
        $settledAmount = $validated['amount'] ?? abs($advance->amount - $totalSpent);

        Settlement::create([
            'advance_id' => $advance->id,
            'person' => $advance->person,
            'amount' => $settledAmount,
            'settlement_date' => $settlementDate->format('Y-m-d'),
            'note' => $note,
        ]);

        return redirect()->back()->with('success', 'অ্যাডভান্স হিসাব সফলভাবে পরিশোধ ও নিষ্পত্তি করা হয়েছে!');
    }

    /**
     * Delete an advance.
     */
    public function deleteAdvance(Advance $advance)
    {
        $advance->delete();
        return redirect()->back()->with('success', 'অগ্রিম এন্ট্রি মুছে ফেলা হয়েছে!');
    }

    /**
     * Store a new expense entry.
     */
    public function storeExpense(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric|min:1',
            'category' => 'required|string|max:255',
            'person' => 'required|string|max:255',
            'advance_id' => 'nullable|exists:advances,id',
            'event_id' => 'nullable|exists:expense_events,id',
            'note' => 'nullable|string|max:1000',
            'receipt_image' => 'nullable|string',
        ]);

        // Ensure category exists
        Category::firstOrCreate(['name' => trim($validated['category'])]);

        Expense::create([
            'date' => $validated['date'],
            'amount' => $validated['amount'],
            'category' => trim($validated['category']),
            'person' => trim($validated['person']),
            'advance_id' => $validated['advance_id'] ?: null,
            'event_id' => $validated['event_id'] ?: null,
            'note' => $validated['note'] ?? null,
            'receipt_image' => $validated['receipt_image'] ?? null,
        ]);

        return redirect()->back()->with('success', 'খরচ এন্ট্রি সফলভাবে সংরক্ষিত হয়েছে!');
    }

    /**
     * Delete an expense.
     */
    public function deleteExpense(Expense $expense)
    {
        $expense->delete();
        return redirect()->back()->with('success', 'খরচ এন্ট্রি মুছে ফেলা হয়েছে!');
    }

    /**
     * Store a new event.
     */
    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'budget' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
        ]);

        ExpenseEvent::create([
            'name' => trim($validated['name']),
            'date' => $validated['date'],
            'budget' => $validated['budget'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->back()->with('success', 'নতুন ইভেন্ট যুক্ত হয়েছে!');
    }

    /**
     * Delete an event.
     */
    public function deleteEvent(ExpenseEvent $event)
    {
        $event->delete();
        return redirect()->back()->with('success', 'ইভেন্ট মুছে ফেলা হয়েছে!');
    }

    /**
     * Store a new category.
     */
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        Category::create([
            'name' => trim($validated['name']),
            'is_default' => false,
        ]);

        return redirect()->back()->with('success', 'নতুন ক্যাটাগরি তৈরি হয়েছে!');
    }

    /**
     * Load demo seed data.
     */
    public function loadDemoData()
    {
        // Truncate tables and reseed
        Settlement::query()->delete();
        Expense::query()->delete();
        Advance::query()->delete();
        ExpenseEvent::query()->delete();

        Artisan::call('db:seed', ['--class' => 'DatabaseSeeder', '--force' => true]);

        return redirect()->back()->with('success', 'ডেমো তথ্য সফলভাবে লোড হয়েছে!');
    }

    /**
     * Clear all transactional data.
     */
    public function clearData()
    {
        Settlement::query()->delete();
        Expense::query()->delete();
        Advance::query()->delete();
        ExpenseEvent::query()->delete();

        return redirect()->back()->with('success', 'সব লেনদেনের ডেটা পরিষ্কার করা হয়েছে!');
    }
}
