import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Filter,
    MapPin,
    ShieldAlert,
    UserCheck,
    UserX,
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { AttendanceLiveLog, PaginatedData } from '@/types/hris';

interface Props {
    date: string;
    metrics: {
        total_scheduled: number;
        present: number;
        late: number;
        leave: number;
        sick: number;
        absent: number;
    };
    logs: PaginatedData<AttendanceLiveLog>;
    branches: { id: number; name: string }[];
    selectedBranchId?: string;
}

export default function AttendanceIndex({
    date,
    metrics,
    logs,
    branches,
    selectedBranchId,
}: Props) {
    const { auth } = usePage<any>().props;
    const canManageRoster = Boolean(auth?.user?.is_super_admin) || auth?.permissions?.includes('attendance.manage') || auth?.permissions?.includes('*');

    const [branchId, setBranchId] = useState(selectedBranchId || 'all');
    const [selectedSelfieUrl, setSelectedSelfieUrl] = useState<string | null>(null);

    const handleBranchFilter = (val: string) => {
        setBranchId(val);
        router.get('/dashboard/attendance', val === 'all' ? {} : { branch_id: val }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Monitoring Presensi', href: '/dashboard/attendance' },
            ]}
        >
            <Head title="Monitoring Presensi Karyawan Real-Time" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Monitoring Presensi Real-Time
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pantau kehadiran seluruh cabang, deteksi presensi luar radius geofence, dan rekap harian ({date}).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={branchId} onValueChange={handleBranchFilter}>
                            <SelectTrigger className="w-52">
                                <SelectValue placeholder="Pilih Cabang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kantor Cabang</SelectItem>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {canManageRoster && (
                            <Link href="/dashboard/attendance/roster">
                                <Button variant="outline" className="gap-2">
                                    <Calendar className="size-4" />
                                    Kelola Jadwal Roster
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardContent className="p-4">
                            <span className="text-xs text-neutral-500 block">Total Terjadwal</span>
                            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                {metrics.total_scheduled}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardContent className="p-4">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">Hadir Kerja</span>
                            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                                {metrics.present}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardContent className="p-4">
                            <span className="text-xs text-amber-600 dark:text-amber-400 block font-medium">Terlambat</span>
                            <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">
                                {metrics.late}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardContent className="p-4">
                            <span className="text-xs text-blue-600 dark:text-blue-400 block font-medium">Cuti / Izin</span>
                            <div className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300">
                                {metrics.leave}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardContent className="p-4">
                            <span className="text-xs text-purple-600 dark:text-purple-400 block font-medium">Sakit</span>
                            <div className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-300">
                                {metrics.sick}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardContent className="p-4">
                            <span className="text-xs text-red-600 dark:text-red-400 block font-medium">Alpa / Belum Hadir</span>
                            <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-300">
                                {metrics.absent}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-neutral-200 overflow-hidden dark:border-neutral-800">
                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-neutral-500" />
                                <CardTitle className="text-sm font-semibold">Log Presensi Masuk & Pulang Terkini</CardTitle>
                            </div>
                            <span className="text-xs text-neutral-500">Auto-update sinkronisasi worker</span>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/80 text-xs uppercase text-neutral-500 border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Karyawan</th>
                                    <th className="px-4 py-3">Cabang</th>
                                    <th className="px-4 py-3">Tipe</th>
                                    <th className="px-4 py-3">Jarak ke Kantor</th>
                                    <th className="px-4 py-3 text-center">Status Geofence</th>
                                    <th className="px-4 py-3 text-center">Verifikasi</th>
                                    <th className="px-4 py-3 text-center">Foto Selfie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-neutral-500">
                                                {log.recorded_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                    {log.employee_name}
                                                </div>
                                                <span className="font-mono text-neutral-400 text-[11px]">{log.employee_nik}</span>
                                            </td>
                                            <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                                {log.branch_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={log.type === 'CLOCK_IN' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800'}
                                                >
                                                    {log.type_label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 font-mono">
                                                {log.distance_meters} Meter
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={log.is_within_geofence ? 'text-emerald-600 border-emerald-300' : 'text-amber-600 border-amber-300'}
                                                >
                                                    {log.is_within_geofence ? 'Dalam Radius' : 'Luar Radius'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={log.verification_status === 'VALID' ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-600'}
                                                >
                                                    {log.verification_label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {log.selfie_url ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs gap-1"
                                                        onClick={() => setSelectedSelfieUrl(log.selfie_url)}
                                                    >
                                                        <Camera className="size-3.5" />
                                                        Lihat
                                                    </Button>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-neutral-400">
                                            <Users className="size-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Belum ada aktivitas presensi yang tercatat untuk hari ini.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Dialog open={selectedSelfieUrl !== null} onOpenChange={(open) => !open && setSelectedSelfieUrl(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Foto Verifikasi Kehadiran</DialogTitle>
                        <DialogDescription>Snapshot webcam/kamera saat menekan tombol absensi</DialogDescription>
                    </DialogHeader>
                    {selectedSelfieUrl && (
                        <div className="flex justify-center p-2">
                            <img
                                src={selectedSelfieUrl}
                                alt="Selfie"
                                className="max-h-80 rounded-lg object-contain border border-neutral-200"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

