<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PayrollRun;
use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ExecutiveAnalyticsService
{
    public function getExecutiveMetrics(int $year): array
    {
        $startDate = Carbon::create($year, 1, 1)->startOfDay();
        $endDate = Carbon::create($year, 12, 31)->endOfDay();

        $activeCount = Employee::query()->where('status', EmployeeStatus::Active)->count();
        $resignedCount = Employee::query()
            ->whereIn('status', [EmployeeStatus::Resigned, EmployeeStatus::Terminated])
            ->whereBetween('resign_date', [$startDate, $endDate])
            ->count();

        $averageHeadcount = max(1, ($activeCount + $resignedCount) / 2);
        $turnoverRate = round(($resignedCount / $averageHeadcount) * 100, 2);

        $bradfordScores = $this->calculateTopBradfordScores($year);

        $branchOvertimeCosts = Branch::query()
            ->with(['employees'])
            ->get()
            ->map(function (Branch $branch) use ($startDate, $endDate) {
                $employeeIds = $branch->employees->pluck('id');
                $overtimeHours = (float) OvertimeRequest::query()
                    ->whereIn('employee_id', $employeeIds)
                    ->where('status', 'approved')
                    ->whereBetween('date', [$startDate, $endDate])
                    ->sum('calculated_overtime_hours');

                $overtimeCost = (float) Payslip::query()
                    ->whereIn('employee_id', $employeeIds)
                    ->whereHas('run.period', function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('start_date', [$startDate, $endDate]);
                    })
                    ->sum('overtime_pay');

                return [
                    'branch_id' => $branch->id,
                    'branch_name' => $branch->name,
                    'branch_code' => $branch->code,
                    'total_hours' => $overtimeHours,
                    'total_cost' => $overtimeCost,
                ];
            });

        $pkwttCount = Employee::query()->where('status', EmployeeStatus::Active)->where('employment_status', EmploymentStatus::Pkwtt)->count();
        $pkwtCount = Employee::query()->where('status', EmployeeStatus::Active)->where('employment_status', EmploymentStatus::Pkwt)->count();
        $probationCount = Employee::query()->where('status', EmployeeStatus::Active)->where('employment_status', EmploymentStatus::Probation)->count();

        $maleCount = Employee::query()->where('status', EmployeeStatus::Active)->where('gender', 'MALE')->count();
        $femaleCount = Employee::query()->where('status', EmployeeStatus::Active)->where('gender', 'FEMALE')->count();

        $departmentDistribution = Department::query()
            ->withCount(['employees' => function ($q) {
                $q->where('status', EmployeeStatus::Active);
            }])
            ->get()
            ->map(fn (Department $d) => [
                'department_id' => $d->id,
                'name' => $d->name,
                'code' => $d->code,
                'headcount' => $d->employees_count,
            ]);

        return [
            'year' => $year,
            'headcount' => [
                'total_active' => $activeCount,
                'resigned_this_year' => $resignedCount,
                'turnover_rate' => $turnoverRate,
                'pkwtt' => $pkwttCount,
                'pkwt' => $pkwtCount,
                'probation' => $probationCount,
                'gender_male' => $maleCount,
                'gender_female' => $femaleCount,
            ],
            'overtime_by_branch' => $branchOvertimeCosts,
            'bradford_top_risk' => $bradfordScores,
            'department_distribution' => $departmentDistribution,
        ];
    }

    public function calculateBradfordFactor(int $spells, int $totalDays): array
    {
        $bradfordFactor = ($spells * $spells) * $totalDays;

        $riskLevel = match (true) {
            $bradfordFactor >= 500 => 'High Risk',
            $bradfordFactor >= 200 => 'Medium Risk',
            default => 'Low Risk',
        };

        return [
            'score' => $bradfordFactor,
            'risk_level' => $riskLevel,
        ];
    }

    public function calculateTopBradfordScores(int $year, int $limit = 5): array
    {
        $startDate = Carbon::create($year, 1, 1)->toDateString();
        $endDate = Carbon::create($year, 12, 31)->toDateString();

        $employees = Employee::query()->where('status', EmployeeStatus::Active)->get();
        $results = [];

        foreach ($employees as $employee) {
            $absentRecords = AttendanceSummary::query()
                ->where('employee_id', $employee->id)
                ->whereIn('status', ['ABSENT', 'SICK'])
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date')
                ->get();

            $totalDays = $absentRecords->count();
            if ($totalDays === 0) {
                continue;
            }

            $spells = 0;
            $prevDate = null;

            foreach ($absentRecords as $rec) {
                $currentDate = Carbon::parse($rec->date);
                if ($prevDate === null || $prevDate->diffInDays($currentDate) > 1) {
                    $spells++;
                }
                $prevDate = $currentDate;
            }

            $factor = $this->calculateBradfordFactor($spells, $totalDays);

            $results[] = [
                'employee_id' => $employee->id,
                'name' => $employee->name,
                'nik' => $employee->nik,
                'spells' => $spells,
                'total_days' => $totalDays,
                'bradford_factor' => $factor['score'],
                'risk_level' => $factor['risk_level'],
            ];
        }

        usort($results, fn ($a, $b) => $b['bradford_factor'] <=> $a['bradford_factor']);

        return array_slice($results, 0, $limit);
    }

    public function generateWlkpCsv(): string
    {
        $company = Company::query()->where('is_active', true)->first();
        $employees = Employee::query()
            ->with(['branch', 'department', 'position'])
            ->where('status', EmployeeStatus::Active)
            ->get();

        $rows = [];
        $rows[] = 'LAPORAN WAJIB LAPOR KETENAGAKERJAAN PERUSAHAAN (WLKP) - Undang-Undang No. 7 Tahun 1981';
        $rows[] = 'Nama Perusahaan: ' . ($company?->name ?? 'PT Enterprise');
        $rows[] = 'Alamat: ' . ($company?->address ?? '-');
        $rows[] = 'Tanggal Cetak: ' . Carbon::now()->format('Y-m-d H:i:s');
        $rows[] = '';
        $rows[] = implode(',', [
            'No',
            'NIK',
            'Nama Lengkap',
            'Jenis Kelamin',
            'Status Hubungan Kerja',
            'Cabang / Unit Kerja',
            'Departemen',
            'Jabatan',
            'Tanggal Masuk',
            'Status Kepesertaan BPJS TK',
            'Status Kepesertaan BPJS Kes',
        ]);

        $no = 1;
        foreach ($employees as $emp) {
            $rows[] = implode(',', [
                $no++,
                '"' . $emp->nik . '"',
                '"' . str_replace('"', '""', $emp->name) . '"',
                $emp->gender,
                $emp->employment_status->value,
                '"' . ($emp->branch?->name ?? '-') . '"',
                '"' . ($emp->department?->name ?? '-') . '"',
                '"' . ($emp->position?->name ?? '-') . '"',
                $emp->join_date ? $emp->join_date->format('Y-m-d') : '-',
                'TERDAFTAR',
                'TERDAFTAR',
            ]);
        }

        return implode("\r\n", $rows);
    }
}
