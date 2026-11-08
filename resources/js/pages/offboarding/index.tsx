import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Calculator,
    CheckCircle2,
    Clock,
    FileCheck2,
    FileText,
    LogOut,
    Plus,
    Scale,
    ShieldAlert,
    UserX,
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
import type { OffboardingRequestItem } from '@/types/hris';

interface Props {
    requests: OffboardingRequestItem[];
    employees: Array<{ id: number; nik: string; name: string; join_date: string }>;
    types: Array<{ value: string; label: string; up_multiplier: number; upmk_multiplier: number }>;
    statuses: Array<{ value: string; label: string }>;
}

export default function OffboardingIndexPage({
    requests,
    employees,
    types,
    statuses,
}: Props) {
    const { auth } = usePage<{ auth?: { user?: { role?: string }; permissions?: string[] } }>().props;
    const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.permissions?.includes('*');
    const canManageOffboarding = isSuperAdmin || auth?.permissions?.includes('offboarding.manage');

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [form, setForm] = useState({
        employee_id: employees[0]?.id?.toString() ?? '',
        type: 'RESIGNATION',
        notice_date: new Date().toISOString().substring(0, 10),
        effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        reason: '',
        uph_amount: 0,
    });

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalActive = requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED').length;
    const totalSeverance = requests.reduce((acc, r) => acc + (r.severance?.net_severance ?? 0), 0);
    const totalLetters = requests.filter((r) => r.experience_letter !== null && r.experience_letter !== undefined).length;

    const handleCreateOffboarding = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/dashboard/offboarding', form, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setForm({
                    employee_id: employees[0]?.id?.toString() ?? '',
                    type: 'RESIGNATION',
                    notice_date: new Date().toISOString().substring(0, 10),
                    effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                    reason: '',
                    uph_amount: 0,
                });
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Offboarding & Pesangon', href: '/dashboard/offboarding' },
            ]}
        >
            <Head title="Offboarding & Kalkulator Pesangon PP 35/2021" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Offboarding & Pesangon PP 35/2021
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Alur pemutusan hubungan kerja, kalkulator pesangon otomatis (UP, UPMK, UPH, Kompensasi PKWT), exit clearance antar divisi, serta penerbitan Paklaring ber-QR code.
                        </p>
                    </div>

                    {canManageOffboarding && (
                        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Inisiasi Offboarding Baru
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Proses Offboarding Aktif
                            </CardTitle>
                            <UserX className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {totalActive} Karyawan
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Dalam proses exit clearance
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total Kewajiban Pesangon (Netto)
                            </CardTitle>
                            <Scale className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(totalSeverance)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Sesuai PP 35/2021 & PPh 21 Final PP 68/2009
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Surat Paklaring Diterbitkan
                            </CardTitle>
                            <FileCheck2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {totalLetters} Dokumen
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Terverifikasi digital dengan QR token
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Daftar Seluruh Permohonan Offboarding
                        </CardTitle>
                        <CardDescription>
                            Pantau tahapan exit clearance dan hak finansial karyawan yang berhenti.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Karyawan</th>
                                        <th className="px-4 py-3 font-medium">Jenis Pengakhiran (PP 35/2021)</th>
                                        <th className="px-4 py-3 font-medium">Tgl Notifikasi</th>
                                        <th className="px-4 py-3 font-medium">Tgl Efektif</th>
                                        <th className="px-4 py-3 font-medium">Clearance</th>
                                        <th className="px-4 py-3 font-medium">Total Pesangon (Netto)</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-neutral-500">
                                                Belum ada data offboarding.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => {
                                            const clearedCount = req.clearance_items?.filter((i) => i.is_cleared).length ?? 0;
                                            const totalItems = req.clearance_items?.length ?? 0;

                                            return (
                                                <tr key={req.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                    <td className="px-4 py-3 font-medium">
                                                        <div>{req.employee?.name}</div>
                                                        <div className="text-xs text-neutral-400 font-mono">{req.employee?.nik}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="text-xs">
                                                            {req.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">{req.notice_date}</td>
                                                    <td className="px-4 py-3 text-xs font-semibold">{req.effective_date}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <span className="font-semibold">{clearedCount}/{totalItems}</span>
                                                            <span className="text-neutral-400">selesai</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {formatRupiah(req.severance?.net_severance ?? 0)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                req.status === 'COMPLETED'
                                                                    ? 'default'
                                                                    : req.status === 'APPROVED'
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {req.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link href={`/dashboard/offboarding/${req.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-8 text-xs">
                                                                Detail & Clearance
                                                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Inisiasi Offboarding Karyawan</DialogTitle>
                        <DialogDescription>
                            Sistem akan secara otomatis menyusun checklist exit clearance 4 divisi dan menghitung formulasi hak pesangon sesuai PP No. 35 Tahun 2021.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateOffboarding} className="space-y-4">
                        <div>
                            <Label>Pilih Karyawan</Label>
                            <Select
                                value={form.employee_id}
                                onValueChange={(val) => setForm({ ...form, employee_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih karyawan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                            {emp.name} ({emp.nik}) - Masuk: {emp.join_date}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Alasan / Jenis Pengakhiran Hubungan Kerja (PP 35/2021)</Label>
                            <Select
                                value={form.type}
                                onValueChange={(val) => setForm({ ...form, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label} (UP: {t.up_multiplier}x, UPMK: {t.upmk_multiplier}x)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="notice_date">Tanggal Notifikasi (One Month Notice)</Label>
                                <Input
                                    id="notice_date"
                                    type="date"
                                    value={form.notice_date}
                                    onChange={(e) => setForm({ ...form, notice_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="effective_date">Tanggal Efektif Berhenti</Label>
                                <Input
                                    id="effective_date"
                                    type="date"
                                    value={form.effective_date}
                                    onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="uph_amount">Kompensasi UPH / Sisa Cuti Tahunan (IDR)</Label>
                            <Input
                                id="uph_amount"
                                type="number"
                                step="50000"
                                value={form.uph_amount}
                                onChange={(e) => setForm({ ...form, uph_amount: Number(e.target.value) })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="reason">Keterangan / Alasan Resmi</Label>
                            <Input
                                id="reason"
                                placeholder="Contoh: Mengundurkan diri atas kemauan sendiri untuk melanjutkan studi"
                                value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Inisiasi & Hitung Pesangon
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

