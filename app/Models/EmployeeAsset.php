<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AssetCondition;
use App\Enums\AssetStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'asset_tag',
        'name',
        'category',
        'serial_number',
        'handover_date',
        'returned_date',
        'handover_condition',
        'return_condition',
        'bast_number',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'handover_date' => 'date',
            'returned_date' => 'date',
            'handover_condition' => AssetCondition::class,
            'return_condition' => AssetCondition::class,
            'status' => AssetStatus::class,
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

