<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_bn');
            $table->string('icon')->default('Receipt');
            $table->boolean('is_default')->default(true);
            $table->timestamps();
        });

        // 2. Fund Requests
        Schema::create('fund_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('requested_amount', 12, 2);
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->string('purpose');
            $table->text('details')->nullable();
            $table->date('needed_date')->nullable();
            $table->string('quotation_doc')->nullable();
            $table->decimal('previous_remaining', 12, 2)->default(0);
            $table->string('status')->default('pending'); // pending, approved, partially_approved, rejected, paid
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // 3. Fund Allocations (Disbursements & Confirmations)
        Schema::create('fund_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fund_request_id')->nullable()->constrained('fund_requests')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('money_provider')->default('অ্যাকাউন্টস ম্যানেজার'); // Who physically or virtually gave the cash
            $table->string('payment_method')->default('Cash'); // Cash, Bank, bKash, Nagad
            $table->text('notes')->nullable();
            $table->dateTime('disbursed_at');
            $table->boolean('is_received_by_employee')->default(false); // Employee receipt confirmation
            $table->dateTime('received_at')->nullable();
            $table->string('transaction_ref')->unique();
            $table->timestamps();
        });

        // 4. Daily Expenses
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->date('expense_date');
            $table->decimal('amount', 12, 2);
            $table->string('category_name')->nullable();
            $table->text('description');
            $table->string('receipt_path')->nullable();
            $table->longText('receipt_image')->nullable(); // Base64 or local file URL
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->string('verified_by')->nullable();
            $table->dateTime('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('transaction_ref')->unique();
            $table->timestamps();
        });

        // 5. Fund Returns (Unused money recovery)
        Schema::create('fund_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('return_date');
            $table->string('received_by'); // Admin / Cashier who received money back
            $table->string('payment_method')->default('Cash');
            $table->string('reason')->nullable();
            $table->boolean('is_confirmed')->default(true);
            $table->dateTime('confirmed_at')->nullable();
            $table->string('transaction_ref')->unique();
            $table->timestamps();
        });

        // 6. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action_type'); // fund_allocated, fund_confirmed, expense_submitted, expense_approved, fund_returned, etc.
            $table->string('entity_type')->nullable(); // FundAllocation, Expense, FundReturn
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('balance_before', 12, 2)->default(0);
            $table->decimal('balance_after', 12, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->string('actor_name')->nullable();
            $table->timestamps();
        });

        // 7. Daily Closings
        Schema::create('daily_closings', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->decimal('opening_balance', 14, 2)->default(0);
            $table->decimal('total_disbursed', 14, 2)->default(0);
            $table->decimal('total_approved_expenses', 14, 2)->default(0);
            $table->decimal('total_returned', 14, 2)->default(0);
            $table->decimal('closing_balance', 14, 2)->default(0);
            $table->decimal('total_employee_remaining', 14, 2)->default(0);
            $table->decimal('total_employee_payable', 14, 2)->default(0);
            $table->decimal('total_pending_claims', 14, 2)->default(0);
            $table->integer('active_employees_count')->default(0);
            $table->string('generated_by')->default('System');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_closings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('fund_returns');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('fund_allocations');
        Schema::dropIfExists('fund_requests');
        Schema::dropIfExists('categories');
    }
};
