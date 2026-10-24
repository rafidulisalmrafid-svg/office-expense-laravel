<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'budget',
        'status', // active, pending_completion, completed, cancelled
        'start_date',
        'end_date',
        'created_by',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(ProjectAllocation::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function documentRequests(): HasMany
    {
        return $this->hasMany(ProjectDocumentRequest::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(ProjectSettlement::class);
    }

    /**
     * Compute financial summary for this project overall or for a specific employee.
     */
    public function getSummaryForUser(?int $userId = null)
    {
        $allocQuery = $this->allocations();
        $expenseQuery = $this->expenses();

        if ($userId) {
            $allocQuery->where('user_id', $userId);
            $expenseQuery->where('user_id', $userId);
        }

        $allocatedAmount = (float) (clone $allocQuery)->sum('allocated_amount');
        $approvedSpent = (float) (clone $expenseQuery)->whereIn('status', ['approved', 'paid', 'received'])->sum('amount');
        $pendingSpent = (float) (clone $expenseQuery)->where('status', 'pending')->sum('amount');
        $draftSpent = (float) (clone $expenseQuery)->where('status', 'draft')->sum('amount');
        
        // Immediate deduction upon input & save; instant restoration upon delete (excludes rejected)
        $totalSpent = (float) (clone $expenseQuery)->whereNotIn('status', ['rejected'])->sum('amount');
        $remaining = $allocatedAmount - $totalSpent;

        return [
            'allocated_amount' => $allocatedAmount,
            'approved_spent' => $approvedSpent,
            'pending_spent' => $pendingSpent,
            'draft_spent' => $draftSpent,
            'total_spent' => $totalSpent,
            'remaining_balance' => $remaining,
            'is_overspent' => $remaining < 0,
            'overspent_amount' => $remaining < 0 ? abs($remaining) : 0,
            'percentage_used' => $allocatedAmount > 0 ? min(100, round(($totalSpent / $allocatedAmount) * 100, 1)) : 0,
        ];
    }
}
