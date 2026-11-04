<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\BankFormat;
use App\Models\BankDisbursementBatch;
use App\Models\PayrollRun;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BankDisbursementExportService
{
    public function generateBatchFile(PayrollRun $run, BankFormat $format, User $exportedBy): array
    {
        $payslips = $run->payslips()->with('employee')->get();
        $batchReference = 'BATCH-' . $format->value . '-' . $run->id . '-' . Carbon::now()->format('YmdHis');

        $rows = [];
        $totalAmount = 0.0;
        $totalRecords = 0;

        foreach ($payslips as $payslip) {
            $employee = $payslip->employee;
            if (! $employee || $payslip->take_home_pay <= 0) {
                continue;
            }

            $accountNumber = (string) $employee->bank_account_number;
            $accountHolder = (string) ($employee->bank_account_holder ?? $employee->name);
            $amount = (float) $payslip->take_home_pay;

            $totalAmount += $amount;
            $totalRecords++;

            if ($format === BankFormat::Bca) {
                $rows[] = implode(',', [
                    $accountNumber,
                    '"' . str_replace('"', '""', $accountHolder) . '"',
                    number_format($amount, 2, '.', ''),
                    'PAYROLL-' . $employee->nik,
                    'IDR',
                ]);
            } elseif ($format === BankFormat::Mandiri) {
                $rows[] = implode(';', [
                    $accountNumber,
                    $accountHolder,
                    number_format($amount, 2, '.', ''),
                    'Gaji Periode ' . $run->period->name,
                    $employee->nik,
                ]);
            } elseif ($format === BankFormat::Bni) {
                $rows[] = implode(',', [
                    $accountNumber,
                    $accountHolder,
                    number_format($amount, 2, '.', ''),
                    'SALARY',
                    $employee->nik,
                ]);
            } else {
                $rows[] = implode(',', [
                    $accountNumber,
                    $accountHolder,
                    number_format($amount, 2, '.', ''),
                    'CMS-SALARY',
                    $employee->nik,
                ]);
            }
        }

        $content = implode("\r\n", $rows);
        $fileName = 'disbursements/' . $batchReference . '.csv';
        Storage::disk('local')->put($fileName, $content);

        $batch = BankDisbursementBatch::create([
            'payroll_run_id' => $run->id,
            'bank_name' => $format,
            'batch_reference' => $batchReference,
            'total_records' => $totalRecords,
            'total_amount' => $totalAmount,
            'file_path' => $fileName,
            'exported_by_user_id' => $exportedBy->id,
        ]);

        return [
            'batch' => $batch,
            'filename' => $batchReference . '.csv',
            'content' => $content,
        ];
    }
}

