<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\OfficeExpenseController;
use Illuminate\Support\Facades\Route;

// Root redirects to Login or Dashboard
Route::get('/', function () {
    return redirect()->route('login');
});

// Authentication Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::post('/register', [AuthController::class, 'register'])->name('register.attempt');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/demo-login/{role}', [AuthController::class, 'demoLogin'])->name('demo.login');

// Protected Office Dashboard & Actions (Requires Authentication)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [OfficeExpenseController::class, 'index'])->name('dashboard');

    // Fund Requests
    Route::post('/fund-requests', [OfficeExpenseController::class, 'storeFundRequest'])->name('fund-requests.store');
    Route::post('/fund-requests/{fundRequest}/review', [OfficeExpenseController::class, 'reviewFundRequest'])->name('fund-requests.review');

    // Fund Allocations & Confirmations
    Route::post('/fund-allocations', [OfficeExpenseController::class, 'disburseFund'])->name('fund-allocations.disburse');
    Route::post('/fund-allocations/{fundAllocation}/confirm', [OfficeExpenseController::class, 'confirmFundReceipt'])->name('fund-allocations.confirm');

    // Expenses & Complete Daily Lifecycle
    Route::post('/expenses', [OfficeExpenseController::class, 'storeExpense'])->name('expenses.store');
    Route::post('/expenses/submit-day', [OfficeExpenseController::class, 'submitDayExpenses'])->name('expenses.submit-day');
    Route::post('/expenses/approve-day', [OfficeExpenseController::class, 'approveDayExpenses'])->name('expenses.approve-day');
    Route::post('/expenses/revision-day', [OfficeExpenseController::class, 'revisionDayExpenses'])->name('expenses.revision-day');
    Route::post('/expenses/{expense}/submit', [OfficeExpenseController::class, 'submitExpense'])->name('expenses.submit');
    Route::post('/expenses/{expense}/update', [OfficeExpenseController::class, 'updateExpense'])->name('expenses.update');
    Route::delete('/expenses/{expense}', [OfficeExpenseController::class, 'destroyExpense'])->name('expenses.destroy');
    Route::post('/expenses/{expense}/verify', [OfficeExpenseController::class, 'verifyExpense'])->name('expenses.verify');
    Route::post('/expenses/{expense}/pay', [OfficeExpenseController::class, 'payExpense'])->name('expenses.pay');
    Route::post('/expenses/{expense}/confirm-received', [OfficeExpenseController::class, 'confirmExpenseReceived'])->name('expenses.confirm-received');

    // Expense Categories Management
    Route::post('/categories', [OfficeExpenseController::class, 'storeCategory'])->name('categories.store');
    Route::put('/categories/{category}', [OfficeExpenseController::class, 'updateCategory'])->name('categories.update');
    Route::delete('/categories/{category}', [OfficeExpenseController::class, 'destroyCategory'])->name('categories.destroy');

    // Fund Returns (Recovery)
    Route::post('/fund-returns', [OfficeExpenseController::class, 'storeFundReturn'])->name('fund-returns.store');

    // Daily Closing & Reports
    Route::post('/daily-closing', [OfficeExpenseController::class, 'generateDailyClosing'])->name('daily-closing.generate');

    // Employee Management
    Route::post('/users', [OfficeExpenseController::class, 'storeUser'])->name('users.store');
    Route::post('/users/{user}/approve', [OfficeExpenseController::class, 'approveUser'])->name('users.approve');
    Route::post('/users/{user}/reject', [OfficeExpenseController::class, 'rejectUser'])->name('users.reject');

    // Email Setup & Testing
    Route::post('/settings/mail', [OfficeExpenseController::class, 'updateMailSettings'])->name('settings.mail');
    Route::post('/settings/mail-test', [OfficeExpenseController::class, 'sendTestEmail'])->name('settings.mail-test');

    // Project Management & Isolated Expense Tracking
    Route::post('/projects', [OfficeExpenseController::class, 'storeProject'])->name('projects.store');
    Route::post('/projects/{project}/team', [OfficeExpenseController::class, 'updateProjectTeam'])->name('projects.team');
    Route::post('/projects/{project}/allocate', [OfficeExpenseController::class, 'allocateProjectFund'])->name('projects.allocate');
    Route::post('/projects/{project}/finish', [OfficeExpenseController::class, 'finishProject'])->name('projects.finish');
    Route::post('/projects/settlements/{settlement}/review', [OfficeExpenseController::class, 'reviewProjectSettlement'])->name('projects.settlement.review');
    Route::post('/projects/{project}/request-document', [OfficeExpenseController::class, 'requestProjectDocument'])->name('projects.request-document');
    Route::post('/projects/{project}/upload-document', [OfficeExpenseController::class, 'uploadProjectDocument'])->name('projects.upload-document');
    Route::post('/projects/documents/{document}/verify', [OfficeExpenseController::class, 'verifyProjectDocument'])->name('projects.document.verify');

    // System Reset
    Route::post('/reset-demo', [OfficeExpenseController::class, 'resetDemoData'])->name('demo.reset');
});

