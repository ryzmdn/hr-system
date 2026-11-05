<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\JobGrade;
use App\Models\JobPosition;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrCreate(
            ['code' => 'NMC01'],
            [
                'name' => 'PT Nusantara Mega Corpora',
                'tax_id' => '01.234.567.8-054.000',
                'bpjs_ketenagakerjaan_no' => '190000001234',
                'bpjs_kesehatan_no' => '0001234567890',
                'address' => 'Gedung Menara Nusantara Lt. 28-30, Jl. Jend. Sudirman Kav. 52-53, SCBD, Jakarta Selatan',
                'phone' => '021-5150099',
                'email' => 'corporate@nusantara-corpora.co.id',
                'is_active' => true,
            ]
        );

        $jktBranch = Branch::firstOrCreate(
            ['code' => 'JKT01'],
            [
                'company_id' => $company->id,
                'name' => 'Kantor Pusat Jakarta (SCBD)',
                'latitude' => -6.2255,
                'longitude' => 106.8095,
                'radius_meters' => 150,
                'timezone' => 'Asia/Jakarta',
                'jkk_risk_grade' => '1',
                'address' => 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
                'is_active' => true,
            ]
        );

        $sbyBranch = Branch::firstOrCreate(
            ['code' => 'SBY01'],
            [
                'company_id' => $company->id,
                'name' => 'Kantor Cabang Surabaya',
                'latitude' => -7.2575,
                'longitude' => 112.7521,
                'radius_meters' => 200,
                'timezone' => 'Asia/Jakarta',
                'jkk_risk_grade' => '2',
                'address' => 'Jl. Basuki Rahmat No. 122, Surabaya',
                'is_active' => true,
            ]
        );

        $dpsBranch = Branch::firstOrCreate(
            ['code' => 'DPS01'],
            [
                'company_id' => $company->id,
                'name' => 'Kantor Operasional Bali & Nusa Tenggara',
                'latitude' => -8.6705,
                'longitude' => 115.2126,
                'radius_meters' => 150,
                'timezone' => 'Asia/Makassar',
                'jkk_risk_grade' => '1',
                'address' => 'Jl. Bypass Ngurah Rai No. 88, Denpasar',
                'is_active' => true,
            ]
        );

        $bodDept = Department::firstOrCreate(
            ['code' => 'BOD'],
            [
                'company_id' => $company->id,
                'name' => 'Board of Directors',
                'is_active' => true,
            ]
        );

        $hrDept = Department::firstOrCreate(
            ['code' => 'HRD'],
            [
                'company_id' => $company->id,
                'name' => 'Human Resources & General Affairs',
                'is_active' => true,
            ]
        );

        $techDept = Department::firstOrCreate(
            ['code' => 'TECH'],
            [
                'company_id' => $company->id,
                'name' => 'Technology & Product Engineering',
                'is_active' => true,
            ]
        );

        $finDept = Department::firstOrCreate(
            ['code' => 'FIN'],
            [
                'company_id' => $company->id,
                'name' => 'Finance, Accounting & Tax',
                'is_active' => true,
            ]
        );

        $opsDept = Department::firstOrCreate(
            ['code' => 'OPS'],
            [
                'company_id' => $company->id,
                'name' => 'Operations & Logistics',
                'is_active' => true,
            ]
        );

        $grade1 = JobGrade::firstOrCreate(
            ['company_id' => $company->id, 'grade_level' => 1],
            ['name' => 'Grade 1 - Executive / C-Level', 'min_salary' => 45000000, 'max_salary' => 95000000]
        );

        $grade2 = JobGrade::firstOrCreate(
            ['company_id' => $company->id, 'grade_level' => 2],
            ['name' => 'Grade 2 - Head of Department / VP', 'min_salary' => 28000000, 'max_salary' => 45000000]
        );

        $grade3 = JobGrade::firstOrCreate(
            ['company_id' => $company->id, 'grade_level' => 3],
            ['name' => 'Grade 3 - Manager', 'min_salary' => 17000000, 'max_salary' => 28000000]
        );

        $grade4 = JobGrade::firstOrCreate(
            ['company_id' => $company->id, 'grade_level' => 4],
            ['name' => 'Grade 4 - Senior Specialist / Lead', 'min_salary' => 11000000, 'max_salary' => 18000000]
        );

        $grade5 = JobGrade::firstOrCreate(
            ['company_id' => $company->id, 'grade_level' => 5],
            ['name' => 'Grade 5 - Specialist / Officer', 'min_salary' => 6000000, 'max_salary' => 12000000]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-CEO'],
            [
                'department_id' => $bodDept->id,
                'job_grade_id' => $grade1->id,
                'name' => 'Chief Executive Officer',
                'description' => 'Memimpin arah strategis dan visi korporasi secara menyeluruh.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-HOD-HR'],
            [
                'department_id' => $hrDept->id,
                'job_grade_id' => $grade2->id,
                'name' => 'Head of Human Resources',
                'description' => 'Mengelola strategi talenta, regulasi kepatuhan tenaga kerja, dan kompensasi.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-HR-SPEC'],
            [
                'department_id' => $hrDept->id,
                'job_grade_id' => $grade4->id,
                'name' => 'HR People Operations Specialist',
                'description' => 'Operasional harian kepegawaian, administrasi kontrak, dan absensi.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-EM-TECH'],
            [
                'department_id' => $techDept->id,
                'job_grade_id' => $grade3->id,
                'name' => 'Engineering Manager',
                'description' => 'Memimpin tim rekayasa perangkat lunak dan arsitektur platform enterprise.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-LEAD-BE'],
            [
                'department_id' => $techDept->id,
                'job_grade_id' => $grade4->id,
                'name' => 'Lead Backend Engineer',
                'description' => 'Merancang arsitektur API berskala tinggi dan microservices terdistribusi.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-FE-DEV'],
            [
                'department_id' => $techDept->id,
                'job_grade_id' => $grade5->id,
                'name' => 'Frontend Engineer',
                'description' => 'Mengembangkan antarmuka pengguna web responsif menggunakan React dan Next.js.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-MGR-FIN'],
            [
                'department_id' => $finDept->id,
                'job_grade_id' => $grade3->id,
                'name' => 'Finance & Tax Manager',
                'description' => 'Memimpin divisi keuangan, kepatuhan perpajakan PPh 21, dan audit payroll.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-ACC-SR'],
            [
                'department_id' => $finDept->id,
                'job_grade_id' => $grade4->id,
                'name' => 'Senior Payroll & Tax Accountant',
                'description' => 'Menghitung dan memproses rekonsiliasi payroll, BPJS, serta potongan pajak.',
                'is_active' => true,
            ]
        );

        JobPosition::firstOrCreate(
            ['code' => 'POS-OPS-OFF'],
            [
                'department_id' => $opsDept->id,
                'job_grade_id' => $grade5->id,
                'name' => 'Operations Field Officer',
                'description' => 'Menjalankan operasional logistik lapangan dan koordinasi cabang.',
                'is_active' => true,
            ]
        );
    }
}

