import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    Printer,
    ShieldCheck,
    User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { PayslipItem } from '@/types/hris';

interface Props {
    payslip: PayslipItem;
}

export default function PayslipShow({ payslip }: Props) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handlePrint = () => {
        router.post(`/payslips/${payslip.id}/download`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                window.print();
            },
        });
    };

    const snapshot = payslip.components_snapshot;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Payroll', href: '/payroll' },
                { title: `Slip Gaji ${payslip.employee?.name}`, href: `/payslips/${payslip.id}` },
            ]}
        >
            <Head title={`Slip Gaji - ${payslip.employee?.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full print:p-0 print:max-w-none">
                <div className="flex items-center justify-between print:hidden">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak / Simpan PDF
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-8 text-neutral-900 shadow-sm print:border-none print:shadow-none print:p-0 dark:bg-neutral-950 dark:text-neutral-100">
                    <div className="border-b pb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    SLIP GAJI KARYAWAN
                                </h1>
                                <p className="text-sm font-medium text-neutral-500 mt-1">
                                    Periode: {payslip.run?.period?.name ?? 'Periode Penggajian'}
                                </p>
                            </div>
                            <div className="text-right">
                                <Badge variant={payslip.is_published ? 'default' : 'secondary'} className="text-xs">
                                    {payslip.is_published ? 'OFFICIAL / RESMI' : 'DRAFT KALKULASI'}
                                </Badge>
                                <div className="text-xs text-neutral-400 mt-1 font-mono">
                                    REF: PAY-{payslip.run?.period?.id}-{payslip.employee?.nik}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4 text-xs dark:bg-neutral-900/60 sm:grid-cols-4">
                            <div>
                                <span className="text-neutral-500 block">NIK & Nama</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {payslip.employee?.nik} - {payslip.employee?.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-neutral-500 block">Departemen & Jabatan</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {payslip.employee?.department?.name ?? '-'} / {payslip.employee?.position?.name ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-neutral-500 block">Penempatan Cabang</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {payslip.employee?.branch?.name ?? '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-neutral-500 block">Status PTKP & NPWP</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {payslip.employee?.tax_ptkp_status ?? 'TK/0'} (TER Kat. {payslip.tax_pph21_ter_category})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-8 md:grid-cols-2">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b pb-2 mb-4">
                                I. Penghasilan (Earnings)
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">Gaji Pokok (Basic Salary)</span>
                                    <span className="font-semibold">{formatRupiah(payslip.basic_salary)}</span>
                                </div>

                                {snapshot?.allowances?.map((al, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">{al.name}</span>
                                        <span className="font-semibold">{formatRupiah(al.amount)}</span>
                                    </div>
                                ))}

                                {payslip.overtime_pay > 0 && (
                                    <div className="flex justify-between">
                                        <div>
                                            <span className="text-neutral-600 dark:text-neutral-400 block">Upah Lembur PP 35/2021</span>
                                            <span className="text-[11px] text-neutral-400">
                                                {snapshot?.overtime?.hours ?? 0} jam setara x {formatRupiah(snapshot?.overtime?.rate_per_hour ?? 0)}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-emerald-600">{formatRupiah(payslip.overtime_pay)}</span>
                                    </div>
                                )}

                                <div className="border-t pt-3 flex justify-between text-base font-bold text-neutral-900 dark:text-neutral-100">
                                    <span>Total Penghasilan Bruto</span>
                                    <span>{formatRupiah(payslip.gross_income)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-400 border-b pb-2 mb-4">
                                II. Potongan (Deductions)
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <span className="text-neutral-600 dark:text-neutral-400 block">Pajak PPh 21 TER (PMK 168/2023)</span>
                                        <span className="text-[11px] text-neutral-400">
                                            Kategori {payslip.tax_pph21_ter_category} - Tarif {(payslip.tax_pph21_rate * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                    <span className="font-semibold text-red-600">{formatRupiah(payslip.tax_pph21_amount)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">BPJS JHT Karyawan (2.0%)</span>
                                    <span className="font-semibold text-red-600">{formatRupiah(payslip.bpjs_jht_employee)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">BPJS JP Karyawan (1.0% capped)</span>
                                    <span className="font-semibold text-red-600">{formatRupiah(payslip.bpjs_jp_employee)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-neutral-600 dark:text-neutral-400">BPJS Kesehatan Karyawan (1.0%)</span>
                                    <span className="font-semibold text-red-600">{formatRupiah(payslip.bpjs_kes_employee)}</span>
                                </div>

                                {payslip.loan_deduction > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">Potongan Angsuran Kasbon / Pinjaman</span>
                                        <span className="font-semibold text-red-600">{formatRupiah(payslip.loan_deduction)}</span>
                                    </div>
                                )}

                                {snapshot?.other_deductions?.map((od, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">{od.name}</span>
                                        <span className="font-semibold text-red-600">{formatRupiah(od.amount)}</span>
                                    </div>
                                ))}

                                <div className="border-t pt-3 flex justify-between text-base font-bold text-red-700 dark:text-red-400">
                                    <span>Total Potongan</span>
                                    <span>{formatRupiah(payslip.total_deductions)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl bg-emerald-50 border border-emerald-200 p-6 dark:bg-emerald-950/30 dark:border-emerald-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800 dark:text-emerald-300">
                                    GAJI BERSIH DITERIMA (TAKE HOME PAY)
                                </span>
                                <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                                    {formatRupiah(payslip.take_home_pay)}
                                </div>
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs text-right">
                                Ditransfer ke rekening {payslip.employee?.bank_name ?? 'Bank'} No. {payslip.employee?.bank_account_number ?? '***'} a/n {payslip.employee?.bank_account_holder ?? payslip.employee?.name}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                            Informasi Tambahan: Kontribusi BPJS Dibayarkan Perusahaan (Non-Cash Benefit)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-neutral-50 p-4 rounded-lg dark:bg-neutral-900/60">
                            <div>
                                <span className="text-neutral-400 block">JKK Perusahaan</span>
                                <span className="font-semibold">{formatRupiah(payslip.bpjs_jkk_company)}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">JKM Perusahaan</span>
                                <span className="font-semibold">{formatRupiah(payslip.bpjs_jkm_company)}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">JHT Perusahaan (3.7%)</span>
                                <span className="font-semibold">{formatRupiah(payslip.bpjs_jht_company)}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">JP Perusahaan (2.0%)</span>
                                <span className="font-semibold">{formatRupiah(payslip.bpjs_jp_company)}</span>
                            </div>
                            <div>
                                <span className="text-neutral-400 block">BPJS Kes Perusahaan (4%)</span>
                                <span className="font-semibold">{formatRupiah(payslip.bpjs_kes_company)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-neutral-400 gap-4">
                        <p>
                            Dokumen ini digenerate secara otomatis oleh sistem HRIS Enterprise. Validitas terjamin tanpa tanda tangan basah.
                        </p>
                        <p className="font-mono">
                            Dicetak: {new Date().toLocaleDateString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

