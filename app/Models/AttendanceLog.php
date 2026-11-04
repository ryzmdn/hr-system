<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttendanceType;
use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'roster_id',
        'recorded_at',
        'type',
        'latitude',
        'longitude',
        'distance_to_branch_meters',
        'is_within_geofence',
        'selfie_path',
        'device_info',
        'is_mock_location',
        'verification_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'type' => AttendanceType::class,
            'latitude' => 'float',
            'longitude' => 'float',
            'distance_to_branch_meters' => 'integer',
            'is_within_geofence' => 'boolean',
            'is_mock_location' => 'boolean',
            'verification_status' => VerificationStatus::class,
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function roster(): BelongsTo
    {
        return $this->belongsTo(EmployeeRoster::class, 'roster_id');
    }
}

