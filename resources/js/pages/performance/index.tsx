import { Head, router } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Clock,
    Plus,
    Scale,
    Star,
    Target,
    TrendingUp,
    Users,
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
    PerformanceAppraisalRecord,
    PerformancePeriodItem,
} from '@/types/hris';

interface Props {
    periods: PerformancePeriodItem[];
    appraisals: PerformanceAppraisalRecord[];
    employees: Array<{ id: number; nik: string; name: string }>;
    ratingGrades: Array<{ value: string; label: string }>;
    periodStatuses: Array<{ value: string; label: string }>;
}

export default function PerformanceIndexPage({
    periods,
    appraisals,
    employees,
    ratingGrades,
    periodStatuses,
}: Props) {
    const [isCreatePeriodOpen, setIsCreatePeriodOpen] = useState(false);
    const [isCreateAppraisalOpen, setIsCreateAppraisalOpen] = useState(false);
    const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
    const [selectedAppraisal, setSelectedAppraisal] = useState<PerformanceAppraisalRecord | null>(null);

    const [periodForm, setPeriodForm] = useState({
        name: '',
        start_date: new Date().toISOString().substring(0, 10),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    });

    const [appraisalForm, setAppraisalForm] = useState({
        performance_period_id: periods[0]?.id?.toString() ?? '',
        employee_id: employees[0]?.id?.toString() ?? '',
        evaluator_id: employees[1]?.id?.toString() ?? '',
        kpi_items: [
            { kpi_name: 'Penyelesaian Proyek Tepat Waktu', target_description: 'SLA deliverable proyek tercapai 95%', weight_percentage: 40, target_value: 100, actual_value: 0 },
            { kpi_name: 'Kualitas Kode & Zero Critical Bugs', target_description: 'Code review score dan zero blocker bugs di production', weight_percentage: 30, target_value: 100, actual_value: 0 },
            { kpi_name: 'Kolaborasi & Nilai Kepemimpinan', target_description: 'Mentoring junior dan partisipasi aktif tim', weight_percentage: 30, target_value: 100, actual_value: 0 },
        ],
    });

    const [evaluateActuals, setEvaluateActuals] = useState<Record<number, number>>({});
    const [evaluateFeedback, setEvaluateFeedback] = useState('');

    const totalAppraisals = appraisals.length;
    const avgScore = totalAppraisals > 0
        ? Math.round(appraisals.reduce((acc, a) => acc + a.overall_score, 0) / totalAppraisals)
        : 0;
    const gradeACount = appraisals.filter((a) => a.rating_grade === 'A').length;

    const handleCreatePeriod = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/performance/periods', periodForm, {
            onSuccess: () => {
                setIsCreatePeriodOpen(false);
                setPeriodForm({
                    name: '',
                    start_date: new Date().toISOString().substring(0, 10),
                    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                });
            },
        });
    };

    const handleCreateAppraisal = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/performance/appraisals', appraisalForm, {
            onSuccess: () => {
                setIsCreateAppraisalOpen(false);
            },
        });
    };

    const handleOpenEvaluate = (appraisal: PerformanceAppraisalRecord) => {
        setSelectedAppraisal(appraisal);
        const initialActuals: Record<number, number> = {};
        appraisal.items?.forEach((item) => {
            initialActuals[item.id] = item.actual_value;
        });
        setEvaluateActuals(initialActuals);
        setEvaluateFeedback(appraisal.feedback ?? '');
        setIsEvaluateOpen(true);
    };

    const handleSaveEvaluation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppraisal) return;

        router.post(`/performance/appraisals/${selectedAppraisal.id}/evaluate`, {
            items: evaluateActuals,
            feedback: evaluateFeedback,
        }, {
            onSuccess: () => {
                setIsEvaluateOpen(false);
                setSelectedAppraisal(null);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Kinerja & KPI (OKR)', href: '/performance' },
            ]}
        >
            <Head title="Manajemen Kinerja & Penilaian KPI (OKR)" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Penilaian Kinerja & KPI (OKR)
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Manajemen siklus evaluasi kinerja, penetapan bobot target KPI terstruktur, serta pembobotan nilai otomatis (Grade A, B, C, D).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreatePeriodOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Buka Periode Penilaian
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setIsCreateAppraisalOpen(true)}
                        >
                            <Target className="mr-2 h-4 w-4" />
                            Tetapkan KPI Karyawan
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total Penilaian Kinerja
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {totalAppraisals} Karyawan
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Dalam seluruh periode berjalan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Rata-rata Skor Perusahaan
                            </CardTitle>
                            <Scale className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {avgScore} / 100
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Indeks performa tim teragregasi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Karyawan Grade A (Istimewa)
                            </CardTitle>
                            <Award className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {gradeACount} Orang
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Skor pencapaian KPI &ge; 90
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Daftar Penilaian Kinerja Karyawan
                        </CardTitle>
                        <CardDescription>
                            Evaluasi pencapaian target kerja terhadap bobot indikator KPI yang telah ditetapkan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Karyawan</th>
                                        <th className="px-4 py-3 font-medium">Periode Evaluasi</th>
                                        <th className="px-4 py-3 font-medium">Penilai (Evaluator)</th>
                                        <th className="px-4 py-3 font-medium">Jumlah Indikator KPI</th>
                                        <th className="px-4 py-3 font-medium">Skor Akhir</th>
                                        <th className="px-4 py-3 font-medium">Grade Hasil</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {appraisals.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-neutral-500">
                                                Belum ada target KPI atau penilaian kinerja yang terdaftar.
                                            </td>
                                        </tr>
                                    ) : (
                                        appraisals.map((app) => (
                                            <tr key={app.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                <td className="px-4 py-3 font-medium">
                                                    <div>{app.employee?.name}</div>
                                                    <div className="text-xs text-neutral-400 font-mono">{app.employee?.nik}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold">
                                                    {app.period?.name}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                    {app.evaluator?.name ?? 'Atasan Langsung'}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {app.items?.length ?? 0} Indikator KPI
                                                </td>
                                                <td className="px-4 py-3 font-bold text-base">
                                                    {app.overall_score}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            app.rating_grade === 'A'
                                                                ? 'default'
                                                                : app.rating_grade === 'B'
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                    >
                                                        Grade {app.rating_grade}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline" className="text-xs">
                                                        {app.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs"
                                                        onClick={() => handleOpenEvaluate(app)}
                                                    >
                                                        Evaluasi Nilai
                                                    </Button>
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
                        <DialogTitle>Buka Periode Penilaian Kinerja Baru</DialogTitle>
                        <DialogDescription>
                            Tentukan nama kuartal / tahun serta rentang waktu evaluasi.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePeriod} className="space-y-4">
                        <div>
                            <Label htmlFor="per_name">Nama Periode</Label>
                            <Input
                                id="per_name"
                                placeholder="Contoh: Q1 2026 Appraisal"
                                value={periodForm.name}
                                onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={periodForm.start_date}
                                    onChange={(e) => setPeriodForm({ ...periodForm, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date">Tanggal Berakhir</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={periodForm.end_date}
                                    onChange={(e) => setPeriodForm({ ...periodForm, end_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreatePeriodOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Buka Periode
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateAppraisalOpen} onOpenChange={setIsCreateAppraisalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Tetapkan Target KPI Karyawan</DialogTitle>
                        <DialogDescription>
                            Tentukan bobot persentase indikator (total bobot 100%) dan target kuantitatif yang diharapkan.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAppraisal} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label>Periode</Label>
                                <Select
                                    value={appraisalForm.performance_period_id}
                                    onValueChange={(val) => setAppraisalForm({ ...appraisalForm, performance_period_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Karyawan Dinilai</Label>
                                <Select
                                    value={appraisalForm.employee_id}
                                    onValueChange={(val) => setAppraisalForm({ ...appraisalForm, employee_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih karyawan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                                {emp.name} ({emp.nik})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Atasan Penilai</Label>
                                <Select
                                    value={appraisalForm.evaluator_id}
                                    onValueChange={(val) => setAppraisalForm({ ...appraisalForm, evaluator_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih penilai" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                                {emp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-lg border p-3">
                            <span className="text-xs font-semibold block text-neutral-600 dark:text-neutral-300">
                                Indikator Target KPI (Key Performance Indicators)
                            </span>
                            {appraisalForm.kpi_items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                                    <div className="col-span-6">
                                        <Input
                                            className="h-8 text-xs"
                                            value={item.kpi_name}
                                            onChange={(e) => {
                                                const updated = [...appraisalForm.kpi_items];
                                                updated[idx].kpi_name = e.target.value;
                                                setAppraisalForm({ ...appraisalForm, kpi_items: updated });
                                            }}
                                            placeholder="Nama KPI"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            className="h-8 text-xs"
                                            type="number"
                                            value={item.weight_percentage}
                                            onChange={(e) => {
                                                const updated = [...appraisalForm.kpi_items];
                                                updated[idx].weight_percentage = Number(e.target.value);
                                                setAppraisalForm({ ...appraisalForm, kpi_items: updated });
                                            }}
                                            placeholder="Bobot %"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            className="h-8 text-xs"
                                            type="number"
                                            value={item.target_value}
                                            onChange={(e) => {
                                                const updated = [...appraisalForm.kpi_items];
                                                updated[idx].target_value = Number(e.target.value);
                                                setAppraisalForm({ ...appraisalForm, kpi_items: updated });
                                            }}
                                            placeholder="Target Angka"
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateAppraisalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan Target KPI
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEvaluateOpen} onOpenChange={setIsEvaluateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Evaluasi Penilaian KPI: {selectedAppraisal?.employee?.name}</DialogTitle>
                        <DialogDescription>
                            Masukkan pencapaian aktual (actual value). Sistem akan menghitung skor berbobot dan menetapkan grade akhir secara otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveEvaluation} className="space-y-4">
                        <div className="space-y-3 rounded-lg border p-4 text-xs divide-y">
                            {selectedAppraisal?.items?.map((item) => (
                                <div key={item.id} className="pt-3 first:pt-0 space-y-1">
                                    <div className="flex justify-between font-semibold">
                                        <span>{item.kpi_name}</span>
                                        <span className="text-neutral-500">Bobot: {item.weight_percentage}%</span>
                                    </div>
                                    <div className="flex items-center gap-4 pt-1">
                                        <div className="text-neutral-500">Target: <span className="font-bold">{item.target_value}</span></div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`act_${item.id}`}>Realisasi Aktual:</Label>
                                            <Input
                                                id={`act_${item.id}`}
                                                className="h-8 w-28 text-xs font-bold"
                                                type="number"
                                                value={evaluateActuals[item.id] ?? 0}
                                                onChange={(e) => setEvaluateActuals({ ...evaluateActuals, [item.id]: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label htmlFor="eval_feedback">Catatan & Ulasan Evaluator</Label>
                            <Input
                                id="eval_feedback"
                                placeholder="Apresiasi atas performa dan area yang perlu ditingkatkan..."
                                value={evaluateFeedback}
                                onChange={(e) => setEvaluateFeedback(e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEvaluateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Finalisasi Nilai Kinerja
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

