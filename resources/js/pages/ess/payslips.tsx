import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    Calendar,
    CheckCircle2,
    Download,
    Eye,
    FileText,
    Lock,
    ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { EmployeeListItem, PayslipItem } from '@/types/hris';

interface Props {
    employee: EmployeeListItem | null;
    payslips: PayslipItem[];
}

export default function EssPayslipsPage({ employee, payslips }: Props) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'ESS Portal', href: '/dashboard' },
                { title: 'Slip Gaji Saya', href: '/ess/payslips' },
            ]}
        >
            <Head title="Slip Gaji Saya (ESS)" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Portal Slip Gaji Mandiri (ESS)
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Akses riwayat slip gaji resmi, rincian tunjangan, lembur, pemotongan PPh 21 TER, dan BPJS Anda.
                    </p>
                </div>

                {!employee ? (
                    <Card>
                        <CardContent className="p-8 text-center text-sm text-neutral-500">
                            Akun Anda belum ditautkan ke data master karyawan. Silakan hubungi divisi HR.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-neutral-500">
                                        Slip Terakhir Diterima
                                    </CardTitle>
                                    <Banknote className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                        {payslips.length > 0 ? formatRupiah(payslips[0].take_home_pay) : 'Rp 0'}
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {payslips.length > 0 ? payslips[0].run?.period?.name : 'Belum ada slip terbit'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-neutral-500">
                                        Total Slip Terbit
                                    </CardTitle>
                                    <FileText className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                        {payslips.length} Dokumen
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Tersedia untuk diunduh / cetak
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-neutral-500">
                                        Rekening Payroll Terdaftar
                                    </CardTitle>
                                    <ShieldCheck className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                        {employee.bank_name ?? 'Bank'}
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1 font-mono">
                                        {employee.bank_account_number ?? 'Belum diisi'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Daftar Slip Gaji Resmi
                                </CardTitle>
                                <CardDescription>
                                    Hanya slip gaji yang telah resmi dikunci dan diterbitkan oleh HR yang ditampilkan di sini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {payslips.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-neutral-500">
                                        Belum ada slip gaji yang dipublikasikan untuk Anda saat ini.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {payslips.map((slip) => (
                                            <div
                                                key={slip.id}
                                                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                                                            {slip.run?.period?.name}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                                                            Resmi Terbit
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-neutral-500 flex flex-wrap gap-3">
                                                        <span>Bruto: {formatRupiah(slip.gross_income)}</span>
                                                        <span>•</span>
                                                        <span>PPh 21 TER: {formatRupiah(slip.tax_pph21_amount)}</span>
                                                        <span>•</span>
                                                        <span>Total Potongan: {formatRupiah(slip.total_deductions)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="text-xs text-neutral-500 block">Take Home Pay</span>
                                                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                            {formatRupiah(slip.take_home_pay)}
                                                        </span>
                                                    </div>

                                                    <Link href={`/payslips/${slip.id}`}>
                                                        <Button size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Buka Slip
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

