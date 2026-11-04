<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShiftTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'start_time',
        'end_time',
        'is_cross_day',
        'break_minutes',
        'grace_period_minutes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_cross_day' => 'boolean',
            'break_minutes' => 'integer',
            'grace_period_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function rosters(): HasMany
    {
        return $this->hasMany(EmployeeRoster::class);
    }
}

