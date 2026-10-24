<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FundReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'amount',
        'return_date',
        'received_by',
        'payment_method',
        'reason',
        'is_confirmed',
        'confirmed_at',
        'transaction_ref',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'return_date' => 'date:Y-m-d',
        'is_confirmed' => 'boolean',
        'confirmed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
