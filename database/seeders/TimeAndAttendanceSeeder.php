<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Enums\EmployeeStatus;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use App\Models\EmployeeRoster;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\ShiftTemplate;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TimeAndAttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $regShift = ShiftTemplate::firstOrCreate(
            ['code' => 'REG01'],
            [
                'name' => 'Regular Office Non-Shift',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'is_cross_day' => false,
                'break_minutes' => 60,
                'grace_period_minutes' => 15,
                'is_active' => true,
            ]
        );

        $shift1 = ShiftTemplate::firstOrCreate(
            ['code' => 'SHF01'],
            [
                'name' => 'Shift 1 - Pagi Operasional',
                'start_time' => '07:00:00',
                'end_time' => '15:00:00',
                'is_cross_day' => false,
                'break_minutes' => 60,
                'grace_period_minutes' => 10,
                'is_active' => true,
            ]
        );

        $shift2 = ShiftTemplate::firstOrCreate(
            ['code' => 'SHF02'],
            [
                'name' => 'Shift 2 - Siang Operasional',
                'start_time' => '15:00:00',
                'end_time' => '23:00:00',
                'is_cross_day' => false,
                'break_minutes' => 60,
                'grace_period_minutes' => 10,
                'is_active' => true,
            ]
        );

        $shift3 = ShiftTemplate::firstOrCreate(
            ['code' => 'SHF03'],
            [
                'name' => 'Shift 3 - Malam (Cross-Day)',
                'start_time' => '23:00:00',
                'end_time' => '07:00:00',
                'is_cross_day' => true,
                'break_minutes' => 60,
                'grace_period_minutes' => 10,
                'is_active' => true,
            ]
        );

        $annualLeave = LeaveType::firstOrCreate(
            ['code' => 'ANNUAL'],
            [
                'name' => 'Cuti Tahunan Berbayar',
                'default_quota' => 12,
                'is_paid' => true,
                'requires_attachment' => false,
                'max_consecutive_days' => 12,
                'is_active' => true,
            ]
        );

        $sickLeave = LeaveType::firstOrCreate(
            ['code' => 'SICK'],
            [
                'name' => 'Izin Sakit dengan Surat Dokter',
                'default_quota' => 14,
                'is_paid' => true,
                'requires_attachment' => true,
                'max_consecutive_days' => 14,
                'is_active' => true,
            ]
        );

        $maternityLeave = LeaveType::firstOrCreate(
            ['code' => 'MATERNITY'],
            [
                'name' => 'Cuti Melahirkan (Hamil)',
                'default_quota' => 90,
                'is_paid' => true,
                'requires_attachment' => true,
                'max_consecutive_days' => 90,
                'is_active' => true,
            ]
        );

        $marriageLeave = LeaveType::firstOrCreate(
            ['code' => 'MARRIAGE'],
            [
                'name' => 'Cuti Menikah',
                'default_quota' => 3,
                'is_paid' => true,
                'requires_attachment' => false,
                'max_consecutive_days' => 3,
                'is_active' => true,
            ]
        );

        $unpaidLeave = LeaveType::firstOrCreate(
            ['code' => 'UNPAID'],
            [
                'name' => 'Izin Tidak Dibayar (Unpaid Leave)',
                'default_quota' => 0,
                'is_paid' => false,
                'requires_attachment' => false,
                'max_consecutive_days' => 30,
                'is_active' => true,
            ]
        );

        $currentYear = Carbon::now()->year;
        $activeEmployees = Employee::where('status', EmployeeStatus::Active)->get();

        foreach ($activeEmployees as $emp) {
            LeaveBalance::firstOrCreate(
                [
                    'employee_id' => $emp->id,
                    'leave_type_id' => $annualLeave->id,
                    'year' => $currentYear,
                ],
                [
                    'allocated_days' => 12,
                    'used_days' => 2,
                    'carry_over_days' => 0,
                    'remaining_days' => 10,
                ]
            );

            LeaveBalance::firstOrCreate(
                [
                    'employee_id' => $emp->id,
                    'leave_type_id' => $sickLeave->id,
                    'year' => $currentYear,
                ],
                [
                    'allocated_days' => 14,
                    'used_days' => 1,
                    'carry_over_days' => 0,
                    'remaining_days' => 13,
                ]
            );
        }

        $budi = Employee::where('nik', 'EMP202302005')->first();
        $siti = Employee::where('nik', 'EMP202403006')->first();
        $denny = Employee::where('nik', 'EMP202406009')->first();

        $today = Carbon::today();
        for ($i = -14; $i <= 7; $i++) {
            $date = $today->copy()->addDays($i);
            $isWeekend = $date->isWeekend();

            if ($budi) {
                $exists = EmployeeRoster::where('employee_id', $budi->id)->whereDate('date', $date)->exists();
                if (! $exists) {
                    EmployeeRoster::create([
                        'employee_id' => $budi->id,
                        'date' => $date->toDateString(),
                        'shift_template_id' => $isWeekend ? null : $regShift->id,
                        'is_off_day' => $isWeekend,
                        'notes' => $isWeekend ? 'Libur Akhir Pekan' : 'Jadwal Normal SCBD',
                    ]);
                }
            }

            if ($siti) {
                $exists = EmployeeRoster::where('employee_id', $siti->id)->whereDate('date', $date)->exists();
                if (! $exists) {
                    EmployeeRoster::create([
                        'employee_id' => $siti->id,
                        'date' => $date->toDateString(),
                        'shift_template_id' => $isWeekend ? null : $regShift->id,
                        'is_off_day' => $isWeekend,
                        'notes' => $isWeekend ? 'Libur Akhir Pekan' : 'Jadwal Normal SCBD',
                    ]);
                }
            }

            if ($denny) {
                $exists = EmployeeRoster::where('employee_id', $denny->id)->whereDate('date', $date)->exists();
                if (! $exists) {
                    $shiftToUse = ($i % 3 === 0) ? $shift1 : (($i % 3 === 1) ? $shift2 : $shift3);
                    EmployeeRoster::create([
                        'employee_id' => $denny->id,
                        'date' => $date->toDateString(),
                        'shift_template_id' => $isWeekend ? null : $shiftToUse->id,
                        'is_off_day' => $isWeekend,
                        'notes' => $isWeekend ? 'Libur Roster' : 'Shift Operasional Surabaya',
                    ]);
                }
            }
        }

        for ($d = 1; $d <= 10; $d++) {
            $historyDate = $today->copy()->subDays($d);
            if ($historyDate->isWeekend()) {
                continue;
            }

            if ($budi) {
                $exists = AttendanceSummary::where('employee_id', $budi->id)->whereDate('date', $historyDate)->exists();
                if (! $exists) {
                    AttendanceSummary::create([
                        'employee_id' => $budi->id,
                        'date' => $historyDate->toDateString(),
                        'clock_in_at' => $historyDate->copy()->setTime(7, 55, 0),
                        'clock_out_at' => $historyDate->copy()->setTime(17, 10, 0),
                        'late_minutes' => 0,
                        'early_leave_minutes' => 0,
                        'work_duration_minutes' => 540,
                        'status' => AttendanceStatus::Present,
                        'is_overtime' => false,
                    ]);
                }
            }

            if ($siti) {
                $exists = AttendanceSummary::where('employee_id', $siti->id)->whereDate('date', $historyDate)->exists();
                if (! $exists) {
                    $isLate = ($d === 3);
                    AttendanceSummary::create([
                        'employee_id' => $siti->id,
                        'date' => $historyDate->toDateString(),
                        'clock_in_at' => $isLate ? $historyDate->copy()->setTime(8, 25, 0) : $historyDate->copy()->setTime(7, 58, 0),
                        'clock_out_at' => $historyDate->copy()->setTime(17, 5, 0),
                        'late_minutes' => $isLate ? 25 : 0,
                        'early_leave_minutes' => 0,
                        'work_duration_minutes' => $isLate ? 520 : 540,
                        'status' => $isLate ? AttendanceStatus::Late : AttendanceStatus::Present,
                        'is_overtime' => false,
                    ]);
                }
            }
        }

        if ($denny) {
            $date1 = $today->copy()->subDays(15);
            if (! AttendanceSummary::where('employee_id', $denny->id)->whereDate('date', $date1)->exists()) {
                AttendanceSummary::create([
                    'employee_id' => $denny->id,
                    'date' => $date1->toDateString(),
                    'clock_in_at' => null,
                    'clock_out_at' => null,
                    'late_minutes' => 0,
                    'early_leave_minutes' => 0,
                    'work_duration_minutes' => 0,
                    'status' => AttendanceStatus::Sick,
                    'is_overtime' => false,
                    'notes' => 'Izin sakit flu musiman',
                ]);
            }

            $date2 = $today->copy()->subDays(25);
            if (! AttendanceSummary::where('employee_id', $denny->id)->whereDate('date', $date2)->exists()) {
                AttendanceSummary::create([
                    'employee_id' => $denny->id,
                    'date' => $date2->toDateString(),
                    'clock_in_at' => null,
                    'clock_out_at' => null,
                    'late_minutes' => 0,
                    'early_leave_minutes' => 0,
                    'work_duration_minutes' => 0,
                    'status' => AttendanceStatus::Sick,
                    'is_overtime' => false,
                    'notes' => 'Izin sakit lambung',
                ]);
            }
        }
    }
}
