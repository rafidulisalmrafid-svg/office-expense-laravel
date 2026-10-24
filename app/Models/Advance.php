<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advance extends Model
{
    use HasFactory;

    protected $fillable = [
        'person',
        'from_who',
        'amount',
        'date_time',
        'purpose',
        'is_settled',
        'settled_at',
        'settlement_note',
    ];

    protected $casts = [
        'amount' => 'float',
        'is_settled' => 'boolean',
        'date_time' => 'datetime',
        'settled_at' => 'datetime',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'advance_id');
    }

    public function settlements()
    {
        return $this->hasMany(Settlement::class, 'advance_id');
    }
}
