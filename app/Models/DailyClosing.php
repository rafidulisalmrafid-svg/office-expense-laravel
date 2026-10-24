<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyClosing extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'opening_balance',
        'total_disbursed',
        'total_approved_expenses',
        'total_returned',
        'closing_balance',
        'total_employee_remaining',
        'total_employee_payable',
        'total_pending_claims',
        'active_employees_count',
        'generated_by',
        'notes',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'opening_balance' => 'decimal:2',
        'total_disbursed' => 'decimal:2',
        'total_approved_expenses' => 'decimal:2',
        'total_returned' => 'decimal:2',
        'closing_balance' => 'decimal:2',
        'total_employee_remaining' => 'decimal:2',
        'total_employee_payable' => 'decimal:2',
        'total_pending_claims' => 'decimal:2',
    ];

    public function setDateAttribute($value): void
    {
        $this->attributes['date'] = \Carbon\Carbon::parse($value)->toDateString();
    }
}
