import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    ListOrdered,
    Plus,
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
import type { EmployeeLoanItem } from '@/types/hris';

interface Props {
    loans: EmployeeLoanItem[];
    employees: Array<{ id: number; nik: string; name: string }>;
    loanStatuses: { value: string; label: string }[];
}

export default function LoansIndexPage({
    loans,
    employees,
    loanStatuses,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<EmployeeLoanItem | null>(null);

    const [form, setForm] = useState({
        employee_id: '',
        total_amount: 3000000,
        installment_months: 6,
        start_month: new Date().toISOString().substring(0, 10),
        reason: '',
    });

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalActiveAmount = loans
        .filter((l) => l.status === 'ACTIVE')
        .reduce((acc, curr) => acc + curr.total_amount, 0);

    const totalRemainingAmount = loans
        .filter((l) => l.status === 'ACTIVE')
        .reduce((acc, curr) => acc + curr.remaining_amount, 0);

    const totalCompletedLoans = loans.filter((l) => l.status === 'COMPLETED').length;

    const handleCreateLoan = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/loans', form, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setForm({
                    employee_id: '',
                    total_amount: 3000000,
                    installment_months: 6,
                    start_month: new Date().toISOString().substring(0, 10),
                    reason: '',
                });
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Kasbon & Pinjaman Karyawan', href: '/loans' },
            ]}
        >
            <Head title="Kasbon & Pinjaman Karyawan" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Kasbon & Fasilitas Pinjaman Karyawan
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola plafon pinjaman, penjadwalan angsuran, dan pemotongan otomatis langsung pada kalkulasi payroll.
                        </p>
                    </div>

                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajukan Kasbon Baru
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total Kasbon Aktif Berjalan
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(totalActiveAmount)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Plafon pinjaman disetujui
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Sisa Pokok Pinjaman (Outstanding)
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(totalRemainingAmount)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Piutang yang belum terpotong
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Fasilitas Kasbon Lunas
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {totalCompletedLoans} Pinjaman
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Status COMPLETED
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Daftar Pinjaman Karyawan & Status Angsuran
                        </CardTitle>
                        <CardDescription>
                            Angsuran akan otomatis dipotong setiap bulan saat eksekusi payroll dikunci.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">No. Pinjaman</th>
                                        <th className="px-4 py-3 font-medium">Karyawan</th>
                                        <th className="px-4 py-3 font-medium">Plafon Pinjaman</th>
                                        <th className="px-4 py-3 font-medium">Tenor</th>
                                        <th className="px-4 py-3 font-medium">Angsuran / Bln</th>
                                        <th className="px-4 py-3 font-medium">Sisa Piutang</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {loans.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-neutral-500">
                                                Belum ada pengajuan pinjaman karyawan.
                                            </td>
                                        </tr>
                                    ) : (
                                        loans.map((loan) => (
                                            <tr key={loan.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                <td className="px-4 py-3 font-mono font-medium text-xs">{loan.loan_number}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    <div>{loan.employee?.name}</div>
                                                    <div className="text-xs text-neutral-400 font-mono">{loan.employee?.nik}</div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold">{formatRupiah(loan.total_amount)}</td>
                                                <td className="px-4 py-3">{loan.installment_months} Bulan</td>
                                                <td className="px-4 py-3 text-emerald-600 font-medium">{formatRupiah(loan.monthly_amount)}</td>
                                                <td className="px-4 py-3 text-amber-600 font-semibold">{formatRupiah(loan.remaining_amount)}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            loan.status === 'COMPLETED'
                                                                ? 'default'
                                                                : loan.status === 'ACTIVE'
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {loan.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => setSelectedLoan(loan)}
                                                    >
                                                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                        Jadwal Angsuran
                                                    </Button>
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
                        <DialogTitle>Ajukan Pinjaman / Kasbon Karyawan</DialogTitle>
                        <DialogDescription>
                            Isi nominal plafon dan jumlah bulan angsuran. Jadwal pemotongan akan digenerate otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateLoan} className="space-y-4">
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
                                            {emp.name} ({emp.nik})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="total_amount">Plafon Pinjaman (IDR)</Label>
                                <Input
                                    id="total_amount"
                                    type="number"
                                    step="50000"
                                    value={form.total_amount}
                                    onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="installment_months">Tenor (Bulan)</Label>
                                <Input
                                    id="installment_months"
                                    type="number"
                                    min="1"
                                    max="36"
                                    value={form.installment_months}
                                    onChange={(e) => setForm({ ...form, installment_months: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900 border">
                            <span className="text-neutral-500 block">Estimasi Angsuran per Bulan:</span>
                            <span className="text-base font-bold text-emerald-600">
                                {formatRupiah(form.installment_months > 0 ? form.total_amount / form.installment_months : 0)}
                            </span>
                        </div>

                        <div>
                            <Label htmlFor="start_month">Mulai Bulan Angsuran</Label>
                            <Input
                                id="start_month"
                                type="date"
                                value={form.start_month}
                                onChange={(e) => setForm({ ...form, start_month: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="reason">Keperluan / Alasan Pinjaman</Label>
                            <textarea
                                id="reason"
                                className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
                                placeholder="Contoh: Bantuan biaya perbaikan rumah mendesak"
                                value={form.reason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, reason: e.target.value })}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Setujui & Simpan Pinjaman
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={selectedLoan !== null} onOpenChange={() => setSelectedLoan(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Jadwal Angsuran: {selectedLoan?.loan_number}</DialogTitle>
                        <DialogDescription>
                            Karyawan: {selectedLoan?.employee?.name} ({selectedLoan?.employee?.nik}) - Plafon: {formatRupiah(selectedLoan?.total_amount ?? 0)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-80 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 font-medium">Bulan Ke</th>
                                    <th className="px-3 py-2 font-medium">Nominal Angsuran</th>
                                    <th className="px-3 py-2 font-medium">Status Bayar</th>
                                    <th className="px-3 py-2 font-medium">Tanggal Potong</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {selectedLoan?.installments?.map((inst) => (
                                    <tr key={inst.id}>
                                        <td className="px-3 py-2 font-semibold">Bulan ke-{inst.installment_number}</td>
                                        <td className="px-3 py-2 font-mono">{formatRupiah(inst.amount)}</td>
                                        <td className="px-3 py-2">
                                            <Badge variant={inst.is_paid ? 'default' : 'outline'}>
                                                {inst.is_paid ? 'LUNAS' : 'PENDING'}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-neutral-400">
                                            {inst.paid_at ? new Date(inst.paid_at).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
