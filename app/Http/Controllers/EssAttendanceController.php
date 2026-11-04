<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\AttendanceType;
use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\EmployeeRoster;
use App\Models\ShiftSwapRequest;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EssAttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $employee = $user->employee;

        if (! $employee) {
            abort(403, 'Akun pengguna ini belum tertaut dengan data karyawan aktif.');
        }

        $employee->load('branch');
        $today = Carbon::today()->toDateString();

        $roster = EmployeeRoster::with('shift')
            ->where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        $summary = AttendanceSummary::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        $recentLogs = AttendanceLog::where('employee_id', $employee->id)
            ->latest('recorded_at')
            ->take(10)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'type' => $log->type->value,
                'type_label' => $log->type->label(),
                'recorded_at' => $log->recorded_at->format('d M Y, H:i:s'),
                'is_within_geofence' => $log->is_within_geofence,
                'distance_meters' => $log->distance_to_branch_meters,
                'verification_status' => $log->verification_status->value,
            ]);

        return Inertia::render('ess/attendance', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'nik' => $employee->nik,
                'branch' => [
                    'name' => $employee->branch->name,
                    'latitude' => $employee->branch->latitude,
                    'longitude' => $employee->branch->longitude,
                    'radius_meters' => $employee->branch->radius_meters,
                    'timezone' => $employee->branch->timezone->value,
                ],
            ],
            'todayRoster' => $roster ? [
                'shift_name' => $roster->shift?->name ?? 'Default',
                'start_time' => $roster->shift?->start_time ?? '08:00',
                'end_time' => $roster->shift?->end_time ?? '17:00',
                'is_off_day' => $roster->is_off_day,
            ] : null,
            'summary' => $summary ? [
                'clock_in_at' => $summary->clock_in_at?->format('H:i:s'),
                'clock_out_at' => $summary->clock_out_at?->format('H:i:s'),
                'late_minutes' => $summary->late_minutes,
                'status' => $summary->status->value,
                'status_label' => $summary->status->label(),
            ] : null,
            'recentLogs' => $recentLogs,
        ]);
    }

    public function clockIn(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'selfie' => ['nullable', 'string'],
            'device_info' => ['nullable', 'string', 'max:255'],
            'is_mock_location' => ['boolean'],
        ]);

        $employee = $request->user()->employee;
        if (! $employee) {
            abort(403);
        }

        $log = $this->attendanceService->recordAttendance(
            $employee,
            AttendanceType::ClockIn,
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            $validated['selfie'] ?? null,
            $validated['device_info'] ?? null,
            (bool) ($validated['is_mock_location'] ?? false),
        );

        if (! $log->is_within_geofence) {
            return back()->with('error', "Peringatan: Absensi tercatat di luar radius kantor ({$log->distance_to_branch_meters} meter). Status ditandai mencurigakan.");
        }

        return back()->with('success', 'Presensi masuk berhasil direkam.');
    }

    public function clockOut(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'selfie' => ['nullable', 'string'],
            'device_info' => ['nullable', 'string', 'max:255'],
            'is_mock_location' => ['boolean'],
        ]);

        $employee = $request->user()->employee;
        if (! $employee) {
            abort(403);
        }

        $log = $this->attendanceService->recordAttendance(
            $employee,
            AttendanceType::ClockOut,
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            $validated['selfie'] ?? null,
            $validated['device_info'] ?? null,
            (bool) ($validated['is_mock_location'] ?? false),
        );

        if (! $log->is_within_geofence) {
            return back()->with('error', "Peringatan: Absensi pulang tercatat di luar radius kantor ({$log->distance_to_branch_meters} meter).");
        }

        return back()->with('success', 'Presensi pulang berhasil direkam.');
    }
}

