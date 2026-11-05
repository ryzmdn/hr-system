import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    FileCheck2,
    FileText,
    Laptop,
    LogOut,
    Printer,
    Scale,
    ShieldAlert,
    ShieldCheck,
    User,
    UserCheck,
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
import AppLayout from '@/layouts/app-layout';
import type { ExitClearanceItemData, OffboardingRequestItem } from '@/types/hris';

interface Props {
    offboarding: OffboardingRequestItem;
}

export default function OffboardingShowPage({ offboarding }: Props) {
    const [selectedItem, setSelectedItem] = useState<ExitClearanceItemData | null>(null);
    const [notes, setNotes] = useState('');

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleClearItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        router.post(`/offboarding/clearance/${selectedItem.id}/clear`, {
            notes,
        }, {
            onSuccess: () => {
                setSelectedItem(null);
                setNotes('');
            },
        });
    };

    const handleFinalize = () => {
        if (
            confirm(
                'Selesaikan offboarding ini? Status karyawan akan diubah menjadi RESIGNED/TERMINATED, pesangon dicairkan, dan Surat Pengalaman Kerja (Paklaring) akan resmi diaktifkan.'
            )
        ) {
            router.post(`/offboarding/${offboarding.id}/finalize`);
        }
    };

    const clearanceByDept: Record<string, ExitClearanceItemData[]> = {};
    offboarding.clearance_items?.forEach((item) => {
        if (!clearanceByDept[item.department]) {
            clearanceByDept[item.department] = [];
        }
        clearanceByDept[item.department].push(item);
    });

    const allCleared = offboarding.clearance_items?.every((i) => i.is_cleared) ?? false;
    const severance = offboarding.severance;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Offboarding', href: '/offboarding' },
                { title: offboarding.employee?.name ?? 'Detail Offboarding', href: `/offboarding/${offboarding.id}` },
            ]}
        >
            <Head title={`Offboarding - ${offboarding.employee?.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar
                    </Button>

                    <div className="flex items-center gap-2">
                        {offboarding.experience_letter && (
                            <Link href={`/verify/paklaring/${offboarding.experience_letter.verification_token}`}>
                                <Button variant="outline" size="sm">
                                    <FileCheck2 className="mr-2 h-4 w-4" />
                                    Buka Surat Paklaring
                                </Button>
                            </Link>
                        )}
                        {offboarding.status !== 'COMPLETED' && (
                            <Button
                                size="sm"
                                disabled={!allCleared}
                                onClick={handleFinalize}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Selesaikan Offboarding
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader className="border-b bg-neutral-50/50 dark:bg-neutral-900/50">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-xl">
                                    {offboarding.employee?.name}
                                </CardTitle>
                                <CardDescription className="mt-1 font-mono text-xs">
                                    NIK: {offboarding.employee?.nik} • {offboarding.employee?.department?.name ?? '-'} • {offboarding.employee?.position?.name ?? '-'}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        offboarding.status === 'COMPLETED'
                                            ? 'default'
                                            : offboarding.status === 'APPROVED'
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                >
                                    {offboarding.status}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-4 p-6 text-xs">
                        <div>
                            <span className="text-neutral-500 block">Jenis Pengakhiran Hubungan Kerja</span>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{offboarding.type}</span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block">Tanggal Mulai Bergabung</span>
                            <span className="font-semibold">{offboarding.employee?.join_date}</span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block">Tanggal Efektif Berhenti</span>
                            <span className="font-semibold text-red-600">{offboarding.effective_date}</span>
                        </div>
                        <div>
                            <span className="text-neutral-500 block">Alasan Pengakhiran</span>
                            <span className="font-medium text-neutral-700 dark:text-neutral-300">{offboarding.reason}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Checklist Exit Clearance Antar Divisi
                                </CardTitle>
                                <CardDescription>
                                    Seluruh item serah terima di bawah ini harus disetujui sebelum proses offboarding dapat diselesaikan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {Object.entries(clearanceByDept).map(([dept, items]) => (
                                    <div key={dept} className="space-y-3">
                                        <div className="flex items-center gap-2 border-b pb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                                Divisi {dept}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                {items.filter((i) => i.is_cleared).length}/{items.length} Selesai
                                            </Badge>
                                        </div>

                                        <div className="divide-y rounded-lg border">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3.5 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                                {item.item_name}
                                                            </span>
                                                            <Badge
                                                                variant={item.is_cleared ? 'default' : 'outline'}
                                                                className="text-[10px]"
                                                            >
                                                                {item.is_cleared ? 'CLEARED' : 'PENDING'}
                                                            </Badge>
                                                        </div>
                                                        {item.cleared_by && (
                                                            <div className="text-[11px] text-neutral-400">
                                                                Disetujui oleh {item.cleared_by.name} pada {item.cleared_at ? new Date(item.cleared_at).toLocaleDateString('id-ID') : '-'}
                                                                {item.notes && ` (Catatan: ${item.notes})`}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!item.is_cleared && offboarding.status !== 'COMPLETED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs"
                                                            onClick={() => {
                                                                setSelectedItem(item);
                                                                setNotes('');
                                                            }}
                                                        >
                                                            Setujui
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Kalkulasi Pesangon (PP 35/2021)
                                </CardTitle>
                                <CardDescription>
                                    Perhitungan hak kompensasi pengakhiran kerja
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="space-y-2 border-b pb-3">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Gaji Pokok Dasar</span>
                                        <span className="font-semibold">{formatRupiah(severance?.base_salary ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Masa Kerja</span>
                                        <span className="font-semibold">{severance?.service_years ?? 0} Tahun ({severance?.service_months ?? 0} Bulan)</span>
                                    </div>
                                </div>

                                <div className="space-y-2 border-b pb-3">
                                    <div className="flex justify-between">
                                        <div>
                                            <span className="text-neutral-600 dark:text-neutral-400 block">Uang Pesangon (UP)</span>
                                            <span className="text-[10px] text-neutral-400">{severance?.up_multiplier ?? 0}x upah bulanan</span>
                                        </div>
                                        <span className="font-semibold">{formatRupiah(severance?.up_amount ?? 0)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <div>
                                            <span className="text-neutral-600 dark:text-neutral-400 block">Penghargaan Masa Kerja (UPMK)</span>
                                            <span className="text-[10px] text-neutral-400">{severance?.upmk_multiplier ?? 0}x upah bulanan</span>
                                        </div>
                                        <span className="font-semibold">{formatRupiah(severance?.upmk_amount ?? 0)}</span>
                                    </div>

                                    {(severance?.uph_amount ?? 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600 dark:text-neutral-400">Penggantian Hak (UPH)</span>
                                            <span className="font-semibold">{formatRupiah(severance?.uph_amount ?? 0)}</span>
                                        </div>
                                    )}

                                    {(severance?.pkwt_compensation_amount ?? 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600 dark:text-neutral-400">Kompensasi PKWT (Ps. 61)</span>
                                            <span className="font-semibold">{formatRupiah(severance?.pkwt_compensation_amount ?? 0)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 border-b pb-3">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total Pesangon Bruto</span>
                                        <span>{formatRupiah(severance?.total_gross_severance ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                        <div>
                                            <span>Pajak PPh 21 Final (PP 68/2009)</span>
                                            <span className="text-[10px] text-neutral-400 block">0% s/d 50jt, 5% s/d 100jt, dst</span>
                                        </div>
                                        <span>- {formatRupiah(severance?.tax_pph21_severance ?? 0)}</span>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
                                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block uppercase">
                                        Total Pesangon Diterima (Netto)
                                    </span>
                                    <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                                        {formatRupiah(severance?.net_severance ?? 0)}
                                    </div>
                                    <span className="text-[10px] text-neutral-500 mt-1 block">
                                        Status Pencairan: <span className="font-semibold">{severance?.status ?? 'PENDING'}</span>
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Checklist Exit Clearance</DialogTitle>
                        <DialogDescription>
                            Item: {selectedItem?.item_name} ({selectedItem?.department})
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleClearItem} className="space-y-4">
                        <div>
                            <Label htmlFor="notes">Catatan Hasil Pemeriksaan (Opsional)</Label>
                            <Input
                                id="notes"
                                placeholder="Contoh: Perangkat telah diterima dalam kondisi baik"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSelectedItem(null)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Konfirmasi Selesai
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

