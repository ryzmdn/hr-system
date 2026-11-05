<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\CareerChangeType;
use App\Enums\EmployeeStatus;
use App\Enums\EmploymentStatus;
use App\Enums\TaxPtkpStatus;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\JobPosition;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $jktBranch = Branch::where('code', 'JKT01')->firstOrFail();
        $sbyBranch = Branch::where('code', 'SBY01')->firstOrFail();
        $dpsBranch = Branch::where('code', 'DPS01')->firstOrFail();

        $bodDept = Department::where('code', 'BOD')->firstOrFail();
        $hrDept = Department::where('code', 'HRD')->firstOrFail();
        $techDept = Department::where('code', 'TECH')->firstOrFail();
        $finDept = Department::where('code', 'FIN')->firstOrFail();
        $opsDept = Department::where('code', 'OPS')->firstOrFail();

        $posCeo = JobPosition::where('code', 'POS-CEO')->firstOrFail();
        $posHodHr = JobPosition::where('code', 'POS-HOD-HR')->firstOrFail();
        $posHrSpec = JobPosition::where('code', 'POS-HR-SPEC')->firstOrFail();
        $posEmTech = JobPosition::where('code', 'POS-EM-TECH')->firstOrFail();
        $posLeadBe = JobPosition::where('code', 'POS-LEAD-BE')->firstOrFail();
        $posFeDev = JobPosition::where('code', 'POS-FE-DEV')->firstOrFail();
        $posMgrFin = JobPosition::where('code', 'POS-MGR-FIN')->firstOrFail();
        $posAccSr = JobPosition::where('code', 'POS-ACC-SR')->firstOrFail();
        $posOpsOff = JobPosition::where('code', 'POS-OPS-OFF')->firstOrFail();

        $users = User::all()->keyBy('email');

        $empCeo = Employee::firstOrCreate(
            ['nik' => 'EMP202001001'],
            [
                'user_id' => null,
                'name' => 'Michael Chandra, MBA',
                'email' => 'michael.chandra@enterprise.co.id',
                'phone_number' => '08119876001',
                'id_card_number' => '3171012301750001',
                'tax_number' => '01.234.567.8-054.001',
                'bank_name' => 'BCA',
                'bank_account_number' => '5420199001',
                'bank_account_holder' => 'Michael Chandra',
                'gender' => 'MALE',
                'birth_place' => 'Jakarta',
                'birth_date' => '1975-01-23',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K2,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2020-01-02',
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $bodDept->id,
                'current_position_id' => $posCeo->id,
                'current_manager_id' => null,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empHrHod = Employee::firstOrCreate(
            ['nik' => 'EMP202102002'],
            [
                'user_id' => $users['hr.director@enterprise.co.id']->id ?? null,
                'name' => 'Ratna Sari Dewi, S.Psi',
                'email' => 'hr.director@enterprise.co.id',
                'phone_number' => '08119876002',
                'id_card_number' => '3171021405820002',
                'tax_number' => '01.234.567.8-054.002',
                'bank_name' => 'MANDIRI',
                'bank_account_number' => '1230009870002',
                'bank_account_holder' => 'Ratna Sari Dewi',
                'gender' => 'FEMALE',
                'birth_place' => 'Bandung',
                'birth_date' => '1982-05-14',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K1,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2021-02-15',
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $hrDept->id,
                'current_position_id' => $posHodHr->id,
                'current_manager_id' => $empCeo->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empFinMgr = Employee::firstOrCreate(
            ['nik' => 'EMP202103003'],
            [
                'user_id' => $users['finance.manager@enterprise.co.id']->id ?? null,
                'name' => 'Hendra Gunawan, SE, Ak',
                'email' => 'finance.manager@enterprise.co.id',
                'phone_number' => '08119876003',
                'id_card_number' => '3171032808800003',
                'tax_number' => '01.234.567.8-054.003',
                'bank_name' => 'BCA',
                'bank_account_number' => '5420199003',
                'bank_account_holder' => 'Hendra Gunawan',
                'gender' => 'MALE',
                'birth_place' => 'Surabaya',
                'birth_date' => '1980-08-28',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K3,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2021-03-01',
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $finDept->id,
                'current_position_id' => $posMgrFin->id,
                'current_manager_id' => $empCeo->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empTechMgr = Employee::firstOrCreate(
            ['nik' => 'EMP202201004'],
            [
                'user_id' => $users['tech.lead@enterprise.co.id']->id ?? null,
                'name' => 'Dian Pratama, S.Kom, M.T',
                'email' => 'tech.lead@enterprise.co.id',
                'phone_number' => '08119876004',
                'id_card_number' => '3171041111860004',
                'tax_number' => '01.234.567.8-054.004',
                'bank_name' => 'BCA',
                'bank_account_number' => '5420199004',
                'bank_account_holder' => 'Dian Pratama',
                'gender' => 'MALE',
                'birth_place' => 'Yogyakarta',
                'birth_date' => '1986-11-11',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K2,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2022-01-10',
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $techDept->id,
                'current_position_id' => $posEmTech->id,
                'current_manager_id' => $empCeo->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empLeadBe = Employee::firstOrCreate(
            ['nik' => 'EMP202302005'],
            [
                'user_id' => $users['budi.santoso@enterprise.co.id']->id ?? null,
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@enterprise.co.id',
                'phone_number' => '081234567890',
                'id_card_number' => '3201051506920005',
                'tax_number' => '01.234.567.8-054.005',
                'bank_name' => 'BCA',
                'bank_account_number' => '5420199005',
                'bank_account_holder' => 'Budi Santoso',
                'gender' => 'MALE',
                'birth_place' => 'Solo',
                'birth_date' => '1992-06-15',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K1,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2023-02-01',
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $techDept->id,
                'current_position_id' => $posLeadBe->id,
                'current_manager_id' => $empTechMgr->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empFeDev = Employee::firstOrCreate(
            ['nik' => 'EMP202403006'],
            [
                'user_id' => $users['siti.aminah@enterprise.co.id']->id ?? null,
                'name' => 'Siti Aminah',
                'email' => 'siti.aminah@enterprise.co.id',
                'phone_number' => '081298765432',
                'id_card_number' => '3201062009950006',
                'tax_number' => '01.234.567.8-054.006',
                'bank_name' => 'MANDIRI',
                'bank_account_number' => '1230009870006',
                'bank_account_holder' => 'Siti Aminah',
                'gender' => 'FEMALE',
                'birth_place' => 'Bogor',
                'birth_date' => '1995-09-20',
                'marital_status' => 'SINGLE',
                'tax_ptkp_status' => TaxPtkpStatus::Tk0,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2024-03-01',
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $techDept->id,
                'current_position_id' => $posFeDev->id,
                'current_manager_id' => $empTechMgr->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empHrSpec = Employee::firstOrCreate(
            ['nik' => 'EMP202404007'],
            [
                'user_id' => null,
                'name' => 'Agus Setiawan',
                'email' => 'agus.setiawan@enterprise.co.id',
                'phone_number' => '081288880007',
                'id_card_number' => '3171071204940007',
                'tax_number' => '01.234.567.8-054.007',
                'bank_name' => 'BNI',
                'bank_account_number' => '0881920007',
                'bank_account_holder' => 'Agus Setiawan',
                'gender' => 'MALE',
                'birth_place' => 'Semarang',
                'birth_date' => '1994-04-12',
                'marital_status' => 'SINGLE',
                'tax_ptkp_status' => TaxPtkpStatus::Tk0,
                'employment_status' => EmploymentStatus::Pkwt,
                'join_date' => '2024-04-01',
                'contract_end_date' => Carbon::now()->addMonths(6)->toDateString(),
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $hrDept->id,
                'current_position_id' => $posHrSpec->id,
                'current_manager_id' => $empHrHod->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empAccSr = Employee::firstOrCreate(
            ['nik' => 'EMP202305008'],
            [
                'user_id' => null,
                'name' => 'Rina Wijaya, SE',
                'email' => 'rina.wijaya@enterprise.co.id',
                'phone_number' => '081277770008',
                'id_card_number' => '3171082507910008',
                'tax_number' => '01.234.567.8-054.008',
                'bank_name' => 'BCA',
                'bank_account_number' => '5420199008',
                'bank_account_holder' => 'Rina Wijaya',
                'gender' => 'FEMALE',
                'birth_place' => 'Malang',
                'birth_date' => '1991-07-25',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K0,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2023-05-15',
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $finDept->id,
                'current_position_id' => $posAccSr->id,
                'current_manager_id' => $empFinMgr->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empOpsSby = Employee::firstOrCreate(
            ['nik' => 'EMP202406009'],
            [
                'user_id' => null,
                'name' => 'Denny Kurniawan',
                'email' => 'denny.k@enterprise.co.id',
                'phone_number' => '081266660009',
                'id_card_number' => '3578091802930009',
                'tax_number' => '01.234.567.8-054.009',
                'bank_name' => 'BRI',
                'bank_account_number' => '00192837465009',
                'bank_account_holder' => 'Denny Kurniawan',
                'gender' => 'MALE',
                'birth_place' => 'Surabaya',
                'birth_date' => '1993-02-18',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K1,
                'employment_status' => EmploymentStatus::Pkwt,
                'join_date' => '2024-06-01',
                'contract_end_date' => Carbon::now()->addMonths(8)->toDateString(),
                'current_branch_id' => $sbyBranch->id,
                'current_department_id' => $opsDept->id,
                'current_position_id' => $posOpsOff->id,
                'current_manager_id' => $empCeo->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empOpsDps = Employee::firstOrCreate(
            ['nik' => 'EMP202409010'],
            [
                'user_id' => null,
                'name' => 'Maya Anggraini',
                'email' => 'maya.a@enterprise.co.id',
                'phone_number' => '081255550010',
                'id_card_number' => '5171100510970010',
                'tax_number' => '01.234.567.8-054.010',
                'bank_name' => 'BCA',
                'bank_account_number' => '5420199010',
                'bank_account_holder' => 'Maya Anggraini',
                'gender' => 'FEMALE',
                'birth_place' => 'Denpasar',
                'birth_date' => '1997-10-05',
                'marital_status' => 'SINGLE',
                'tax_ptkp_status' => TaxPtkpStatus::Tk0,
                'employment_status' => EmploymentStatus::Probation,
                'join_date' => '2024-09-01',
                'probation_end_date' => Carbon::now()->addMonths(1)->toDateString(),
                'current_branch_id' => $dpsBranch->id,
                'current_department_id' => $opsDept->id,
                'current_position_id' => $posOpsOff->id,
                'current_manager_id' => $empCeo->id,
                'status' => EmployeeStatus::Active,
            ]
        );

        $empResigned = Employee::firstOrCreate(
            ['nik' => 'EMP202208011'],
            [
                'user_id' => null,
                'name' => 'Eko Prasetyo',
                'email' => 'eko.prasetyo@enterprise.co.id',
                'phone_number' => '081244440011',
                'id_card_number' => '3201111903900011',
                'tax_number' => '01.234.567.8-054.011',
                'bank_name' => 'BCA',
                'bank_account_number' => '5420199011',
                'bank_account_holder' => 'Eko Prasetyo',
                'gender' => 'MALE',
                'birth_place' => 'Cirebon',
                'birth_date' => '1990-03-19',
                'marital_status' => 'MARRIED',
                'tax_ptkp_status' => TaxPtkpStatus::K1,
                'employment_status' => EmploymentStatus::Pkwtt,
                'join_date' => '2022-08-01',
                'resign_date' => Carbon::now()->subMonths(2)->toDateString(),
                'current_branch_id' => $jktBranch->id,
                'current_department_id' => $techDept->id,
                'current_position_id' => $posLeadBe->id,
                'current_manager_id' => $empTechMgr->id,
                'status' => EmployeeStatus::Resigned,
            ]
        );

        $employeesWithSalaries = [
            [$empCeo, 65000000.0],
            [$empHrHod, 35000000.0],
            [$empFinMgr, 26000000.0],
            [$empTechMgr, 27000000.0],
            [$empLeadBe, 18500000.0],
            [$empFeDev, 11500000.0],
            [$empHrSpec, 10500000.0],
            [$empAccSr, 12000000.0],
            [$empOpsSby, 8500000.0],
            [$empOpsDps, 8000000.0],
            [$empResigned, 17500000.0],
        ];

        foreach ($employeesWithSalaries as [$emp, $salary]) {
            EmployeeHistory::firstOrCreate(
                [
                    'employee_id' => $emp->id,
                    'change_type' => CareerChangeType::Hire,
                ],
                [
                    'branch_id' => $emp->current_branch_id,
                    'department_id' => $emp->current_department_id,
                    'position_id' => $emp->current_position_id,
                    'base_salary' => $salary,
                    'effective_start_date' => $emp->join_date,
                    'reason' => 'Perekrutan awal karyawan tetap/kontrak resmi',
                ]
            );
        }
    }
}
