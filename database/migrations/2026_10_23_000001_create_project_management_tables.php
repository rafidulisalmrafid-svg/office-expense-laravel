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
        // 1. Projects Table
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // e.g. PRJ-A, PRJ-B
            $table->text('description')->nullable();
            $table->decimal('budget', 14, 2)->default(0);
            $table->string('status')->default('active'); // active, pending_completion, completed, cancelled
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 2. Project Allocations Table (Specific employee allocations per project)
        Schema::create('project_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('allocated_amount', 12, 2);
            $table->string('payment_method')->default('Cash'); // Cash, Bank, bKash
            $table->text('notes')->nullable();
            $table->string('status')->default('active'); // active, pending_completion, completed
            $table->foreignId('allocated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('transaction_ref')->unique();
            $table->timestamps();
        });

        // 3. Add project columns to expenses table
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('category_id')->constrained('projects')->nullOnDelete();
            $table->foreignId('project_allocation_id')->nullable()->after('project_id')->constrained('project_allocations')->nullOnDelete();
        });

        // 4. Project Document Requests (Admin asks employee for receipts/documents)
        Schema::create('project_document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('expense_id')->nullable()->constrained('expenses')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending, submitted, verified
            $table->timestamps();
        });

        // 5. Project Documents (Uploaded photos, PDFs, receipts)
        Schema::create('project_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('project_document_request_id')->nullable()->constrained('project_document_requests')->nullOnDelete();
            $table->foreignId('expense_id')->nullable()->constrained('expenses')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path')->nullable();
            $table->longText('file_data')->nullable(); // Base64 storage for zero-config file viewing
            $table->string('file_type')->default('image'); // image, pdf, document
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Project Settlements (Final calculation on Finish Project)
        Schema::create('project_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('allocated_amount', 12, 2);
            $table->decimal('spent_amount', 12, 2);
            $table->decimal('balance_amount', 12, 2); // allocated - spent (>0: employee returns, <0: office pays)
            $table->string('settlement_type'); // refund_to_office, reimbursement_to_employee, balanced
            $table->string('status')->default('pending_approval'); // pending_approval, approved, rejected
            $table->text('employee_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('finished_at');
            $table->dateTime('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_settlements');
        Schema::dropIfExists('project_documents');
        Schema::dropIfExists('project_document_requests');

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['project_allocation_id']);
            $table->dropForeign(['project_id']);
            $table->dropColumn(['project_allocation_id', 'project_id']);
        });

        Schema::dropIfExists('project_allocations');
        Schema::dropIfExists('projects');
    }
};
