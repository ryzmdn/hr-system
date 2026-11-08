import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CreditCard,
    DollarSign,
    GitCommit,
    History,
    Lock,
    MapPin,
    Shield,
    TrendingUp,
    User,
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
    DialogTrigger,
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
    EmployeeCareerHistoryItem,
    EmployeeDetail,
} from '@/types/hris';

interface Props {
    employee: EmployeeDetail;
    histories: EmployeeCareerHistoryItem[];
    canViewSensitive: boolean;
    branches: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    positions: { id: number; name: string; department_id: number }[];
    managers: { id: number; name: string; nik: string }[];
    careerChangeTypes: { value: string; label: string }[];
}

export default function EmployeeShow({
    employee,
    histories,
    canViewSensitive,
    branches,
    departments,
    positions,
    managers,
    careerChangeTypes,
}: Props) {
    const { auth } = usePage<{ auth?: { user?: { role?: string }; permissions?: string[] } }>().props;
    const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.permissions?.includes('*');
    const canManageTransition = isSuperAdmin || auth?.permissions?.includes('employee.update') || auth?.permissions?.includes('employee.manage');

    const [isTransitionOpen, setIsTransitionOpen] = useState(false);

    const transitionForm = useForm({
        change_type: 'PROMOTION',
        effective_start_date: new Date().toISOString().split('T')[0],
        base_salary: employee.current_salary ? String(employee.current_salary) : '',
        branch_id: employee.branch ? String(employee.branch.id) : (branches[0]?.id ? String(branches[0].id) : ''),
        department_id: employee.department ? String(employee.department.id) : (departments[0]?.id ? String(departments[0].id) : ''),
        position_id: employee.position ? String(employee.position.id) : (positions[0]?.id ? String(positions[0].id) : ''),
        manager_id: employee.manager ? String(employee.manager.id) : '',
        reason: '',
    });

    const filteredPositions = positions.filter(
        (p) => !transitionForm.data.department_id || p.department_id === Number(transitionForm.data.department_id),
    );

    const handleTransitionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transitionForm.post(`/dashboard/employees/${employee.id}/transition`, {
            onSuccess: () => {
                setIsTransitionOpen(false);
                transitionForm.reset();
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Direktori Karyawan', href: '/dashboard/employees' },
                { title: employee.name, href: `/dashboard/employees/${employee.id}` },
            ]}
        >
            <Head title={`Profil Karyawan - ${employee.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/employees">
                            <Button variant="outline" size="sm" className="size-8 p-0">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    {employee.name}
                                </h1>
                                <Badge variant="outline" className="font-mono text-xs">
                                    {employee.nik}
                                </Badge>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    {employee.status_label}
                                </Badge>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {employee.position?.name} • {employee.department?.name} • {employee.branch?.name}
                            </p>
                        </div>
                    </div>

                    {canManageTransition && (
                        <Dialog open={isTransitionOpen} onOpenChange={setIsTransitionOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <TrendingUp className="size-4" />
                                    Catat Transisi Karir / Gaji
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Perekaman Transisi Karir & Remunerasi</DialogTitle>
                                <DialogDescription>
                                    Mendukung skema effective dating. Riwayat gaji dan jabatan lama akan otomatis diarsipkan tanpa tertimpa.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleTransitionSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Jenis Transisi</Label>
                                        <Select
                                            value={transitionForm.data.change_type}
                                            onValueChange={(val) => transitionForm.setData('change_type', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Jenis Transisi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {careerChangeTypes.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="eff_date">Tanggal Efektif Berlaku</Label>
                                        <Input
                                            id="eff_date"
                                            type="date"
                                            value={transitionForm.data.effective_start_date}
                                            onChange={(e) => transitionForm.setData('effective_start_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Cabang Baru / Tetap</Label>
                                        <Select
                                            value={transitionForm.data.branch_id}
                                            onValueChange={(val) => transitionForm.setData('branch_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Cabang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((b) => (
                                                    <SelectItem key={b.id} value={String(b.id)}>
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Divisi Baru / Tetap</Label>
                                        <Select
                                            value={transitionForm.data.department_id}
                                            onValueChange={(val) => transitionForm.setData('department_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Divisi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Posisi Jabatan Baru</Label>
                                        <Select
                                            value={transitionForm.data.position_id}
                                            onValueChange={(val) => transitionForm.setData('position_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Jabatan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredPositions.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Atasan Langsung Baru</Label>
                                        <Select
                                            value={transitionForm.data.manager_id || 'none'}
                                            onValueChange={(val) => transitionForm.setData('manager_id', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Atasan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tanpa Atasan Langsung</SelectItem>
                                                {managers.map((m) => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        {m.name} ({m.nik})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="new_sal">Nominal Gaji Pokok Baru (IDR)</Label>
                                    <Input
                                        id="new_sal"
                                        type="number"
                                        value={transitionForm.data.base_salary}
                                        onChange={(e) => transitionForm.setData('base_salary', e.target.value)}
                                        placeholder="Nominal baru"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="trans_reason">Alasan Penyesuaian / Justifikasi</Label>
                                    <Input
                                        id="trans_reason"
                                        value={transitionForm.data.reason}
                                        onChange={(e) => transitionForm.setData('reason', e.target.value)}
                                        placeholder="Contoh: Evaluasi kinerja tahunan / Rotasi cabang"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsTransitionOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={transitionForm.processing}>
                                        Simpan Perubahan Karir
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <DollarSign className="size-5 text-neutral-500" />
                                <CardTitle className="text-base font-semibold">Remunerasi & Gaji Pokok</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-xs text-neutral-500 block">Gaji Pokok Aktif Saat Ini</span>
                                {canViewSensitive ? (
                                    <div className="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                        Rp {employee.current_salary?.toLocaleString('id-ID') ?? 0}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <Lock className="size-4" />
                                        <span>Data Terenkripsi (Perlu Izin Khusus)</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Kategori PTKP:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{employee.tax_ptkp_status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Ikatan Kerja:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{employee.employment_status_label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Mulai Bergabung:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{employee.join_date}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Building2 className="size-5 text-neutral-500" />
                                <CardTitle className="text-base font-semibold">Penempatan Organisasi</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Kantor Cabang:</span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">{employee.branch?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Divisi:</span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">{employee.department?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Posisi:</span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">{employee.position?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Atasan Langsung:</span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">{employee.manager?.name || 'Top Level'}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500">Bawahan Langsung:</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{employee.subordinates_count} Orang</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="size-5 text-neutral-500" />
                                <CardTitle className="text-base font-semibold">Rekening & Kepatuhan</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">NIK KTP:</span>
                                <span className="font-mono text-neutral-900 dark:text-neutral-100">{employee.id_card_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">NPWP Pajak:</span>
                                <span className="font-mono text-neutral-900 dark:text-neutral-100">{employee.tax_number || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Bank Payroll:</span>
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">{employee.bank_name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">No. Rekening:</span>
                                <span className="font-mono text-neutral-900 dark:text-neutral-100">{employee.bank_account_number || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Atas Nama:</span>
                                <span className="text-neutral-900 dark:text-neutral-100">{employee.bank_account_holder || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <History className="size-5 text-neutral-500" />
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Riwayat Karir & Remunerasi (Effective-Dated Timeline)
                                </CardTitle>
                                <CardDescription>
                                    Rekaman historis perubahan jabatan, mutasi cabang, dan penyesuaian gaji tanpa menimpa data masa lalu.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-6 border-l-2 border-neutral-200 dark:border-neutral-800 space-y-6">
                            {histories.map((h, idx) => (
                                <div key={h.id} className="relative">
                                    <div className="absolute -left-[31px] top-1 size-4 rounded-full border-2 border-white bg-neutral-900 dark:border-neutral-900 dark:bg-neutral-100" />
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-semibold text-xs">
                                                {h.change_type_label}
                                            </Badge>
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                                {h.position}
                                            </span>
                                            <span className="text-xs text-neutral-500">di {h.department} ({h.branch})</span>
                                        </div>
                                        <div className="text-xs font-mono text-neutral-500">
                                            {h.effective_start_date} {h.effective_end_date ? `s.d ${h.effective_end_date}` : '(Sekarang)'}
                                        </div>
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs bg-neutral-50/70 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                        <div>
                                            <span className="text-neutral-400 block text-[11px]">Gaji Pokok Periode Ini:</span>
                                            <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                                                {canViewSensitive && h.base_salary !== null ? `Rp ${h.base_salary.toLocaleString('id-ID')}` : 'Terenkripsi'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400 block text-[11px]">Disetujui Oleh:</span>
                                            <span className="text-neutral-800 dark:text-neutral-200">{h.approved_by || 'Sistem'}</span>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400 block text-[11px]">Catatan / Alasan:</span>
                                            <span className="text-neutral-800 dark:text-neutral-200">{h.reason || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

