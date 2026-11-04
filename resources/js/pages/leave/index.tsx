import { Head, useForm } from '@inertiajs/react';
import {
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    HeartPulse,
    Plus,
    XCircle,
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
    LeaveBalanceItem,
    LeaveRequestItem,
    LeaveTypeItem,
    PaginatedData,
} from '@/types/hris';

interface Props {
    leaveTypes: LeaveTypeItem[];
    balances: LeaveBalanceItem[];
    requests: PaginatedData<LeaveRequestItem>;
    isManagerOrAdmin: boolean;
}

export default function LeaveIndex({
    leaveTypes,
    balances,
    requests,
    isManagerOrAdmin,
}: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const leaveForm = useForm({
        leave_type_id: leaveTypes[0]?.id ? String(leaveTypes[0].id) : '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        emergency_contact: '',
    });

    const handleCreateRequest = (e: React.FormEvent) => {
        e.preventDefault();
        leaveForm.post('/leaves', {
            onSuccess: () => {
                setIsDialogOpen(false);
                leaveForm.reset();
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Pengajuan Cuti', href: '/leaves' },
            ]}
        >
            <Head title="Manajemen Cuti & Izin Karyawan" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Pengajuan Cuti & Izin Berbayar
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola saldo kuota cuti tahunan, cuti melahirkan UU KIA 2024, izin sakit, dan verifikasi atasan.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="size-4" />
                                Ajukan Permohonan Cuti
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Formulir Pengajuan Cuti / Izin</DialogTitle>
                                <DialogDescription>
                                    Pengajuan akan otomatis dikirim ke kotak masuk approval atasan langsung dan HR.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateRequest} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Jenis Cuti / Izin</Label>
                                    <Select
                                        value={leaveForm.data.leave_type_id}
                                        onValueChange={(val) => leaveForm.setData('leave_type_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Jenis Cuti" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypes.map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name} (Maks {t.default_quota || 'Sesuai Kebutuhan'} hari)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="start_date">Mulai Cuti</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={leaveForm.data.start_date}
                                            onChange={(e) => leaveForm.setData('start_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="end_date">Selesai Cuti</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={leaveForm.data.end_date}
                                            onChange={(e) => leaveForm.setData('end_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="leave_reason">Alasan Cuti</Label>
                                    <Input
                                        id="leave_reason"
                                        value={leaveForm.data.reason}
                                        onChange={(e) => leaveForm.setData('reason', e.target.value)}
                                        placeholder="Jelaskan keperluan cuti..."
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="em_contact">Kontak Darurat Selama Cuti (Opsional)</Label>
                                    <Input
                                        id="em_contact"
                                        value={leaveForm.data.emergency_contact}
                                        onChange={(e) => leaveForm.setData('emergency_contact', e.target.value)}
                                        placeholder="Nomor HP keluarga / telepon"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={leaveForm.processing}>
                                        Kirim Pengajuan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {balances.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {balances.map((b) => (
                            <Card key={b.id} className="border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <span className="text-xs text-neutral-500 uppercase">{b.leave_type_name}</span>
                                    <CardTitle className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                        {b.remaining_days} <span className="text-sm font-normal text-neutral-500">Hari Tersisa</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-neutral-500 flex justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2">
                                    <span>Kuota: {b.allocated_days} hari</span>
                                    <span>Terpakai: {b.used_days} hari</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Card className="border-neutral-200 overflow-hidden dark:border-neutral-800">
                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                            <CalendarCheck className="size-4 text-neutral-500" />
                            <CardTitle className="text-sm font-semibold">
                                {isManagerOrAdmin ? 'Semua Permohonan Cuti Karyawan' : 'Riwayat Pengajuan Cuti Saya'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/80 text-xs uppercase text-neutral-500 border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3">Karyawan</th>
                                    <th className="px-4 py-3">Jenis Cuti</th>
                                    <th className="px-4 py-3">Rentang Tanggal</th>
                                    <th className="px-4 py-3 text-center">Durasi</th>
                                    <th className="px-4 py-3">Alasan</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                                {requests.data.length > 0 ? (
                                    requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                                                <div>{req.employee_name}</div>
                                                <div className="text-[11px] text-neutral-400 font-mono">{req.employee_nik}</div>
                                            </td>
                                            <td className="px-4 py-3">{req.leave_type_name}</td>
                                            <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400">
                                                {req.start_date} s.d {req.end_date}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold font-mono">
                                                {req.total_days} Hari
                                            </td>
                                            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                                                {req.reason}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={req.status === 'APPROVED' ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30' : req.status === 'PENDING' ? 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30' : 'border-red-300 text-red-700'}
                                                >
                                                    {req.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">
                                            <Calendar className="size-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Belum ada pengajuan cuti yang tercatat.</p>
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

