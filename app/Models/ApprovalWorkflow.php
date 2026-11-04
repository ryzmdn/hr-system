<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ApprovalModule;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'module',
        'name',
        'description',
        'is_active',
        'condition_rules',
    ];

    protected function casts(): array
    {
        return [
            'module' => ApprovalModule::class,
            'is_active' => 'boolean',
            'condition_rules' => 'array',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalStep::class)->orderBy('step_order');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(ApprovalTransaction::class, 'workflow_id');
    }
}

