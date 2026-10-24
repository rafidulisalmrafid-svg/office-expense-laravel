<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectDocumentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'requested_by',
        'expense_id',
        'title',
        'description',
        'status', // pending, submitted, verified
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class, 'project_document_request_id');
    }
}
