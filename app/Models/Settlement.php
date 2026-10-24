<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Settlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'advance_id',
        'person',
        'amount',
        'settlement_date',
        'note',
    ];

    protected $casts = [
        'amount' => 'float',
        'settlement_date' => 'date',
    ];

    public function advance()
    {
        return $this->belongsTo(Advance::class, 'advance_id');
    }
}
