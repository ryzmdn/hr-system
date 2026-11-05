<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AssetCondition;
use App\Enums\AssetStatus;
use App\Enums\ClearanceDepartment;
use App\Enums\EmployeeStatus;
use App\Enums\OffboardingStatus;
use App\Enums\OffboardingType;
use App\Models\Employee;
use App\Models\EmployeeAsset;
use App\Models\EmployeeReimbursementBalance;
use App\Models\ExitClearanceItem;
use App\Models\ExperienceLetter;
use App\Models\OffboardingRequest;
use App\Models\ReimbursementRequest;
use App\Models\ReimbursementType;
use App\Models\SeveranceSettlement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CompensationAndOffboardingSeeder extends Seeder
{
    public function run(): void
    {
        $medOp = ReimbursementType::firstOrCreate(
            ['code' => 'MED_OP'],
            [
                'name' => 'Klaim Medis Rawat Jalan (Outpatient)',
                'annual_limit' => 6000000.0,
                'requires_receipt' => true,
                'is_active' => true,
            ]
        );

        $medOpt = ReimbursementType::firstOrCreate(
            ['code' => 'MED_OPT'],
            [
                'name' => 'Klaim Kacamata & Lensa Korektif',
                'annual_limit' => 1500000.0,
                'requires_receipt' => true,
                'is_active' => true,
            ]
        );

        $trvAir = ReimbursementType::firstOrCreate(
            ['code' => 'TRV_AIR'],
            [
                'name' => 'Transportasi & Tiket Perjalanan Dinas (SPPD)',
                'annual_limit' => 20000000.0,
                'requires_receipt' => true,
                'is_active' => true,
            ]
        );

        $trvHot = ReimbursementType::firstOrCreate(
            ['code' => 'TRV_HOT'],
            [
                'name' => 'Akomodasi Hotel & Penginapan SPPD',
                'annual_limit' => 12000000.0,
                'requires_receipt' => true,
                'is_active' => true,
            ]
        );

        $currentYear = Carbon::now()->year;
        $activeEmployees = Employee::where('status', EmployeeStatus::Active)->get();

        foreach ($activeEmployees as $emp) {
            EmployeeReimbursementBalance::firstOrCreate(
                [
                    'employee_id' => $emp->id,
                    'reimbursement_type_id' => $medOp->id,
                    'year' => $currentYear,
                ],
                [
                    'allocated_amount' => 6000000.0,
                    'used_amount' => 850000.0,
                    'remaining_amount' => 5150000.0,
                ]
            );

            EmployeeReimbursementBalance::firstOrCreate(
                [
                    'employee_id' => $emp->id,
                    'reimbursement_type_id' => $medOpt->id,
                    'year' => $currentYear,
                ],
                [
                    'allocated_amount' => 1500000.0,
                    'used_amount' => 0.0,
                    'remaining_amount' => 1500000.0,
                ]
            );
        }

        $budi = Employee::where('nik', 'EMP202302005')->first();
        $siti = Employee::where('nik', 'EMP202403006')->first();
        $denny = Employee::where('nik', 'EMP202406009')->first();
        $eko = Employee::where('nik', 'EMP202208011')->first();
        $financeUser = User::where('email', 'finance.manager@enterprise.co.id')->first();
        $hrUser = User::where('email', 'hr.director@enterprise.co.id')->first();

        if ($budi) {
            ReimbursementRequest::firstOrCreate(
                ['claim_number' => 'CLM-2026-0001'],
                [
                    'employee_id' => $budi->id,
                    'reimbursement_type_id' => $medOp->id,
                    'receipt_date' => Carbon::now()->subDays(20)->toDateString(),
                    'amount' => 850000.0,
                    'approved_amount' => 850000.0,
                    'description' => 'Biaya pemeriksaan dokter spesialis anak dan obat resep',
                    'status' => 'PAID',
                    'approved_by_user_id' => $financeUser?->id,
                    'paid_at' => Carbon::now()->subDays(18)->toDateTimeString(),
                ]
            );

            EmployeeAsset::firstOrCreate(
                ['asset_tag' => 'AST-NB-001'],
                [
                    'employee_id' => $budi->id,
                    'name' => 'Apple MacBook Pro 14" M3 Pro 18GB/512GB Space Black',
                    'category' => 'LAPTOP',
                    'serial_number' => 'C02G90XXMD6M',
                    'handover_date' => '2023-02-05',
                    'handover_condition' => AssetCondition::Good->value,
                    'bast_number' => 'BAST-2023-001',
                    'status' => AssetStatus::Assigned->value,
                    'notes' => 'Laptop kerja operasional software engineering lead',
                ]
            );

            EmployeeAsset::firstOrCreate(
                ['asset_tag' => 'AST-MN-001'],
                [
                    'employee_id' => $budi->id,
                    'name' => 'Dell UltraSharp 27" 4K USB-C Hub Monitor (U2723QE)',
                    'category' => 'MONITOR',
                    'serial_number' => 'CN-0D34-74261',
                    'handover_date' => '2023-02-05',
                    'handover_condition' => AssetCondition::Good->value,
                    'bast_number' => 'BAST-2023-002',
                    'status' => AssetStatus::Assigned->value,
                ]
            );
        }

        if ($siti) {
            EmployeeAsset::firstOrCreate(
                ['asset_tag' => 'AST-NB-002'],
                [
                    'employee_id' => $siti->id,
                    'name' => 'Dell XPS 15 9530 Core i7-13700H 32GB/1TB RTX 4060',
                    'category' => 'LAPTOP',
                    'serial_number' => 'DL99281X01',
                    'handover_date' => '2024-03-05',
                    'handover_condition' => AssetCondition::Good->value,
                    'bast_number' => 'BAST-2024-015',
                    'status' => AssetStatus::Assigned->value,
                ]
            );
        }

        if ($denny) {
            EmployeeAsset::firstOrCreate(
                ['asset_tag' => 'AST-VH-001'],
                [
                    'employee_id' => $denny->id,
                    'name' => 'Toyota Avanza Veloz 1.5 Q CVT Putih Mutiara',
                    'category' => 'VEHICLE',
                    'serial_number' => 'MHFA1BA31P002911',
                    'handover_date' => '2024-06-10',
                    'handover_condition' => AssetCondition::Good->value,
                    'bast_number' => 'BAST-2024-088',
                    'status' => AssetStatus::Assigned->value,
                    'notes' => 'Mobil dinas operasional cabang Surabaya nopol L 1234 ABC',
                ]
            );
        }

        if ($eko) {
            $offboarding = OffboardingRequest::firstOrCreate(
                ['employee_id' => $eko->id],
                [
                    'type' => OffboardingType::Resignation->value,
                    'reason' => 'Menerima kesempatan karir baru yang lebih dekat dengan domisili keluarga.',
                    'notice_date' => Carbon::now()->subMonths(3)->toDateString(),
                    'effective_date' => Carbon::now()->subMonths(2)->toDateString(),
                    'status' => OffboardingStatus::Completed->value,
                    'approved_by_user_id' => $hrUser?->id,
                ]
            );

            $departments = [
                ClearanceDepartment::It->value => 'Pencabutan akses VPN, email korporat, dan repositori GitHub',
                ClearanceDepartment::Hr->value => 'Pengembalian ID Card karyawan dan penonaktifan kartu BPJS',
                ClearanceDepartment::Finance->value => 'Rekonsiliasi akhir kasbon dan nihil tunggakan pinjaman',
                ClearanceDepartment::Supervisor->value => 'Serah terima dokumentasi sistem dan handover proyek berjalan',
            ];

            foreach ($departments as $dept => $itemName) {
                ExitClearanceItem::firstOrCreate(
                    [
                        'offboarding_request_id' => $offboarding->id,
                        'department' => $dept,
                    ],
                    [
                        'item_name' => $itemName,
                        'is_cleared' => true,
                        'cleared_by_user_id' => $hrUser?->id,
                        'cleared_at' => Carbon::now()->subMonths(2)->toDateTimeString(),
                        'notes' => 'Lengkap dan terverifikasi',
                    ]
                );
            }

            SeveranceSettlement::firstOrCreate(
                ['offboarding_request_id' => $offboarding->id],
                [
                    'base_salary' => 17500000.0,
                    'service_years' => 2.0,
                    'service_months' => 24,
                    'up_multiplier' => 0.0,
                    'up_amount' => 0.0,
                    'upmk_multiplier' => 0.0,
                    'upmk_amount' => 0.0,
                    'uph_amount' => 2500000.0,
                    'pkwt_compensation_amount' => 0.0,
                    'total_gross_severance' => 2500000.0,
                    'tax_pph21_severance' => 0.0,
                    'net_severance' => 2500000.0,
                    'status' => 'PAID',
                    'paid_at' => Carbon::now()->subMonths(2)->toDateTimeString(),
                ]
            );

            ExperienceLetter::firstOrCreate(
                ['offboarding_request_id' => $offboarding->id],
                [
                    'employee_id' => $eko->id,
                    'letter_number' => 'SKK/HRD/2026/089',
                    'issued_date' => Carbon::now()->subMonths(2)->toDateString(),
                    'start_date' => '2022-08-01',
                    'end_date' => Carbon::now()->subMonths(2)->toDateString(),
                    'last_position' => 'Lead Backend Engineer',
                    'last_department' => 'Technology & Product Engineering',
                    'verification_token' => Str::random(32),
                    'is_active' => true,
                ]
            );
        }
    }
}
