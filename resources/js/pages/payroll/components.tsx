import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Edit2,
    Layers,
    Plus,
    Receipt,
    Trash2,
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
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import type { EmployeeListItem, SalaryComponentItem } from '@/types/hris';

interface Props {
    components: SalaryComponentItem[];
    employees: Array<EmployeeListItem & { salary_components: Array<{ id: number; salary_component_id: number; amount: number; component?: SalaryComponentItem }> }>;
    componentTypes: { value: string; label: string }[];
}

export default function SalaryComponentsPage({
    components,
    employees,
    componentTypes,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const [componentForm, setComponentForm] = useState({
        code: '',
        name: '',
        type: 'ALLOWANCE_FIXED',
        is_taxable: true,
        is_bpjs_tk_base: false,
        is_bpjs_kes_base: false,
        default_amount: 0,
        is_active: true,
    });

    const [assignForm, setAssignForm] = useState({
        employee_id: '',
        salary_component_id: '',
        amount: 0,
    });

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleCreateComponent = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/payroll/components', componentForm, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setComponentForm({
                    code: '',
                    name: '',
                    type: 'ALLOWANCE_FIXED',
                    is_taxable: true,
                    is_bpjs_tk_base: false,
                    is_bpjs_kes_base: false,
                    default_amount: 0,
                    is_active: true,
                });
            },
        });
    };

    const handleDeleteComponent = (id: number) => {
        if (confirm('Hapus komponen gaji ini?')) {
            router.delete(`/payroll/components/${id}`);
        }
    };

    const handleAssignToEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/payroll/components/assign', assignForm, {
            onSuccess: () => {
                setIsAssignOpen(false);
                setAssignForm({
                    employee_id: '',
                    salary_component_id: '',
                    amount: 0,
                });
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Payroll', href: '/payroll' },
                { title: 'Komponen Gaji & Tunjangan', href: '/payroll/components' },
            ]}
        >
            <Head title="Master Komponen Gaji & Tunjangan" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Master Komponen Gaji & Tunjangan
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Konfigurasi tunjangan tetap, tunjangan tidak tetap, potongan lain, serta penentuan basis objek PPh 21 dan BPJS.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAssignOpen(true)}
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Atur Tunjangan Karyawan
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Komponen Baru
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                Daftar Master Komponen Gaji
                            </CardTitle>
                            <CardDescription>
                                Komponen yang aktif akan otomatis diperhitungkan dalam formulasi kalkulasi payroll.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Kode</th>
                                            <th className="px-4 py-3 font-medium">Nama Komponen</th>
                                            <th className="px-4 py-3 font-medium">Tipe</th>
                                            <th className="px-4 py-3 font-medium">Karakteristik Pajak & BPJS</th>
                                            <th className="px-4 py-3 font-medium">Nominal Default</th>
                                            <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {components.map((c) => (
                                            <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                <td className="px-4 py-3 font-mono font-semibold text-xs">{c.code}</td>
                                                <td className="px-4 py-3 font-medium">{c.name}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={c.type.includes('ALLOWANCE') ? 'default' : 'secondary'}>
                                                        {c.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {c.is_taxable && (
                                                            <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200">
                                                                Objek PPh 21
                                                            </Badge>
                                                        )}
                                                        {c.is_bpjs_tk_base && (
                                                            <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-200">
                                                                Basis BPJS TK
                                                            </Badge>
                                                        )}
                                                        {c.is_bpjs_kes_base && (
                                                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                                                                Basis BPJS Kes
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">
                                                    {c.default_amount > 0 ? formatRupiah(c.default_amount) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                        onClick={() => handleDeleteComponent(c.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                Ringkasan Kebijakan Remunerasi
                            </CardTitle>
                            <CardDescription>
                                Panduan regulasi kepatuhan payroll Indonesia
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs text-neutral-600 dark:text-neutral-400">
                            <div className="rounded-lg border p-3 space-y-1 bg-neutral-50 dark:bg-neutral-900/60">
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                                    PPh 21 Tarif Efektif Rata-Rata (TER)
                                </span>
                                <p>
                                    Berdasarkan PP 58/2023 & PMK 168/2023, TER bulanan dikelompokkan menjadi Kategori A, B, dan C berdasarkan status PTKP.
                                </p>
                            </div>

                            <div className="rounded-lg border p-3 space-y-1 bg-neutral-50 dark:bg-neutral-900/60">
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                                    Batas Maksimal Upah BPJS (Wage Caps)
                                </span>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    <li>Jaminan Pensiun (JP): Maks. Rp 10.042.300 / bln</li>
                                    <li>BPJS Kesehatan: Maks. Rp 12.000.000 / bln</li>
                                    <li>JHT & JKK/JKM: Tidak ada batas atas nominal upah</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border p-3 space-y-1 bg-neutral-50 dark:bg-neutral-900/60">
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                                    Formulasi Lembur PP 35/2021
                                </span>
                                <p>
                                    Upah per jam lembur bernilai 1/173 dari upah bulanan (Gaji Pokok + Tunjangan Tetap).
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Komponen Gaji Baru</DialogTitle>
                        <DialogDescription>
                            Tentukan kode, nama, jenis komponen, dan aturan perpajakannya.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateComponent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="comp_code">Kode Komponen</Label>
                                <Input
                                    id="comp_code"
                                    placeholder="TJ_TRANSPORT"
                                    value={componentForm.code}
                                    onChange={(e) => setComponentForm({ ...componentForm, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="comp_type">Jenis Komponen</Label>
                                <Select
                                    value={componentForm.type}
                                    onValueChange={(val) => setComponentForm({ ...componentForm, type: val })}
                                >
                                    <SelectTrigger id="comp_type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {componentTypes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="comp_name">Nama Komponen</Label>
                            <Input
                                id="comp_name"
                                placeholder="Tunjangan Transportasi & Uang Makan"
                                value={componentForm.name}
                                onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="default_amount">Nominal Standar (Default)</Label>
                            <Input
                                id="default_amount"
                                type="number"
                                placeholder="0"
                                value={componentForm.default_amount}
                                onChange={(e) => setComponentForm({ ...componentForm, default_amount: Number(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-3 rounded-lg border p-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_taxable"
                                    checked={componentForm.is_taxable}
                                    onCheckedChange={(checked: boolean) => setComponentForm({ ...componentForm, is_taxable: Boolean(checked) })}
                                />
                                <Label htmlFor="is_taxable" className="cursor-pointer">Objek Pajak PPh 21</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_bpjs_tk"
                                    checked={componentForm.is_bpjs_tk_base}
                                    onCheckedChange={(checked: boolean) => setComponentForm({ ...componentForm, is_bpjs_tk_base: Boolean(checked) })}
                                />
                                <Label htmlFor="is_bpjs_tk" className="cursor-pointer">Masuk Basis Hitung BPJS Ketenagakerjaan</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_bpjs_kes"
                                    checked={componentForm.is_bpjs_kes_base}
                                    onCheckedChange={(checked: boolean) => setComponentForm({ ...componentForm, is_bpjs_kes_base: Boolean(checked) })}
                                />
                                <Label htmlFor="is_bpjs_kes" className="cursor-pointer">Masuk Basis Hitung BPJS Kesehatan</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan Komponen
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tetapkan Tunjangan Khusus Karyawan</DialogTitle>
                        <DialogDescription>
                            Tentukan nilai tunjangan tetap atau variabel untuk karyawan individual.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAssignToEmployee} className="space-y-4">
                        <div>
                            <Label>Karyawan</Label>
                            <Select
                                value={assignForm.employee_id}
                                onValueChange={(val) => setAssignForm({ ...assignForm, employee_id: val })}
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
                            <Label>Komponen Gaji</Label>
                            <Select
                                value={assignForm.salary_component_id}
                                onValueChange={(val) => setAssignForm({ ...assignForm, salary_component_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih komponen" />
                                </SelectTrigger>
                                <SelectContent>
                                    {components.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name} ({c.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="assign_amount">Nominal Bulanan (IDR)</Label>
                            <Input
                                id="assign_amount"
                                type="number"
                                placeholder="1000000"
                                value={assignForm.amount}
                                onChange={(e) => setAssignForm({ ...assignForm, amount: Number(e.target.value) })}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan Tunjangan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
