<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_bn',
        'icon',
        'description',
        'is_default',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
