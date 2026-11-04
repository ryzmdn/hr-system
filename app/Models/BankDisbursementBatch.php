<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BankFormat;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankDisbursementBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_run_id',
        'bank_name',
        'batch_reference',
        'total_records',
        'total_amount',
        'file_path',
        'exported_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'bank_name' => BankFormat::class,
            'total_records' => 'integer',
            'total_amount' => 'float',
        ];
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function exportedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exported_by_user_id');
    }
}

