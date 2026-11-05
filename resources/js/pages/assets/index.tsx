import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileCheck2,
    Laptop,
    PackageCheck,
    Plus,
    RotateCcw,
    ShieldAlert,
    UserCheck,
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
import type { EmployeeAssetItem } from '@/types/hris';

interface Props {
    assets: EmployeeAssetItem[];
    employees: Array<{ id: number; nik: string; name: string }>;
    conditions: { value: string; label: string }[];
    statuses: { value: string; label: string }[];
}

export default function AssetsIndexPage({
    assets,
    employees,
    conditions,
    statuses,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isReturnOpen, setIsReturnOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<EmployeeAssetItem | null>(null);

    const [createForm, setCreateForm] = useState({
        employee_id: employees[0]?.id?.toString() ?? '',
        asset_tag: '',
        name: '',
        category: 'LAPTOP',
        serial_number: '',
        handover_date: new Date().toISOString().substring(0, 10),
        handover_condition: 'GOOD',
        notes: '',
    });

    const [returnForm, setReturnForm] = useState({
        returned_date: new Date().toISOString().substring(0, 10),
        return_condition: 'GOOD',
        notes: '',
    });

    const totalAssigned = assets.filter((a) => a.status === 'ASSIGNED').length;
    const totalReturned = assets.filter((a) => a.status === 'RETURNED').length;
    const totalDamaged = assets.filter((a) => a.status === 'DAMAGED').length;

    const handleCreateAsset = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/assets', createForm, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreateForm({
                    employee_id: employees[0]?.id?.toString() ?? '',
                    asset_tag: '',
                    name: '',
                    category: 'LAPTOP',
                    serial_number: '',
                    handover_date: new Date().toISOString().substring(0, 10),
                    handover_condition: 'GOOD',
                    notes: '',
                });
            },
        });
    };

    const handleReturnAsset = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset) return;

        router.post(`/assets/${selectedAsset.id}/return`, returnForm, {
            onSuccess: () => {
                setIsReturnOpen(false);
                setSelectedAsset(null);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Inventaris Aset', href: '/assets' },
            ]}
        >
            <Head title="Manajemen Aset & Inventaris Karyawan" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Inventaris Aset & Fasilitas Karyawan
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pencatatan peminjaman perangkat, nomor seri, penerbitan BAST digital, dan inspeksi pengembalian aset.
                        </p>
                    </div>

                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Serah Terima Aset Baru
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Aset Sedang Dipinjamkan
                            </CardTitle>
                            <Laptop className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {totalAssigned} Unit
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Digunakan aktif oleh staf
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Aset Telah Dikembalikan
                            </CardTitle>
                            <PackageCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {totalReturned} Unit
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Siap di-redeploy atau diarsipkan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Aset Rusak / Perlu Servis
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {totalDamaged} Unit
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Perlu perbaikan atau klaim asuransi
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Daftar Seluruh Aset Terdaftar
                        </CardTitle>
                        <CardDescription>
                            Daftar aset perusahaan lengkap dengan nomor tag unik dan riwayat kondisi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Tag Aset</th>
                                        <th className="px-4 py-3 font-medium">Nama Perangkat</th>
                                        <th className="px-4 py-3 font-medium">Kategori</th>
                                        <th className="px-4 py-3 font-medium">Pemegang (Karyawan)</th>
                                        <th className="px-4 py-3 font-medium">Tgl Serah Terima</th>
                                        <th className="px-4 py-3 font-medium">Kondisi Awal / Akhir</th>
                                        <th className="px-4 py-3 font-medium">No. BAST</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-6 text-center text-sm text-neutral-500">
                                                Belum ada aset terdaftar.
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map((asset) => (
                                            <tr key={asset.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                <td className="px-4 py-3 font-mono font-semibold text-xs">{asset.asset_tag}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{asset.name}</div>
                                                    {asset.serial_number && (
                                                        <div className="text-xs text-neutral-400 font-mono">SN: {asset.serial_number}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{asset.category}</Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{asset.employee?.name}</div>
                                                    <div className="text-xs text-neutral-400 font-mono">{asset.employee?.nik}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs">{asset.handover_date}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div>Awal: <span className="font-medium">{asset.handover_condition}</span></div>
                                                    {asset.return_condition && (
                                                        <div className="text-neutral-500">Kembali: <span className="font-medium">{asset.return_condition}</span></div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                                                    {asset.bast_number ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            asset.status === 'ASSIGNED'
                                                                ? 'default'
                                                                : asset.status === 'RETURNED'
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {asset.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {asset.status === 'ASSIGNED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs"
                                                            onClick={() => {
                                                                setSelectedAsset(asset);
                                                                setIsReturnOpen(true);
                                                            }}
                                                        >
                                                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                                            Pengembalian
                                                        </Button>
                                                    )}
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

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Serah Terima Aset Karyawan</DialogTitle>
                        <DialogDescription>
                            Isi detail spesifikasi aset. Berita Acara Serah Terima (BAST) akan diterbitkan secara otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAsset} className="space-y-4">
                        <div>
                            <Label>Karyawan Penerima</Label>
                            <Select
                                value={createForm.employee_id}
                                onValueChange={(val) => setCreateForm({ ...createForm, employee_id: val })}
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="asset_tag">Tag Aset (Kode Unik)</Label>
                                <Input
                                    id="asset_tag"
                                    placeholder="AST-LPT-001"
                                    value={createForm.asset_tag}
                                    onChange={(e) => setCreateForm({ ...createForm, asset_tag: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Kategori Aset</Label>
                                <Select
                                    value={createForm.category}
                                    onValueChange={(val) => setCreateForm({ ...createForm, category: val })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LAPTOP">Laptop / Komputer</SelectItem>
                                        <SelectItem value="MONITOR">Monitor Eksternal</SelectItem>
                                        <SelectItem value="SMARTPHONE">Smartphone / Tablet</SelectItem>
                                        <SelectItem value="VEHICLE">Kendaraan Dinas</SelectItem>
                                        <SelectItem value="ACCESS_CARD">Kartu Akses / Kunci</SelectItem>
                                        <SelectItem value="OTHER">Perlengkapan Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="asset_name">Nama / Merk / Model Perangkat</Label>
                            <Input
                                id="asset_name"
                                placeholder="MacBook Pro M3 Max 32GB"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="serial_number">Nomor Seri (Serial Number)</Label>
                                <Input
                                    id="serial_number"
                                    placeholder="C02G1234MD6R"
                                    value={createForm.serial_number}
                                    onChange={(e) => setCreateForm({ ...createForm, serial_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="handover_date">Tanggal Penyerahan</Label>
                                <Input
                                    id="handover_date"
                                    type="date"
                                    value={createForm.handover_date}
                                    onChange={(e) => setCreateForm({ ...createForm, handover_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="handover_condition">Kondisi Saat Penyerahan</Label>
                            <Select
                                value={createForm.handover_condition}
                                onValueChange={(val) => setCreateForm({ ...createForm, handover_condition: val })}
                            >
                                <SelectTrigger id="handover_condition">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditions.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="asset_notes">Catatan Tambahan (Kelengkapan/Aksesoris)</Label>
                            <Input
                                id="asset_notes"
                                placeholder="Lengkap dengan charger 140W dan tas laptop"
                                value={createForm.notes}
                                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Terbitkan BAST & Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Formulir Pengembalian Aset</DialogTitle>
                        <DialogDescription>
                            Perangkat: {selectedAsset?.name} ({selectedAsset?.asset_tag}) - Pemegang: {selectedAsset?.employee?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReturnAsset} className="space-y-4">
                        <div>
                            <Label htmlFor="returned_date">Tanggal Pengembalian</Label>
                            <Input
                                id="returned_date"
                                type="date"
                                value={returnForm.returned_date}
                                onChange={(e) => setReturnForm({ ...returnForm, returned_date: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="return_condition">Kondisi Fisik Saat Dikembalikan</Label>
                            <Select
                                value={returnForm.return_condition}
                                onValueChange={(val) => setReturnForm({ ...returnForm, return_condition: val })}
                            >
                                <SelectTrigger id="return_condition">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditions.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="return_notes">Catatan Hasil Pemeriksaan</Label>
                            <Input
                                id="return_notes"
                                placeholder="Contoh: Kondisi fisik normal, charger lengkap berfungsi baik"
                                value={returnForm.notes}
                                onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsReturnOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Konfirmasi Pengembalian
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

