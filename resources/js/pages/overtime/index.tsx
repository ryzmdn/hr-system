import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    DollarSign,
    Flame,
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
import { Checkbox } from '@/components/ui/checkbox';
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
import AppLayout from '@/layouts/app-layout';
import type { OvertimeRequestItem, PaginatedData } from '@/types/hris';

interface Props {
    overtimes: PaginatedData<OvertimeRequestItem>;
    isManagerOrAdmin: boolean;
}

export default function OvertimeIndex({ overtimes, isManagerOrAdmin }: Props) {
    const { auth } = usePage<{ auth?: { user?: { role?: string }; permissions?: string[] } }>().props;
    const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.permissions?.includes('*');
    const canRequestOvertime = isSuperAdmin || auth?.permissions?.includes('overtime.request');

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm({
        date: new Date().toISOString().split('T')[0],
        start_time: '17:30',
        end_time: '20:30',
        is_holiday: false,
        reason: '',
    });

    const handleCreateOvertime = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/dashboard/overtime', {
            onSuccess: () => {
                setIsDialogOpen(false);
                form.reset();
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Surat Perintah Lembur (SPL)', href: '/dashboard/overtime' },
            ]}
        >
            <Head title="Manajemen Lembur (SPL PP 35/2021)" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Surat Perintah Lembur (SPL & Overtime Engine)
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Perhitungan otomatis upah lembur kepatuhan PP No. 35/2021 (Formula progresif hari kerja vs hari libur resmi).
                        </p>
                    </div>

                    {canRequestOvertime && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="size-4" />
                                    Buat Pengajuan Lembur (SPL)
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Pengajuan Surat Perintah Lembur (SPL)</DialogTitle>
                                <DialogDescription>
                                    Pengajuan wajib disetujui oleh Kepala Departemen sebelum jam pelaksanaan kerja lembur dimulai.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateOvertime} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="ot_date">Tanggal Pelaksanaan Lembur</Label>
                                    <Input
                                        id="ot_date"
                                        type="date"
                                        value={form.data.date}
                                        onChange={(e) => form.setData('date', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="start_time">Jam Mulai</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={form.data.start_time}
                                            onChange={(e) => form.setData('start_time', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="end_time">Jam Selesai</Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={form.data.end_time}
                                            onChange={(e) => form.setData('end_time', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-1">
                                    <Checkbox
                                        id="is_holiday"
                                        checked={form.data.is_holiday}
                                        onCheckedChange={(checked) => form.setData('is_holiday', Boolean(checked))}
                                    />
                                    <Label htmlFor="is_holiday" className="text-xs font-normal cursor-pointer">
                                        Lembur dilaksanakan pada Hari Libur Resmi / Akhir Pekan (Tarif 2x - 4x)
                                    </Label>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ot_reason">Urgensi & Uraian Pekerjaan Lembur</Label>
                                    <Input
                                        id="ot_reason"
                                        value={form.data.reason}
                                        onChange={(e) => form.setData('reason', e.target.value)}
                                        placeholder="Contoh: Deployment sistem production / Closing keuangan bulanan"
                                        required
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        Kirimkan SPL
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    )}
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Shield className="size-4 text-emerald-600" />
                            <CardTitle className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400">
                                Standar Formula Lembur PP 35/2021
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="text-xs text-neutral-600 dark:text-neutral-400 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                            <strong className="block text-neutral-900 dark:text-neutral-100 mb-0.5">Hari Kerja Biasa:</strong>
                            Jam ke-1 dihitung 1.5x upah per jam; jam ke-2 dan seterusnya dihitung 2.0x upah per jam.
                        </div>
                        <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                            <strong className="block text-neutral-900 dark:text-neutral-100 mb-0.5">Hari Libur / Istirahat Mingguan:</strong>
                            Jam 1-7 dihitung 2.0x, jam ke-8 dihitung 3.0x, jam 9-10 dihitung 4.0x upah per jam dasar (1/173 x Gaji Pokok).
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 overflow-hidden dark:border-neutral-800">
                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                            <Flame className="size-4 text-neutral-500" />
                            <CardTitle className="text-sm font-semibold">
                                {isManagerOrAdmin ? 'Rekap Permohonan Lembur Karyawan' : 'Daftar Lembur Saya'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/80 text-xs uppercase text-neutral-500 border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3">Karyawan</th>
                                    <th className="px-4 py-3">Tanggal & Jam</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3 text-center">Durasi Riil</th>
                                    <th className="px-4 py-3 text-center">Jam Lembur Terhitung</th>
                                    <th className="px-4 py-3 text-right">Estimasi Upah</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                                {overtimes.data.length > 0 ? (
                                    overtimes.data.map((ot) => (
                                        <tr key={ot.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                                                <div>{ot.employee_name}</div>
                                                <div className="text-[11px] text-neutral-400 font-mono">{ot.employee_nik}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400">
                                                <div>{ot.date}</div>
                                                <div className="text-[11px] text-neutral-400">{ot.start_time.slice(0, 5)} - {ot.end_time.slice(0, 5)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className={ot.is_holiday ? 'border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30' : ''}>
                                                    {ot.is_holiday ? 'Hari Libur' : 'Hari Kerja'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono">
                                                {ot.duration_hours} Jam
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                                {ot.calculated_overtime_hours} Jam Equiv
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                Rp {ot.estimated_pay.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={ot.status === 'APPROVED' ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30' : ot.status === 'PENDING' ? 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30' : 'border-red-300 text-red-700'}
                                                >
                                                    {ot.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-neutral-400">
                                            <Flame className="size-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Belum ada catatan surat perintah lembur (SPL).</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}

