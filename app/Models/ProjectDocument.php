<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'project_document_request_id',
        'expense_id',
        'user_id',
        'file_name',
        'file_path',
        'file_data',
        'file_type',
        'notes',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ProjectDocumentRequest::class, 'project_document_request_id');
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
