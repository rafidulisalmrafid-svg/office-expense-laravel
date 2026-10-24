<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectSettlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'allocated_amount',
        'spent_amount',
        'balance_amount',
        'settlement_type', // refund_to_office, reimbursement_to_employee, balanced
        'status', // pending_approval, approved, rejected
        'employee_notes',
        'admin_notes',
        'approved_by',
        'finished_at',
        'approved_at',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
        'spent_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'finished_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
