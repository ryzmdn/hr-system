<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ClearanceDepartment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExitClearanceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'offboarding_request_id',
        'department',
        'item_name',
        'is_cleared',
        'cleared_by_user_id',
        'cleared_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'department' => ClearanceDepartment::class,
            'is_cleared' => 'boolean',
            'cleared_at' => 'datetime',
        ];
    }

    public function offboardingRequest(): BelongsTo
    {
        return $this->belongsTo(OffboardingRequest::class);
    }

    public function clearedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cleared_by_user_id');
    }
}

