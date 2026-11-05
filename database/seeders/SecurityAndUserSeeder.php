<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SecurityAndUserSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['code' => 'org.view', 'name' => 'Melihat Struktur Organisasi & Cabang', 'module' => 'ORGANIZATION'],
            ['code' => 'org.manage', 'name' => 'Mengelola Struktur Organisasi & Cabang', 'module' => 'ORGANIZATION'],
            ['code' => 'employee.view', 'name' => 'Melihat Data Master Karyawan', 'module' => 'EMPLOYEE'],
            ['code' => 'employee.create', 'name' => 'Menambah Karyawan Baru', 'module' => 'EMPLOYEE'],
            ['code' => 'employee.edit', 'name' => 'Mengubah Data Karyawan', 'module' => 'EMPLOYEE'],
            ['code' => 'employee.delete', 'name' => 'Menonaktifkan Karyawan', 'module' => 'EMPLOYEE'],
            ['code' => 'attendance.view', 'name' => 'Melihat Presensi & Kehadiran', 'module' => 'ATTENDANCE'],
            ['code' => 'attendance.clock', 'name' => 'Melakukan Clock-In / Clock-Out', 'module' => 'ATTENDANCE'],
            ['code' => 'attendance.manage', 'name' => 'Mengelola Shift & Roster Presensi', 'module' => 'ATTENDANCE'],
            ['code' => 'attendance.approve', 'name' => 'Menyetujui Koreksi Presensi', 'module' => 'ATTENDANCE'],
            ['code' => 'leave.request', 'name' => 'Mengajukan Cuti & Izin', 'module' => 'LEAVE'],
            ['code' => 'leave.view', 'name' => 'Melihat Pengajuan Cuti', 'module' => 'LEAVE'],
            ['code' => 'leave.approve', 'name' => 'Menyetujui Pengajuan Cuti', 'module' => 'LEAVE'],
            ['code' => 'leave.manage', 'name' => 'Mengelola Kuota & Master Cuti', 'module' => 'LEAVE'],
            ['code' => 'overtime.request', 'name' => 'Mengajukan Surat Perintah Lembur', 'module' => 'OVERTIME'],
            ['code' => 'overtime.view', 'name' => 'Melihat Rekap Lembur', 'module' => 'OVERTIME'],
            ['code' => 'overtime.approve', 'name' => 'Menyetujui Pengajuan Lembur', 'module' => 'OVERTIME'],
            ['code' => 'payroll.view', 'name' => 'Melihat Penggajian & Slip Gaji', 'module' => 'PAYROLL'],
            ['code' => 'payroll.calculate', 'name' => 'Menjalankan Kalkulasi Payroll', 'module' => 'PAYROLL'],
            ['code' => 'payroll.lock', 'name' => 'Mengunci Periode Payroll', 'module' => 'PAYROLL'],
            ['code' => 'payroll.disburse', 'name' => 'Membuat Batch File Bank', 'module' => 'PAYROLL'],
            ['code' => 'loan.request', 'name' => 'Mengajukan Pinjaman / Kasbon', 'module' => 'LOAN'],
            ['code' => 'loan.view', 'name' => 'Melihat Pinjaman Karyawan', 'module' => 'LOAN'],
            ['code' => 'loan.approve', 'name' => 'Menyetujui Pinjaman Karyawan', 'module' => 'LOAN'],
            ['code' => 'reimbursement.request', 'name' => 'Mengajukan Klaim Biaya', 'module' => 'REIMBURSEMENT'],
            ['code' => 'reimbursement.view', 'name' => 'Melihat Klaim Reimbursement', 'module' => 'REIMBURSEMENT'],
            ['code' => 'reimbursement.approve', 'name' => 'Menyetujui Klaim Reimbursement', 'module' => 'REIMBURSEMENT'],
            ['code' => 'asset.view', 'name' => 'Melihat Inventaris Aset Karyawan', 'module' => 'ASSET'],
            ['code' => 'asset.manage', 'name' => 'Mengelola Serah Terima Aset & BAST', 'module' => 'ASSET'],
            ['code' => 'offboarding.manage', 'name' => 'Mengelola Permohonan Resign & Exit', 'module' => 'OFFBOARDING'],
            ['code' => 'offboarding.clearance', 'name' => 'Memproses Checklist Exit Clearance', 'module' => 'OFFBOARDING'],
            ['code' => 'recruitment.view', 'name' => 'Melihat Lowongan & Pelamar ATS', 'module' => 'RECRUITMENT'],
            ['code' => 'recruitment.manage', 'name' => 'Mengelola Lowongan & Pipeline ATS', 'module' => 'RECRUITMENT'],
            ['code' => 'performance.view', 'name' => 'Melihat Penilaian Kinerja KPI', 'module' => 'PERFORMANCE'],
            ['code' => 'performance.evaluate', 'name' => 'Memberi Evaluasi & Skor KPI', 'module' => 'PERFORMANCE'],
            ['code' => 'performance.manage', 'name' => 'Mengelola Periode Kinerja', 'module' => 'PERFORMANCE'],
            ['code' => 'analytics.view', 'name' => 'Melihat Dashboard Eksekutif', 'module' => 'ANALYTICS'],
            ['code' => 'analytics.export', 'name' => 'Mengekspor Laporan WLKP Kemnaker', 'module' => 'ANALYTICS'],
        ];

        $permissionModels = [];
        foreach ($permissions as $p) {
            $permissionModels[$p['code']] = Permission::firstOrCreate(
                ['code' => $p['code']],
                ['name' => $p['name'], 'module' => $p['module']]
            );
        }

        $superAdminRole = Role::firstOrCreate(
            ['code' => 'super_admin'],
            ['name' => 'Super Administrator', 'description' => 'Akses penuh ke seluruh konfigurasi sistem enterprise', 'is_system' => true]
        );

        $hrAdminRole = Role::firstOrCreate(
            ['code' => 'hr_admin'],
            ['name' => 'HR Administrator', 'description' => 'Akses manajemen karyawan, cuti, rekrutmen, dan offboarding', 'is_system' => true]
        );

        $financeAdminRole = Role::firstOrCreate(
            ['code' => 'finance_admin'],
            ['name' => 'Finance & Payroll Administrator', 'description' => 'Akses manajemen payroll, pajak PPh 21, pinjaman, dan reimbursement', 'is_system' => true]
        );

        $deptManagerRole = Role::firstOrCreate(
            ['code' => 'dept_manager'],
            ['name' => 'Department Manager', 'description' => 'Akses persetujuan tim, roster shift, dan evaluasi KPI subordinat', 'is_system' => true]
        );

        $employeeRole = Role::firstOrCreate(
            ['code' => 'employee'],
            ['name' => 'Employee Staff', 'description' => 'Akses mandiri portal ESS (presensi, cuti, lembur, klaim, slip gaji)', 'is_system' => true]
        );

        $allPermissionIds = collect($permissionModels)->pluck('id')->all();
        $superAdminRole->permissions()->sync($allPermissionIds);

        $hrPermissions = collect($permissionModels)->filter(function (Permission $p) {
            return in_array($p->module, ['ORGANIZATION', 'EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'OVERTIME', 'OFFBOARDING', 'RECRUITMENT', 'PERFORMANCE', 'ANALYTICS']);
        })->pluck('id')->all();
        $hrAdminRole->permissions()->sync($hrPermissions);

        $financePermissions = collect($permissionModels)->filter(function (Permission $p) {
            return in_array($p->module, ['PAYROLL', 'LOAN', 'REIMBURSEMENT', 'ANALYTICS']);
        })->pluck('id')->all();
        $financeAdminRole->permissions()->sync($financePermissions);

        $managerPermissions = collect($permissionModels)->filter(function (Permission $p) {
            return in_array($p->code, [
                'org.view', 'employee.view', 'attendance.view', 'attendance.clock', 'attendance.approve',
                'leave.request', 'leave.view', 'leave.approve', 'overtime.request', 'overtime.view', 'overtime.approve',
                'reimbursement.request', 'reimbursement.view', 'reimbursement.approve', 'performance.view', 'performance.evaluate',
            ]);
        })->pluck('id')->all();
        $deptManagerRole->permissions()->sync($managerPermissions);

        $employeePermissions = collect($permissionModels)->filter(function (Permission $p) {
            return in_array($p->code, [
                'attendance.clock', 'attendance.view', 'leave.request', 'leave.view',
                'overtime.request', 'overtime.view', 'payroll.view', 'loan.request', 'loan.view',
                'reimbursement.request', 'reimbursement.view', 'performance.view',
            ]);
        })->pluck('id')->all();
        $employeeRole->permissions()->sync($employeePermissions);

        $usersData = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@enterprise.co.id',
                'roles' => [$superAdminRole->id],
            ],
            [
                'name' => 'Ratna Sari Dewi',
                'email' => 'hr.director@enterprise.co.id',
                'roles' => [$hrAdminRole->id],
            ],
            [
                'name' => 'Hendra Gunawan',
                'email' => 'finance.manager@enterprise.co.id',
                'roles' => [$financeAdminRole->id],
            ],
            [
                'name' => 'Dian Pratama',
                'email' => 'tech.lead@enterprise.co.id',
                'roles' => [$deptManagerRole->id],
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@enterprise.co.id',
                'roles' => [$employeeRole->id],
            ],
            [
                'name' => 'Siti Aminah',
                'email' => 'siti.aminah@enterprise.co.id',
                'roles' => [$employeeRole->id],
            ],
        ];

        foreach ($usersData as $ud) {
            $user = User::firstOrCreate(
                ['email' => $ud['email']],
                [
                    'name' => $ud['name'],
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                ]
            );

            $user->roles()->sync($ud['roles']);
        }
    }
}

