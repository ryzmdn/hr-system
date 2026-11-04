<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'default_quota',
        'is_paid',
        'requires_attachment',
        'max_consecutive_days',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'default_quota' => 'integer',
            'is_paid' => 'boolean',
            'requires_attachment' => 'boolean',
            'max_consecutive_days' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function balances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}

