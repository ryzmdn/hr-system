import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    Clock,
    Globe2,
    Layers,
    MapPin,
    Plus,
    Shield,
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
    Branch,
    Company,
    Department,
    JobGrade,
} from '@/types/hris';

interface Props {
    company: Company;
    branches: Branch[];
    departments: Department[];
    jobGrades: JobGrade[];
    timezones: { value: string; label: string }[];
    jkkRiskGrades: { value: string; label: string }[];
}

export default function OrganizationIndex({
    company,
    branches,
    departments,
    jobGrades,
    timezones,
    jkkRiskGrades,
}: Props) {
    const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
    const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
    const [isPosDialogOpen, setIsPosDialogOpen] = useState(false);

    const branchForm = useForm({
        company_id: company.id,
        code: '',
        name: '',
        latitude: '',
        longitude: '',
        radius_meters: 100,
        timezone: 'Asia/Jakarta',
        jkk_risk_grade: '1',
        address: '',
    });

    const deptForm = useForm({
        company_id: company.id,
        parent_id: '',
        code: '',
        name: '',
    });

    const posForm = useForm({
        department_id: departments[0]?.id ? String(departments[0].id) : '',
        job_grade_id: jobGrades[0]?.id ? String(jobGrades[0].id) : '',
        code: '',
        name: '',
        description: '',
    });

    const handleCreateBranch = (e: React.FormEvent) => {
        e.preventDefault();
        branchForm.post('/organization/branches', {
            onSuccess: () => {
                setIsBranchDialogOpen(false);
                branchForm.reset();
            },
        });
    };

    const handleCreateDepartment = (e: React.FormEvent) => {
        e.preventDefault();
        deptForm.post('/organization/departments', {
            onSuccess: () => {
                setIsDeptDialogOpen(false);
                deptForm.reset();
            },
        });
    };

    const handleCreatePosition = (e: React.FormEvent) => {
        e.preventDefault();
        posForm.post('/organization/positions', {
            onSuccess: () => {
                setIsPosDialogOpen(false);
                posForm.reset();
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Organisasi & Cabang', href: '/organization' },
            ]}
        >
            <Head title="Struktur Organisasi & Cabang" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Struktur Organisasi & Multi-Cabang
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola entitas perusahaan, kantor cabang dengan geofence & zona waktu (WIB/WITA/WIT), hierarki divisi, serta jenjang karir.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-1.5">
                                    <Plus className="size-4" />
                                    Tambah Cabang
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Tambah Kantor Cabang Baru</DialogTitle>
                                    <DialogDescription>
                                        Daftarkan lokasi operasional, koordinat geofence untuk absensi GPS, dan zona waktu.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateBranch} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="branch_code">Kode Cabang</Label>
                                            <Input
                                                id="branch_code"
                                                value={branchForm.data.code}
                                                onChange={(e) => branchForm.setData('code', e.target.value)}
                                                placeholder="Contoh: BDG-BR"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="branch_name">Nama Cabang</Label>
                                            <Input
                                                id="branch_name"
                                                value={branchForm.data.name}
                                                onChange={(e) => branchForm.setData('name', e.target.value)}
                                                placeholder="Contoh: Cabang Bandung"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="latitude">Latitude</Label>
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="any"
                                                value={branchForm.data.latitude}
                                                onChange={(e) => branchForm.setData('latitude', e.target.value)}
                                                placeholder="-6.9175"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="longitude">Longitude</Label>
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="any"
                                                value={branchForm.data.longitude}
                                                onChange={(e) => branchForm.setData('longitude', e.target.value)}
                                                placeholder="107.6191"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="radius">Radius (Meter)</Label>
                                            <Input
                                                id="radius"
                                                type="number"
                                                value={branchForm.data.radius_meters}
                                                onChange={(e) => branchForm.setData('radius_meters', Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>Zona Waktu</Label>
                                            <Select
                                                value={branchForm.data.timezone}
                                                onValueChange={(val) => branchForm.setData('timezone', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Zona Waktu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timezones.map((tz) => (
                                                        <SelectItem key={tz.value} value={tz.value}>
                                                            {tz.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Tingkat Risiko JKK</Label>
                                            <Select
                                                value={branchForm.data.jkk_risk_grade}
                                                onValueChange={(val) => branchForm.setData('jkk_risk_grade', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Risiko JKK" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jkkRiskGrades.map((g) => (
                                                        <SelectItem key={g.value} value={g.value}>
                                                            {g.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="address">Alamat Lengkap</Label>
                                        <Input
                                            id="address"
                                            value={branchForm.data.address}
                                            onChange={(e) => branchForm.setData('address', e.target.value)}
                                            placeholder="Gedung / Jalan / Nomor"
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsBranchDialogOpen(false)}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={branchForm.processing}>
                                            Simpan Cabang
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-1.5">
                                    <Plus className="size-4" />
                                    Tambah Divisi
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Departemen / Divisi</DialogTitle>
                                    <DialogDescription>
                                        Buat unit organisasi baru untuk pengelompokan tim dan pelaporan hierarki.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateDepartment} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dept_code">Kode Departemen</Label>
                                        <Input
                                            id="dept_code"
                                            value={deptForm.data.code}
                                            onChange={(e) => deptForm.setData('code', e.target.value)}
                                            placeholder="Contoh: MKT"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dept_name">Nama Departemen</Label>
                                        <Input
                                            id="dept_name"
                                            value={deptForm.data.name}
                                            onChange={(e) => deptForm.setData('name', e.target.value)}
                                            placeholder="Contoh: Marketing & Communications"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Departemen Induk (Opsional)</Label>
                                        <Select
                                            value={deptForm.data.parent_id || 'none'}
                                            onValueChange={(val) => deptForm.setData('parent_id', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Induk (Jika Sub-Divisi)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Tanpa Induk (Top Level)</SelectItem>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.name} ({d.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDeptDialogOpen(false)}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={deptForm.processing}>
                                            Simpan Departemen
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isPosDialogOpen} onOpenChange={setIsPosDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-1.5">
                                    <Plus className="size-4" />
                                    Tambah Jabatan
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Posisi Jabatan</DialogTitle>
                                    <DialogDescription>
                                        Definisikan peran spesifik dan kaitkan dengan tingkatan grade remunerasi.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreatePosition} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>Departemen</Label>
                                            <Select
                                                value={posForm.data.department_id}
                                                onValueChange={(val) => posForm.setData('department_id', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Departemen" />
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
                                        <div className="space-y-1.5">
                                            <Label>Grade Jabatan</Label>
                                            <Select
                                                value={posForm.data.job_grade_id}
                                                onValueChange={(val) => posForm.setData('job_grade_id', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jobGrades.map((g) => (
                                                        <SelectItem key={g.id} value={String(g.id)}>
                                                            {g.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="pos_code">Kode Jabatan</Label>
                                            <Input
                                                id="pos_code"
                                                value={posForm.data.code}
                                                onChange={(e) => posForm.setData('code', e.target.value)}
                                                placeholder="Contoh: MKT-SPEC"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="pos_name">Nama Jabatan</Label>
                                            <Input
                                                id="pos_name"
                                                value={posForm.data.name}
                                                onChange={(e) => posForm.setData('name', e.target.value)}
                                                placeholder="Contoh: Digital Marketing Specialist"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pos_desc">Deskripsi Tanggung Jawab</Label>
                                        <Input
                                            id="pos_desc"
                                            value={posForm.data.description}
                                            onChange={(e) => posForm.setData('description', e.target.value)}
                                            placeholder="Ringkasan tugas utama jabatan"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsPosDialogOpen(false)}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={posForm.processing}>
                                            Simpan Jabatan
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="border-neutral-200 bg-white/70 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/70">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                                    <Building2 className="size-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">{company.name}</CardTitle>
                                    <CardDescription>Badan Usaha Induk & Legalitas Resmi Ketenagakerjaan</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                Entitas Aktif
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
                            <div>
                                <span className="text-neutral-500 dark:text-neutral-400 block text-xs">NPWP Perusahaan</span>
                                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{company.tax_id || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 dark:text-neutral-400 block text-xs">No. BPJS Ketenagakerjaan</span>
                                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{company.bpjs_ketenagakerjaan_no || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 dark:text-neutral-400 block text-xs">No. BPJS Kesehatan</span>
                                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{company.bpjs_kesehatan_no || '-'}</span>
                            </div>
                            <div>
                                <span className="text-neutral-500 dark:text-neutral-400 block text-xs">Total Cabang Operasional</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{branches.length} Cabang</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="size-5 text-neutral-500" />
                            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                                Kantor Cabang & Konfigurasi Geofencing
                            </h2>
                        </div>
                        <span className="text-xs text-neutral-500">Mendukung multi-timezone & verifikasi radius presensi</span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {branches.map((b) => (
                            <Card key={b.id} className="relative overflow-hidden border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-mono text-xs text-neutral-500 uppercase">{b.code}</span>
                                            <CardTitle className="text-base font-semibold">{b.name}</CardTitle>
                                        </div>
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {b.timezone}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs">
                                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                        <Clock className="size-3.5" />
                                        <span>{b.timezone_label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                        <Globe2 className="size-3.5" />
                                        <span className="font-mono">{b.latitude.toFixed(4)}, {b.longitude.toFixed(4)} ({b.radius_meters}m)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                        <Shield className="size-3.5" />
                                        <span>JKK: {b.jkk_risk_label?.split('-')[0] || b.jkk_risk_grade}</span>
                                    </div>
                                    <p className="line-clamp-2 text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                                        {b.address || 'Alamat cabang belum diatur'}
                                    </p>
                                    <div className="pt-1 flex items-center justify-between text-neutral-400">
                                        <span>Total Karyawan:</span>
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{b.employees_count ?? 0} Orang</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 border-neutral-200 dark:border-neutral-800">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Layers className="size-5 text-neutral-500" />
                                <div>
                                    <CardTitle className="text-base font-semibold">Struktur Departemen & Posisi Jabatan</CardTitle>
                                    <CardDescription>Pohon hierarki organisasi dan alokasi peran</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {departments.map((dept) => (
                                    <div key={dept.id} className="py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                    {dept.code}
                                                </span>
                                                <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{dept.name}</span>
                                                {dept.parent && (
                                                    <span className="text-xs text-neutral-400">
                                                        (Sub dari: {dept.parent.name})
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-neutral-500">
                                                {dept.employees_count ?? 0} Karyawan
                                            </span>
                                        </div>

                                        {dept.positions && dept.positions.length > 0 ? (
                                            <div className="mt-2 pl-6 flex flex-wrap gap-1.5">
                                                {dept.positions.map((pos) => (
                                                    <span
                                                        key={pos.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-neutral-50 border border-neutral-200 text-neutral-700 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300"
                                                    >
                                                        <span>{pos.name}</span>
                                                        {pos.grade && (
                                                            <span className="text-[10px] text-neutral-400 font-mono">
                                                                (G{pos.grade.grade_level})
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="mt-1 pl-6 text-xs text-neutral-400 italic">
                                                Belum ada posisi jabatan terdaftar di divisi ini.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Skala Jenjang Remunerasi (Job Grades)</CardTitle>
                            <CardDescription>Rentang batas bawah dan atas remunerasi per level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {jobGrades.map((g) => (
                                    <div
                                        key={g.id}
                                        className="p-3 rounded-lg border border-neutral-100 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/50"
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{g.name}</span>
                                            <span className="text-neutral-500">{g.positions_count ?? 0} Posisi</span>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                                            <span>Rp {Number(g.min_salary).toLocaleString('id-ID')}</span>
                                            <span className="text-neutral-400">-</span>
                                            <span>Rp {Number(g.max_salary).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

