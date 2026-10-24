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
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('fund_source')->default('office_advance')->after('amount'); // office_advance, own_pocket, split
            $table->decimal('office_fund_amount', 12, 2)->default(0.00)->after('fund_source');
            $table->decimal('own_pocket_amount', 12, 2)->default(0.00)->after('office_fund_amount');
            
            $table->boolean('is_submitted')->default(true)->after('status'); // true if submitted for admin review
            $table->dateTime('submitted_at')->nullable()->after('is_submitted');
            
            $table->text('revision_notes')->nullable()->after('rejection_reason');
            $table->string('returned_by')->nullable()->after('revision_notes');
            $table->dateTime('returned_at')->nullable()->after('returned_by');
            
            $table->boolean('is_paid')->default(false)->after('returned_at');
            $table->dateTime('paid_at')->nullable()->after('is_paid');
            $table->string('paid_by')->nullable()->after('paid_at');
            $table->string('payment_method')->nullable()->after('paid_by'); // Cash, bKash, Bank, etc.
            $table->string('payment_ref')->nullable()->after('payment_method');
            
            $table->boolean('is_received_by_employee')->default(false)->after('payment_ref');
            $table->dateTime('received_at')->nullable()->after('is_received_by_employee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn([
                'fund_source',
                'office_fund_amount',
                'own_pocket_amount',
                'is_submitted',
                'submitted_at',
                'revision_notes',
                'returned_by',
                'returned_at',
                'is_paid',
                'paid_at',
                'paid_by',
                'payment_method',
                'payment_ref',
                'is_received_by_employee',
                'received_at'
            ]);
        });
    }
};
