<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReimbursementType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'annual_limit',
        'requires_receipt',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'annual_limit' => 'float',
            'requires_receipt' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function balances(): HasMany
    {
        return $this->hasMany(EmployeeReimbursementBalance::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(ReimbursementRequest::class);
    }
}

