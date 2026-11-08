import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownToLine,
    Banknote,
    Calculator,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    FileSpreadsheet,
    Lock,
    Plus,
    RefreshCw,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type {
    BankDisbursementBatchItem,
    PayrollPeriodItem,
    PayrollRunItem,
} from '@/types/hris';

interface Props {
    periods: PayrollPeriodItem[];
    branches: { id: number; name: string; code: string }[];
    recentBatches: BankDisbursementBatchItem[];
    bankFormats: { value: string; label: string }[];
}

export default function PayrollIndex({
    periods,
    branches,
    recentBatches,
    bankFormats,
}: Props) {
    const { auth } = usePage<{ auth?: { user?: { role?: string }; permissions?: string[] } }>().props;
    const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.permissions?.includes('*');
    const canManagePayroll = isSuperAdmin || auth?.permissions?.includes('payroll.manage');

    const [isCreatePeriodOpen, setIsCreatePeriodOpen] = useState(false);
    const [newPeriodData, setNewPeriodData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        cut_off_date: '',
    });

    const [isProcessRunOpen, setIsProcessRunOpen] = useState(false);
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
    const [isProcessing, setIsProcessing] = useState(false);

    const [isExportBankOpen, setIsExportBankOpen] = useState(false);
    const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
    const [selectedBankFormat, setSelectedBankFormat] = useState<string>('BCA');

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const latestRun = periods[0]?.runs?.[0];

    const handleCreatePeriod = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/dashboard/payroll/periods', newPeriodData, {
            onSuccess: () => {
                setIsCreatePeriodOpen(false);
                setNewPeriodData({
                    name: '',
                    start_date: '',
                    end_date: '',
                    cut_off_date: '',
                });
            },
        });
    };

    const handleExecuteProcess = () => {
        if (!selectedPeriodId) return;
        setIsProcessing(true);
        router.post(
            `/dashboard/payroll/periods/${selectedPeriodId}/process`,
            {
                branch_id: selectedBranchId === 'all' ? null : selectedBranchId,
            },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setIsProcessRunOpen(false);
                },
            }
        );
    };

    const handleLockRun = (runId: number) => {
        if (
            confirm(
                'Kunci payroll ini? Slip gaji akan resmi dipublikasikan ke seluruh karyawan dan angsuran kasbon akan dipotong secara permanen.'
            )
        ) {
            router.post(`/dashboard/payroll/runs/${runId}/lock`);
        }
    };

    const handleExportBank = () => {
        if (!selectedRunId) return;
        router.post(
            `/dashboard/payroll/runs/${selectedRunId}/export-bank`,
            {
                bank_name: selectedBankFormat,
            },
            {
                onSuccess: () => {
                    setIsExportBankOpen(false);
                },
            }
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Payroll Finansial & PPh 21 TER', href: '/dashboard/payroll' },
            ]}
        >
            <Head title="Payroll Finansial & PPh 21 TER" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Payroll Finansial & PPh 21 TER
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kalkulasi gaji terintegrasi presensi & lembur PP 35/2021, PPh 21 TER PMK 168/2023, serta kepatuhan BPJS TK & Kes.
                        </p>
                    </div>

                    {canManagePayroll && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/dashboard/payroll/components">
                                <Button variant="outline" size="sm">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Komponen Gaji
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                onClick={() => setIsCreatePeriodOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Buat Periode Baru
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total Take Home Pay
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(latestRun?.total_net ?? 0)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                {latestRun ? `Periode ${periods[0]?.name}` : 'Belum ada kalkulasi'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total PPh 21 TER
                            </CardTitle>
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(latestRun?.total_tax ?? 0)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                PMK 168/2023 Kategori A, B, C
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Beban BPJS Perusahaan
                            </CardTitle>
                            <Calculator className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(latestRun?.total_bpjs_company ?? 0)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                JKK, JKM, JHT, JP, Kes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Potongan BPJS Karyawan
                            </CardTitle>
                            <Lock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(latestRun?.total_bpjs_employee ?? 0)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                JHT 2%, JP 1%, Kes 1%
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {periods.map((period) => (
                        <Card key={period.id} className="overflow-hidden">
                            <CardHeader className="border-b bg-neutral-50/50 dark:bg-neutral-900/50">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-lg">
                                            {period.name}
                                        </CardTitle>
                                        <Badge
                                            variant={
                                                period.status === 'CLOSED'
                                                    ? 'default'
                                                    : period.status === 'PROCESSING'
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            {period.status}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="text-xs text-neutral-500 mr-2">
                                            Rentang: {period.start_date} s/d {period.end_date} (Cut-off: {period.cut_off_date})
                                        </div>
                                        {canManagePayroll && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedPeriodId(period.id);
                                                    setIsProcessRunOpen(true);
                                                }}
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Hitung Payroll
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {(!period.runs || period.runs.length === 0) ? (
                                    <div className="p-8 text-center text-sm text-neutral-500">
                                        Belum ada kalkulasi payroll yang dijalankan untuk periode ini. Klik &quot;Hitung Payroll&quot; di atas untuk memulai.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {period.runs.map((run: PayrollRunItem) => (
                                            <div key={run.id} className="p-6 space-y-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-base font-semibold">
                                                            {run.branch ? `Cabang: ${run.branch.name}` : 'Seluruh Entitas / Cabang'}
                                                        </h3>
                                                        <Badge
                                                            variant={
                                                                run.status === 'LOCKED'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {run.status}
                                                        </Badge>
                                                        <span className="text-xs text-neutral-500">
                                                            {run.payslips?.length ?? 0} Karyawan diproses
                                                        </span>
                                                    </div>

                                                    {canManagePayroll && (
                                                        <div className="flex items-center gap-2">
                                                            {run.status !== 'LOCKED' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    onClick={() => handleLockRun(run.id)}
                                                                >
                                                                    <Lock className="mr-2 h-4 w-4" />
                                                                    Kunci & Terbitkan Slip
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedRunId(run.id);
                                                                    setIsExportBankOpen(true);
                                                                }}
                                                            >
                                                                <ArrowDownToLine className="mr-2 h-4 w-4" />
                                                                Export File Bank
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900/60 sm:grid-cols-5 text-xs">
                                                    <div>
                                                        <span className="text-neutral-500 block">Total Bruto (Gross)</span>
                                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatRupiah(run.total_gross)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-500 block">PPh 21 TER</span>
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{formatRupiah(run.total_tax)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-500 block">BPJS Perusahaan</span>
                                                        <span className="font-semibold text-purple-600 dark:text-purple-400">{formatRupiah(run.total_bpjs_company)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-500 block">BPJS Karyawan</span>
                                                        <span className="font-semibold text-amber-600 dark:text-amber-400">{formatRupiah(run.total_bpjs_employee)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-neutral-500 block">Total Netto (THP)</span>
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(run.total_net)}</span>
                                                    </div>
                                                </div>

                                                <div className="overflow-x-auto rounded-lg border">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium">NIK</th>
                                                                <th className="px-4 py-3 font-medium">Karyawan</th>
                                                                <th className="px-4 py-3 font-medium">Gaji Pokok</th>
                                                                <th className="px-4 py-3 font-medium">Lembur</th>
                                                                <th className="px-4 py-3 font-medium">PPh 21 TER</th>
                                                                <th className="px-4 py-3 font-medium">BPJS Kar.</th>
                                                                <th className="px-4 py-3 font-medium">Kasbon</th>
                                                                <th className="px-4 py-3 font-medium">Take Home Pay</th>
                                                                <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                                            {run.payslips?.map((slip) => (
                                                                <tr key={slip.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                                    <td className="px-4 py-3 font-mono text-xs">{slip.employee?.nik}</td>
                                                                    <td className="px-4 py-3 font-medium">{slip.employee?.name}</td>
                                                                    <td className="px-4 py-3">{formatRupiah(slip.basic_salary)}</td>
                                                                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatRupiah(slip.overtime_pay)}</td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                                Kat {slip.tax_pph21_ter_category} ({(slip.tax_pph21_rate * 100).toFixed(1)}%)
                                                                            </Badge>
                                                                            <span>{formatRupiah(slip.tax_pph21_amount)}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-amber-600">
                                                                        {formatRupiah(slip.bpjs_jht_employee + slip.bpjs_jp_employee + slip.bpjs_kes_employee)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-red-500">
                                                                        {slip.loan_deduction > 0 ? formatRupiah(slip.loan_deduction) : '-'}
                                                                    </td>
                                                                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                                                                        {formatRupiah(slip.take_home_pay)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <Link href={`/dashboard/payslips/${slip.id}`}>
                                                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                                                                <Eye className="mr-1 h-3.5 w-3.5" />
                                                                                Lihat Slip
                                                                            </Button>
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Riwayat File Export Bank Transfer (Batch Disbursement)
                        </CardTitle>
                        <CardDescription>
                            File hasil generate payroll batch untuk diunggah ke internet banking korporat (BCA, Mandiri, BNI, BRI).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Referensi Batch</th>
                                        <th className="px-4 py-3 font-medium">Format Bank</th>
                                        <th className="px-4 py-3 font-medium">Total Penerima</th>
                                        <th className="px-4 py-3 font-medium">Total Nominal Transfer</th>
                                        <th className="px-4 py-3 font-medium">Diexport Oleh</th>
                                        <th className="px-4 py-3 font-medium text-right">Unduh</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {recentBatches.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-sm text-neutral-500">
                                                Belum ada file disbursement yang diekspor.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentBatches.map((batch) => (
                                            <tr key={batch.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                <td className="px-4 py-3 font-mono text-xs">{batch.batch_reference}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{batch.bank_name}</Badge>
                                                </td>
                                                <td className="px-4 py-3">{batch.total_records} Rekening</td>
                                                <td className="px-4 py-3 font-semibold text-emerald-600">
                                                    {formatRupiah(batch.total_amount)}
                                                </td>
                                                <td className="px-4 py-3 text-neutral-500">{batch.exported_by?.name ?? '-'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <a href={`/dashboard/payroll/disbursements/${batch.id}/download`}>
                                                        <Button variant="outline" size="sm" className="h-8 text-xs">
                                                            <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />
                                                            CSV
                                                        </Button>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreatePeriodOpen} onOpenChange={setIsCreatePeriodOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Periode Penggajian Baru</DialogTitle>
                        <DialogDescription>
                            Tentukan rentang tanggal kerja dan tanggal cut-off presensi/lembur.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePeriod} className="space-y-4">
                        <div>
                            <Label htmlFor="period_name">Nama Periode</Label>
                            <Input
                                id="period_name"
                                placeholder="Contoh: Payroll Januari 2026"
                                value={newPeriodData.name}
                                onChange={(e) => setNewPeriodData({ ...newPeriodData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={newPeriodData.start_date}
                                    onChange={(e) => setNewPeriodData({ ...newPeriodData, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date">Tanggal Akhir</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={newPeriodData.end_date}
                                    onChange={(e) => setNewPeriodData({ ...newPeriodData, end_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="cut_off_date">Tanggal Cut-Off Presensi & Lembur</Label>
                            <Input
                                id="cut_off_date"
                                type="date"
                                value={newPeriodData.cut_off_date}
                                onChange={(e) => setNewPeriodData({ ...newPeriodData, cut_off_date: e.target.value })}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreatePeriodOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan Periode
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isProcessRunOpen} onOpenChange={setIsProcessRunOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Jalankan Kalkulasi Otomatis Payroll</DialogTitle>
                        <DialogDescription>
                            Sistem akan mengagregasi gaji pokok, jam lembur approved, perhitungan PPh 21 TER (PMK 168/2023), BPJS Ketenagakerjaan & Kesehatan, serta potongan kasbon aktif.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Pilih Cakupan Cabang</Label>
                            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Seluruh Cabang (Headquarters & Remote)</SelectItem>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={b.id.toString()}>
                                            {b.name} ({b.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsProcessRunOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleExecuteProcess} disabled={isProcessing}>
                            {isProcessing ? 'Memproses...' : 'Mulai Hitung Payroll'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isExportBankOpen} onOpenChange={setIsExportBankOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Export File Transfer Bank (Batch Disbursement)</DialogTitle>
                        <DialogDescription>
                            Pilih format perbankan tujuan untuk menghasilkan file siap upload internet banking korporat.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Format File Perbankan</Label>
                            <Select value={selectedBankFormat} onValueChange={setSelectedBankFormat}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih bank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankFormats.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>
                                            {f.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsExportBankOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleExportBank}>
                            Generate File Export
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
