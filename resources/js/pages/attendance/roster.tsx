import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus,
    User,
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { EmployeeRosterItem, ShiftTemplateItem } from '@/types/hris';

interface Props {
    startDate: string;
    endDate: string;
    employees: {
        id: number;
        name: string;
        nik: string;
        department?: string;
        branch?: string;
    }[];
    rosters: EmployeeRosterItem[];
    shifts: ShiftTemplateItem[];
    departments: { id: number; name: string }[];
}

export default function AttendanceRoster({
    startDate,
    endDate,
    employees,
    rosters,
    shifts,
    departments,
}: Props) {
    const [selectedSlot, setSelectedSlot] = useState<{
        employeeId: number;
        employeeName: string;
        date: string;
        currentShiftId?: number;
        isOffDay?: boolean;
    } | null>(null);

    const rosterForm = useForm({
        employee_id: '',
        shift_template_id: '',
        date: '',
        is_off_day: false,
    });

    const datesList: string[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
        datesList.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
    }

    const getRosterForEmployeeDay = (employeeId: number, dateStr: string) => {
        return rosters.find((r) => r.employee_id === employeeId && r.date === dateStr);
    };

    const handleOpenSlot = (employeeId: number, employeeName: string, dateStr: string) => {
        const existing = getRosterForEmployeeDay(employeeId, dateStr);
        setSelectedSlot({
            employeeId,
            employeeName,
            date: dateStr,
            isOffDay: existing?.is_off_day,
        });

        rosterForm.setData({
            employee_id: String(employeeId),
            shift_template_id: shifts[0]?.id ? String(shifts[0].id) : '',
            date: dateStr,
            is_off_day: existing?.is_off_day ?? false,
        });
    };

    const handleSaveRoster = (e: React.FormEvent) => {
        e.preventDefault();
        rosterForm.post('/attendance/roster', {
            onSuccess: () => {
                setSelectedSlot(null);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Monitoring Presensi', href: '/attendance' },
                { title: 'Jadwal & Roster Shift', href: '/attendance/roster' },
            ]}
        >
            <Head title="Manajemen Roster & Jadwal Shift Kerja" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/attendance">
                            <Button variant="outline" size="sm" className="size-8 p-0">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Matriks Jadwal Roster Shift Karyawan
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Penjadwalan shift kerja mingguan/bulanan, shift malam silang hari, dan hari libur.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs px-3 py-1">
                            {startDate} s.d {endDate}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-neutral-500 font-semibold mr-1">Legenda Shift:</span>
                    {shifts.map((s) => (
                        <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800">
                            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{s.code}</span>
                            <span className="text-neutral-500">({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                        <span className="font-mono font-bold">OFF</span>
                        <span>(Libur)</span>
                    </div>
                </div>

                <Card className="border-neutral-200 overflow-hidden dark:border-neutral-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-neutral-50/80 text-xs text-neutral-600 border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3 min-w-[200px] border-r border-neutral-200 dark:border-neutral-800 font-medium">
                                        Karyawan & Penempatan
                                    </th>
                                    {datesList.map((d) => {
                                        const dt = new Date(d);
                                        const dayName = dt.toLocaleDateString('id-ID', { weekday: 'short' });
                                        const isWknd = dt.getDay() === 0 || dt.getDay() === 6;
                                        return (
                                            <th
                                                key={d}
                                                className={`px-3 py-2 text-center min-w-[100px] border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 ${isWknd ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                                            >
                                                <span className="block font-semibold uppercase">{dayName}</span>
                                                <span className="text-[11px] font-mono text-neutral-400">{d.slice(5)}</span>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-neutral-50/30 transition-colors">
                                        <td className="px-4 py-2.5 border-r border-neutral-200 dark:border-neutral-800">
                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">{emp.name}</div>
                                            <div className="text-[11px] text-neutral-500 font-mono">
                                                {emp.nik} • {emp.department}
                                            </div>
                                        </td>
                                        {datesList.map((d) => {
                                            const roster = getRosterForEmployeeDay(emp.id, d);
                                            const isOff = roster?.is_off_day;
                                            return (
                                                <td
                                                    key={d}
                                                    onClick={() => handleOpenSlot(emp.id, emp.name, d)}
                                                    className="p-1.5 text-center border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                                                >
                                                    {isOff ? (
                                                        <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50 dark:bg-red-950/30 font-mono text-[10px]">
                                                            OFF
                                                        </Badge>
                                                    ) : roster ? (
                                                        <Badge variant="secondary" className="font-mono text-[10px]">
                                                            {roster.shift_code}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-neutral-300 dark:text-neutral-600 text-[11px]">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Dialog open={selectedSlot !== null} onOpenChange={(open) => !open && setSelectedSlot(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Jadwal Shift Kerja</DialogTitle>
                        <DialogDescription>
                            Karyawan: {selectedSlot?.employeeName} ({selectedSlot?.date})
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveRoster} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Pilih Template Shift</Label>
                            <Select
                                value={rosterForm.data.shift_template_id}
                                onValueChange={(val) => {
                                    rosterForm.setData('shift_template_id', val);
                                    rosterForm.setData('is_off_day', false);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Shift" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shifts.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Button
                                type="button"
                                variant={rosterForm.data.is_off_day ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    const nextOff = !rosterForm.data.is_off_day;
                                    rosterForm.setData('is_off_day', nextOff);
                                    if (nextOff) {
                                        rosterForm.setData('shift_template_id', '');
                                    }
                                }}
                                className={rosterForm.data.is_off_day ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                            >
                                {rosterForm.data.is_off_day ? 'Hari Ini Ditetapkan OFF (Libur)' : 'Tandai Sebagai Hari Libur (OFF)'}
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSelectedSlot(null)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={rosterForm.processing}>
                                Simpan Jadwal
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

