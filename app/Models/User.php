<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'employee_id',
        'name',
        'email',
        'phone',
        'department',
        'designation',
        'role', // 'admin', 'employee', 'accounts_manager'
        'status', // 'pending', 'approved', 'rejected'
        'avatar',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function fundRequests(): HasMany
    {
        return $this->hasMany(FundRequest::class);
    }

    public function fundAllocations(): HasMany
    {
        return $this->hasMany(FundAllocation::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function fundReturns(): HasMany
    {
        return $this->hasMany(FundReturn::class);
    }

    public function projectAllocations(): HasMany
    {
        return $this->hasMany(ProjectAllocation::class);
    }

    public function projectSettlements(): HasMany
    {
        return $this->hasMany(ProjectSettlement::class);
    }

    public function projectDocumentRequests(): HasMany
    {
        return $this->hasMany(ProjectDocumentRequest::class);
    }

    public function projectDocuments(): HasMany
    {
        return $this->hasMany(ProjectDocument::class);
    }

    /**
     * Compute current real-time Daily Office Expense balances (100% Isolated from Projects):
     * 1. Confirmed Received Daily Office Fund
     * 2. Approved Daily Office Expenses (where project_id IS NULL)
     * 3. Confirmed Returns
     * 4. Remaining Office Fund = Received - Approved Expenses - Returns (allows negative balance)
     * 5. is_overspent = true if Remaining < 0
     * 6. overspent_amount = abs(Remaining) if Remaining < 0
     * 7. Pending Claims = Sum of pending office expenses
     */
    public function getBalanceSummary()
    {
        // 1. Daily Office Fund Received (Cumulative, never resets)
        $totalReceived = (float) $this->fundAllocations()
            ->where('is_received_by_employee', true)
            ->sum('amount');

        // 2. Approved Daily Office Expenses (strictly where project_id IS NULL)
        $totalApprovedOfficeExpenses = (float) $this->expenses()
            ->whereNull('project_id')
            ->whereIn('status', ['approved', 'paid', 'received'])
            ->sum('amount');

        // 3. Total Recorded Daily Office Expenses (draft + pending + approved + paid + received + revision; excludes rejected)
        // CRITICAL: Deduct immediately upon expense input & save, restore upon delete
        $totalRecordedOfficeExpenses = (float) $this->expenses()
            ->whereNull('project_id')
            ->whereNotIn('status', ['rejected'])
            ->sum('amount');

        // 4. Confirmed Daily Office Fund Returns (strictly where project_id IS NULL)
        $totalReturned = (float) $this->fundReturns()
            ->whereNull('project_id')
            ->where('is_confirmed', true)
            ->sum('amount');

        // 5. Pending Office Expense Claims (submitted and waiting for admin review)
        $totalPendingOfficeClaims = (float) $this->expenses()
            ->whereNull('project_id')
            ->where('status', 'pending')
            ->sum('amount');

        // 6. Draft Expenses (saved today, pending final day submit)
        $totalDraftOfficeExpenses = (float) $this->expenses()
            ->whereNull('project_id')
            ->where('status', 'draft')
            ->sum('amount');

        // 7. Net Office Fund Position (instantly deducts upon save, restores on delete)
        $netFundPosition = $totalReceived - $totalRecordedOfficeExpenses - $totalReturned;
        $isOverspent = $netFundPosition < 0;
        $overspentAmount = $isOverspent ? abs($netFundPosition) : 0;
        $employeePayable = $isOverspent ? $overspentAmount : 0;

        return [
            'total_received' => $totalReceived,
            'total_approved_expenses' => $totalApprovedOfficeExpenses,
            'total_recorded_expenses' => $totalRecordedOfficeExpenses,
            'total_office_expenses' => $totalRecordedOfficeExpenses,
            'total_draft_expenses' => $totalDraftOfficeExpenses,
            'total_returned' => $totalReturned,
            'remaining_office_funds' => $netFundPosition,
            'is_overspent' => $isOverspent,
            'overspent_amount' => $overspentAmount,
            'employee_payable' => $employeePayable,
            'pending_claims' => $totalPendingOfficeClaims,
        ];
    }
}
