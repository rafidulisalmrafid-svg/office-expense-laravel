<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FundAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'fund_request_id',
        'user_id',
        'amount',
        'money_provider',
        'payment_method',
        'notes',
        'disbursed_at',
        'is_received_by_employee',
        'received_at',
        'transaction_ref',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_received_by_employee' => 'boolean',
        'disbursed_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fundRequest(): BelongsTo
    {
        return $this->belongsTo(FundRequest::class);
    }
}
