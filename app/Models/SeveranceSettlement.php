<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeveranceSettlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'offboarding_request_id',
        'base_salary',
        'service_years',
        'service_months',
        'up_multiplier',
        'up_amount',
        'upmk_multiplier',
        'upmk_amount',
        'uph_amount',
        'pkwt_compensation_amount',
        'total_gross_severance',
        'tax_pph21_severance',
        'net_severance',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'base_salary' => 'float',
            'service_years' => 'float',
            'service_months' => 'integer',
            'up_multiplier' => 'float',
            'up_amount' => 'float',
            'upmk_multiplier' => 'float',
            'upmk_amount' => 'float',
            'uph_amount' => 'float',
            'pkwt_compensation_amount' => 'float',
            'total_gross_severance' => 'float',
            'tax_pph21_severance' => 'float',
            'net_severance' => 'float',
            'paid_at' => 'datetime',
        ];
    }

    public function offboardingRequest(): BelongsTo
    {
        return $this->belongsTo(OffboardingRequest::class);
    }
}

