<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FundRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'requested_amount',
        'approved_amount',
        'purpose',
        'details',
        'needed_date',
        'quotation_doc',
        'previous_remaining',
        'status', // pending, approved, partially_approved, rejected, disbursed
        'rejection_reason',
    ];

    protected $casts = [
        'requested_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'previous_remaining' => 'decimal:2',
        'needed_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function allocation(): HasOne
    {
        return $this->hasOne(FundAllocation::class);
    }
}
