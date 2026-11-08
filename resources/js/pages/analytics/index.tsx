import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Briefcase,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    Download,
    FileSpreadsheet,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    Users,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { ExecutiveMetricsData } from '@/types/hris';

interface Props {
    metrics: ExecutiveMetricsData;
    selectedYear: number;
}

export default function AnalyticsIndexPage({ metrics, selectedYear }: Props) {
    const handleYearChange = (year: string) => {
        router.get(
            '/dashboard/analytics',
            { year: parseInt(year, 10) },
            { preserveState: true }
        );
    };

    const handleExportWlkp = () => {
        window.location.href = '/dashboard/analytics/wlkp/export';
    };

    const formatCurrency = (val: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case 'High Risk':
                return (
                    <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Tinggi (&ge; 500)
                    </Badge>
                );
            case 'Medium Risk':
                return (
                    <Badge className="bg-amber-500 hover:bg-amber-600 gap-1 text-white">
                        <Clock className="h-3 w-3" />
                        Sedang (200 - 499)
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="gap-1">
                        Rendah (&lt; 200)
                    </Badge>
                );
        }
    };

    const totalHeadcount = metrics.headcount.total_active;
    const totalGender = metrics.headcount.gender_male + metrics.headcount.gender_female;
    const malePercent = totalGender > 0 ? ((metrics.headcount.gender_male / totalGender) * 100).toFixed(1) : '0';
    const femalePercent = totalGender > 0 ? ((metrics.headcount.gender_female / totalGender) * 100).toFixed(1) : '0';

    const totalOvertimeCost = metrics.overtime_by_branch.reduce((acc, curr) => acc + curr.total_cost, 0);
    const totalOvertimeHours = metrics.overtime_by_branch.reduce((acc, curr) => acc + curr.total_hours, 0);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Executive Analytics', href: '/dashboard/analytics' },
            ]}
        >
            <Head title="Executive Analytics & Laporan WLKP" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Executive HR Analytics & Kepatuhan WLKP
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Dashboard pemantauan perputaran karyawan, risiko absensi Bradford Factor, anggaran lembur, dan ekspor resmi WLKP Kemnaker.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-500" />
                            <Select
                                value={selectedYear.toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2024, 2025, 2026, 2027].map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleExportWlkp}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Ekspor WLKP Kemnaker (CSV)
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Karyawan Aktif</CardTitle>
                            <Users className="h-4 w-4 text-neutral-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.headcount.total_active}</div>
                            <p className="text-xs text-neutral-500 mt-1">
                                {metrics.headcount.pkwtt} PKWTT | {metrics.headcount.pkwt} PKWT | {metrics.headcount.probation} Percobaan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Turnover Rate ({selectedYear})</CardTitle>
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600">
                                {metrics.headcount.turnover_rate.toFixed(2)}%
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                {metrics.headcount.resigned_this_year} karyawan resign / terminasi tahun ini
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Biaya Lembur ({selectedYear})</CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {formatCurrency(totalOvertimeCost)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Total {totalOvertimeHours.toFixed(1)} jam lembur terealisasi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rasio Demografi Gender</CardTitle>
                            <Briefcase className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics.headcount.gender_male} / {metrics.headcount.gender_female}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                {malePercent}% Pria | {femalePercent}% Wanita
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-neutral-600" />
                                Realisasi Lembur per Cabang ({selectedYear})
                            </CardTitle>
                            <CardDescription>
                                Akumulasi jam lembur dan biaya upah lembur per entitas operasional.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cabang</TableHead>
                                        <TableHead className="text-right">Total Jam</TableHead>
                                        <TableHead className="text-right">Total Biaya</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metrics.overtime_by_branch.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-6 text-neutral-500">
                                                Belum ada data lembur di tahun {selectedYear}.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        metrics.overtime_by_branch.map((b) => (
                                            <TableRow key={b.branch_id}>
                                                <TableCell className="font-medium">
                                                    <div>{b.branch_name}</div>
                                                    <div className="text-xs text-neutral-400">{b.branch_code}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {b.total_hours.toFixed(1)} jam
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-600">
                                                    {formatCurrency(b.total_cost)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-neutral-600" />
                                Distribusi Karyawan per Departemen
                            </CardTitle>
                            <CardDescription>
                                Proporsi penempatan sumber daya manusia berdasarkan fungsi departemen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {metrics.department_distribution.length === 0 ? (
                                <p className="text-center py-6 text-neutral-500">
                                    Belum ada data departemen.
                                </p>
                            ) : (
                                metrics.department_distribution.map((dept) => {
                                    const percent =
                                        totalHeadcount > 0
                                            ? Math.round((dept.headcount / totalHeadcount) * 100)
                                            : 0;
                                    return (
                                        <div key={dept.department_id} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                    {dept.name} ({dept.code})
                                                </span>
                                                <span className="text-neutral-500 font-semibold">
                                                    {dept.headcount} orang ({percent}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden dark:bg-neutral-800">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-rose-600" />
                            Bradford Factor Absenteeism Risk Index ({selectedYear})
                        </CardTitle>
                        <CardDescription>
                            Formula Bradford Index: B = S² &times; D (di mana S adalah frekuensi ketidakhadiran/spells, dan D adalah total hari absen).
                            Indeks ini mengidentifikasi karyawan dengan ketidakhadiran sporadis berulang yang berdampak disrupsi paling tinggi pada operasional.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIK</TableHead>
                                    <TableHead>Nama Karyawan</TableHead>
                                    <TableHead className="text-center">Frekuensi Sakit/Izin (S)</TableHead>
                                    <TableHead className="text-center">Total Hari Absen (D)</TableHead>
                                    <TableHead className="text-center">Bradford Score (S² &times; D)</TableHead>
                                    <TableHead className="text-right">Tingkat Risiko</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {metrics.bradford_top_risk.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                                            Tidak ada catatan absensi sakit/izin tak terjadwal pada tahun {selectedYear}.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    metrics.bradford_top_risk.map((item) => (
                                        <TableRow key={item.employee_id}>
                                            <TableCell className="font-mono text-xs">{item.nik}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.spells} kali</TableCell>
                                            <TableCell className="text-center">{item.total_days} hari</TableCell>
                                            <TableCell className="text-center font-bold text-base">
                                                {item.bradford_factor}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {getRiskBadge(item.risk_level)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                            <FileSpreadsheet className="h-5 w-5" />
                            Kepatuhan Regulasi Wajib Lapor Ketenagakerjaan Perusahaan (WLKP)
                        </CardTitle>
                        <CardDescription className="text-emerald-700/80 dark:text-emerald-400/80">
                            Berdasarkan Undang-Undang No. 7 Tahun 1981, perusahaan wajib menyampaikan laporan ketenagakerjaan mengenai keadaan ketenagakerjaan, hubungan kerja, jaminan sosial (BPJS), dan demografi tenaga kerja.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            Dokumen format CSV standar Kemnaker siap diimpor ke sistem Kemnaker RI / SISNAKER.
                        </div>
                        <Button
                            onClick={handleExportWlkp}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Unduh CSV WLKP Sekarang
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

