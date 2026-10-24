<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'allocated_amount',
        'payment_method',
        'notes',
        'status', // active, pending_completion, completed
        'allocated_by',
        'transaction_ref',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function allocator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'project_allocation_id');
    }
}
