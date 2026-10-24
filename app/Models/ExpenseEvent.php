<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseEvent extends Model
{
    use HasFactory;

    protected $table = 'expense_events';

    protected $fillable = [
        'name',
        'date',
        'budget',
        'description',
    ];

    protected $casts = [
        'budget' => 'float',
        'date' => 'date',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'event_id');
    }
}
