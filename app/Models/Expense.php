<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'project_id',
        'project_allocation_id',
        'expense_date',
        'amount',
        'fund_source', // office_advance, own_pocket, split
        'office_fund_amount',
        'own_pocket_amount',
        'category_name',
        'description',
        'other_reason',
        'receipt_path',
        'receipt_image',
        'status', // draft, pending, revision, approved, rejected, paid, received
        'is_submitted',
        'submitted_at',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'revision_notes',
        'returned_by',
        'returned_at',
        'is_paid',
        'paid_at',
        'paid_by',
        'payment_method',
        'payment_ref',
        'is_received_by_employee',
        'received_at',
        'transaction_ref',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'office_fund_amount' => 'decimal:2',
        'own_pocket_amount' => 'decimal:2',
        'expense_date' => 'date:Y-m-d',
        'is_submitted' => 'boolean',
        'is_paid' => 'boolean',
        'is_received_by_employee' => 'boolean',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'returned_at' => 'datetime',
        'paid_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function projectAllocation(): BelongsTo
    {
        return $this->belongsTo(ProjectAllocation::class);
    }

    public function documentRequests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectDocumentRequest::class);
    }

    public function documents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectDocument::class);
    }
}
