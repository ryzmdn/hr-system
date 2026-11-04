<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\AttendanceStatus;
use App\Enums\AttendanceType;
use App\Enums\VerificationStatus;
use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\Branch;
use App\Models\Employee;
use App\Models\EmployeeRoster;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class AttendanceService
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function recordAttendance(
        Employee $employee,
        AttendanceType $type,
        float $latitude,
        float $longitude,
        ?string $selfieBase64 = null,
        ?string $deviceInfo = null,
        bool $isMockLocation = false,
    ): AttendanceLog {
        $branch = $employee->branch;
        if (! $branch) {
            throw new RuntimeException('Karyawan belum ditugaskan ke cabang manapun.');
        }

        $distanceMeters = $this->calculateDistanceMeters(
            $latitude,
            $longitude,
            $branch->latitude,
            $branch->longitude,
        );

        $isWithinGeofence = $distanceMeters <= $branch->radius_meters;

        $verificationStatus = VerificationStatus::Valid;
        if (! $isWithinGeofence || $isMockLocation) {
            $verificationStatus = VerificationStatus::Suspicious;
        }

        $selfiePath = null;
        if ($selfieBase64 && Str::startsWith($selfieBase64, 'data:image')) {
            $selfiePath = $this->storeSelfieImage($selfieBase64, $employee->id, $type->value);
        }

        return DB::transaction(function () use (
            $employee,
            $type,
            $latitude,
            $longitude,
            $distanceMeters,
            $isWithinGeofence,
            $selfiePath,
            $deviceInfo,
            $isMockLocation,
            $verificationStatus,
        ) {
            $now = Carbon::now();
            $today = $now->toDateString();

            $roster = EmployeeRoster::with('shift')
                ->where('employee_id', $employee->id)
                ->where('date', $today)
                ->first();

            $log = AttendanceLog::create([
                'employee_id' => $employee->id,
                'roster_id' => $roster?->id,
                'recorded_at' => $now,
                'type' => $type,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'distance_to_branch_meters' => $distanceMeters,
                'is_within_geofence' => $isWithinGeofence,
                'selfie_path' => $selfiePath,
                'device_info' => $deviceInfo,
                'is_mock_location' => $isMockLocation,
                'verification_status' => $verificationStatus,
            ]);

            $this->updateDailySummary($employee, $today, $type, $now, $roster);

            $this->auditLogService->log("attendance.{$type->value}", $log, null, [
                'employee_id' => $employee->id,
                'type' => $type->value,
                'distance_meters' => $distanceMeters,
                'is_within_geofence' => $isWithinGeofence,
                'verification_status' => $verificationStatus->value,
            ]);

            return $log;
        });
    }

    public function calculateDistanceMeters(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2,
    ): int {
        $earthRadius = 6371000;

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return (int) round($earthRadius * $c);
    }

    protected function storeSelfieImage(string $base64Data, int $employeeId, string $type): string
    {
        $parts = explode(',', $base64Data);
        $imageData = base64_decode(end($parts));

        $fileName = "selfies/{$employeeId}/" . date('Ymd_His') . "_{$type}.jpg";
        Storage::disk('public')->put($fileName, $imageData);

        return $fileName;
    }

    public function updateDailySummary(
        Employee $employee,
        string $date,
        AttendanceType $type,
        Carbon $timestamp,
        ?EmployeeRoster $roster,
    ): AttendanceSummary {
        $summary = AttendanceSummary::firstOrNew([
            'employee_id' => $employee->id,
            'date' => $date,
        ]);

        if (! $summary->exists) {
            $summary->roster_id = $roster?->id;
            $summary->status = AttendanceStatus::Absent;
        }

        if ($type === AttendanceType::ClockIn) {
            $summary->clock_in_at = $timestamp;

            if ($roster && $roster->shift) {
                $shiftStart = Carbon::parse("{$date} {$roster->shift->start_time}");
                $graceTime = (clone $shiftStart)->addMinutes($roster->shift->grace_period_minutes);

                if ($timestamp->greaterThan($graceTime)) {
                    $summary->late_minutes = (int) $shiftStart->diffInMinutes($timestamp);
                    $summary->status = AttendanceStatus::Late;
                } else {
                    $summary->late_minutes = 0;
                    $summary->status = AttendanceStatus::Present;
                }
            } else {
                $summary->status = AttendanceStatus::Present;
            }
        } elseif ($type === AttendanceType::ClockOut) {
            $summary->clock_out_at = $timestamp;

            if ($summary->clock_in_at) {
                $clockIn = Carbon::parse($summary->clock_in_at);
                $summary->work_duration_minutes = (int) $clockIn->diffInMinutes($timestamp);
            }

            if ($roster && $roster->shift) {
                $shiftEnd = Carbon::parse("{$date} {$roster->shift->end_time}");
                if ($roster->shift->is_cross_day) {
                    $shiftEnd->addDay();
                }

                if ($timestamp->lessThan($shiftEnd)) {
                    $summary->early_leave_minutes = (int) $timestamp->diffInMinutes($shiftEnd);
                } else {
                    $summary->early_leave_minutes = 0;
                }
            }
        }

        $summary->save();

        return $summary;
    }
}

