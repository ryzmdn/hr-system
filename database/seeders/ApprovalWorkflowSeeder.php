<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ApprovalModule;
use App\Enums\ApproverType;
use App\Models\ApprovalStep;
use App\Models\ApprovalWorkflow;
use App\Models\Role;
use Illuminate\Database\Seeder;

class ApprovalWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $hrAdminRole = Role::where('code', 'hr_admin')->first();
        $financeAdminRole = Role::where('code', 'finance_admin')->first();

        $leaveWorkflow = ApprovalWorkflow::firstOrCreate(
            ['module' => ApprovalModule::Leave->value, 'name' => 'Alur Persetujuan Cuti & Izin Standar'],
            [
                'description' => 'Persetujuan berjenjang: evaluasi atasan langsung dilanjutkan validasi kuota oleh HR Operation.',
                'is_active' => true,
            ]
        );

        ApprovalStep::firstOrCreate(
            ['approval_workflow_id' => $leaveWorkflow->id, 'step_order' => 1],
            [
                'name' => 'Persetujuan Atasan Langsung',
                'approver_type' => ApproverType::DirectManager->value,
                'approver_role_id' => null,
                'specific_user_id' => null,
            ]
        );

        ApprovalStep::firstOrCreate(
            ['approval_workflow_id' => $leaveWorkflow->id, 'step_order' => 2],
            [
                'name' => 'Verifikasi Kuota & Kebijakan HR',
                'approver_type' => ApproverType::Role->value,
                'approver_role_id' => $hrAdminRole?->id,
                'specific_user_id' => null,
            ]
        );

        $overtimeWorkflow = ApprovalWorkflow::firstOrCreate(
            ['module' => ApprovalModule::Overtime->value, 'name' => 'Persetujuan Surat Perintah Lembur (SPL)'],
            [
                'description' => 'Otorisasi surat perintah lembur oleh atasan langsung sebelum pekerjaan lembur direalisasikan.',
                'is_active' => true,
            ]
        );

        ApprovalStep::firstOrCreate(
            ['approval_workflow_id' => $overtimeWorkflow->id, 'step_order' => 1],
            [
                'name' => 'Persetujuan Atasan Langsung',
                'approver_type' => ApproverType::DirectManager->value,
                'approver_role_id' => null,
                'specific_user_id' => null,
            ]
        );

        $reimbursementWorkflow = ApprovalWorkflow::firstOrCreate(
            ['module' => ApprovalModule::Reimbursement->value, 'name' => 'Alur Verifikasi Klaim & Reimbursement'],
            [
                'description' => 'Persetujuan biaya: validasi kewajaran oleh Manager dilanjutkan pencairan oleh Finance.',
                'is_active' => true,
            ]
        );

        ApprovalStep::firstOrCreate(
            ['approval_workflow_id' => $reimbursementWorkflow->id, 'step_order' => 1],
            [
                'name' => 'Persetujuan Kelayakan Biaya (Manager)',
                'approver_type' => ApproverType::DirectManager->value,
                'approver_role_id' => null,
                'specific_user_id' => null,
            ]
        );

        ApprovalStep::firstOrCreate(
            ['approval_workflow_id' => $reimbursementWorkflow->id, 'step_order' => 2],
            [
                'name' => 'Audit Kuitansi & Pencairan (Finance)',
                'approver_type' => ApproverType::Role->value,
                'approver_role_id' => $financeAdminRole?->id,
                'specific_user_id' => null,
            ]
        );

        $offboardingWorkflow = ApprovalWorkflow::firstOrCreate(
            ['module' => ApprovalModule::Offboarding->value, 'name' => 'Alur Persetujuan Pengunduran Diri (Resign)'],
            [
                'description' => 'Review pengajuan resign oleh manager divisi dilanjutkan exit clearance oleh HR.',
                'is_active' => true,
            ]
        );

        ApprovalStep::firstOrCreate(
            ['approval_workflow_id' => $offboardingWorkflow->id, 'step_order' => 1],
            [
                'name' => 'Review Pengunduran Diri (Manager)',
                'approver_type' => ApproverType::DirectManager->value,
                'approver_role_id' => null,
                'specific_user_id' => null,
            ]
        );

        ApprovalStep::firstOrCreate(
            ['approval_workflow_id' => $offboardingWorkflow->id, 'step_order' => 2],
            [
                'name' => 'Persetujuan Exit & SKK (HR Director)',
                'approver_type' => ApproverType::Role->value,
                'approver_role_id' => $hrAdminRole?->id,
                'specific_user_id' => null,
            ]
        );
    }
}

