import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    FileText,
    Plus,
    Receipt,
    Upload,
    Wallet,
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
import type {
    EmployeeListItem,
    EmployeeReimbursementBalanceItem,
    ReimbursementRequestItem,
    ReimbursementTypeItem,
} from '@/types/hris';

interface Props {
    requests: ReimbursementRequestItem[];
    types: ReimbursementTypeItem[];
    balances: EmployeeReimbursementBalanceItem[];
    employees: Array<{ id: number; nik: string; name: string }>;
    currentEmployee: EmployeeListItem | null;
    statuses: { value: string; label: string }[];
    selectedYear: number;
}

export default function ClaimsIndexPage({
    requests,
    types,
    balances,
    employees,
    currentEmployee,
    statuses,
    selectedYear,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<ReimbursementRequestItem | null>(null);
    const [approvedAmount, setApprovedAmount] = useState<number>(0);

    const [claimForm, setClaimForm] = useState({
        employee_id: currentEmployee ? currentEmployee.id.toString() : '',
        reimbursement_type_id: types[0]?.id?.toString() ?? '',
        receipt_date: new Date().toISOString().substring(0, 10),
        amount: 250000,
        description: '',
    });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    const [typeForm, setTypeForm] = useState({
        code: '',
        name: '',
        annual_limit: 5000000,
    });

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalAllocated = balances.reduce((acc, b) => acc + b.allocated_amount, 0);
    const totalUsed = balances.reduce((acc, b) => acc + b.used_amount, 0);
    const totalRemaining = balances.reduce((acc, b) => acc + b.remaining_amount, 0);

    const { auth } = usePage<any>().props;
    const isSuperAdmin = Boolean(auth?.user?.is_super_admin) || auth?.permissions?.includes('*');
    const isFinance = auth?.user?.roles?.some((r: any) => r.code === 'finance_admin');
    const canManageType = isSuperAdmin || isFinance || auth?.permissions?.includes('reimbursement.manage');
    const canApprove = isSuperAdmin || isFinance || auth?.permissions?.includes('reimbursement.approve');

    const handleCreateClaim = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('employee_id', claimForm.employee_id);
        formData.append('reimbursement_type_id', claimForm.reimbursement_type_id);
        formData.append('receipt_date', claimForm.receipt_date);
        formData.append('amount', claimForm.amount.toString());
        formData.append('description', claimForm.description);
        if (receiptFile) {
            formData.append('receipt_file', receiptFile);
        }

        router.post('/dashboard/claims', formData as any, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setReceiptFile(null);
                setClaimForm({
                    employee_id: currentEmployee ? currentEmployee.id.toString() : '',
                    reimbursement_type_id: types[0]?.id?.toString() ?? '',
                    receipt_date: new Date().toISOString().substring(0, 10),
                    amount: 250000,
                    description: '',
                });
            },
        });
    };

    const handleCreateType = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/dashboard/claims/types', typeForm, {
            onSuccess: () => {
                setIsCreateTypeOpen(false);
                setTypeForm({
                    code: '',
                    name: '',
                    annual_limit: 5000000,
                });
            },
        });
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClaim) return;

        router.post(`/dashboard/claims/${selectedClaim.id}/approve`, {
            approved_amount: approvedAmount,
        }, {
            onSuccess: () => {
                setIsApproveOpen(false);
                setSelectedClaim(null);
            },
        });
    };

    const handleMarkPaid = (id: number) => {
        if (confirm('Tandai klaim ini telah dibayarkan ke karyawan?')) {
            router.post(`/dashboard/claims/${id}/pay`);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Klaim & Reimbursement', href: '/dashboard/claims' },
            ]}
        >
            <Head title="Klaim & Reimbursement Karyawan" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Klaim & Reimbursement Karyawan
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pengajuan klaim biaya medis, kacamata, transportasi, dan plafon tunjangan kesehatan tahunan.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {canManageType && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateTypeOpen(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Kategori Klaim Baru
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Receipt className="mr-2 h-4 w-4" />
                            Ajukan Klaim
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total Plafon {selectedYear}
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(totalAllocated)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Plafon gabungan kategori aktif
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Total Klaim Terpakai
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {formatRupiah(totalUsed)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Klaim yang telah disetujui / dibayar
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Sisa Saldo Plafon Anda
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(totalRemaining)}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Saldo tersedia untuk diajukan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {balances.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-4">
                        {balances.map((b) => (
                            <div key={b.id} className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
                                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    {b.type?.name}
                                </div>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                        {formatRupiah(b.remaining_amount)}
                                    </span>
                                    <span className="text-xs text-neutral-400">
                                        / {formatRupiah(b.allocated_amount)}
                                    </span>
                                </div>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    <div
                                        className="h-1.5 rounded-full bg-emerald-500"
                                        style={{
                                            width: `${Math.min(100, b.allocated_amount > 0 ? (b.remaining_amount / b.allocated_amount) * 100 : 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Daftar Pengajuan Klaim Reimbursement
                        </CardTitle>
                        <CardDescription>
                            Daftar klaim yang diajukan dengan bukti kuitansi resmi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">No. Klaim</th>
                                        <th className="px-4 py-3 font-medium">Karyawan</th>
                                        <th className="px-4 py-3 font-medium">Kategori</th>
                                        <th className="px-4 py-3 font-medium">Tgl Kuitansi</th>
                                        <th className="px-4 py-3 font-medium">Nominal Diajukan</th>
                                        <th className="px-4 py-3 font-medium">Nominal Disetujui</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-neutral-500">
                                                Belum ada pengajuan klaim reimbursement.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                <td className="px-4 py-3 font-mono font-medium text-xs">{req.claim_number}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    <div>{req.employee?.name}</div>
                                                    <div className="text-xs text-neutral-400 font-mono">{req.employee?.nik}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{req.type?.name}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-xs">{req.receipt_date}</td>
                                                <td className="px-4 py-3 font-semibold">{formatRupiah(req.amount)}</td>
                                                <td className="px-4 py-3 text-emerald-600 font-semibold">
                                                    {req.approved_amount > 0 ? formatRupiah(req.approved_amount) : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            req.status === 'PAID'
                                                                ? 'default'
                                                                : req.status === 'APPROVED'
                                                                ? 'secondary'
                                                                : req.status === 'REJECTED'
                                                                ? 'outline'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {req.status === 'SUBMITTED' && canApprove && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs"
                                                                onClick={() => {
                                                                    setSelectedClaim(req);
                                                                    setApprovedAmount(req.amount);
                                                                    setIsApproveOpen(true);
                                                                }}
                                                            >
                                                                Setujui
                                                            </Button>
                                                        )}
                                                        {req.status === 'APPROVED' && canApprove && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="h-8 text-xs"
                                                                onClick={() => handleMarkPaid(req.id)}
                                                            >
                                                                Bayarkan
                                                            </Button>
                                                        )}
                                                        {req.receipt_file_path && (
                                                            <a href={`/storage/${req.receipt_file_path}`} target="_blank" rel="noreferrer">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </a>
                                                        )}
                                                    </div>
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
                        <DialogTitle>Ajukan Klaim Reimbursement</DialogTitle>
                        <DialogDescription>
                            Pastikan kuitansi asli difoto dengan jelas dan nominal sesuai bukti transaksi.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateClaim} className="space-y-4">
                        <div>
                            <Label>Karyawan</Label>
                            <Select
                                value={claimForm.employee_id}
                                onValueChange={(val) => setClaimForm({ ...claimForm, employee_id: val })}
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
                            <Label>Kategori Klaim</Label>
                            <Select
                                value={claimForm.reimbursement_type_id}
                                onValueChange={(val) => setClaimForm({ ...claimForm, reimbursement_type_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name} (Plafon: {formatRupiah(t.annual_limit)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="receipt_date">Tanggal Kuitansi</Label>
                                <Input
                                    id="receipt_date"
                                    type="date"
                                    value={claimForm.receipt_date}
                                    onChange={(e) => setClaimForm({ ...claimForm, receipt_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="claim_amount">Nominal Klaim (IDR)</Label>
                                <Input
                                    id="claim_amount"
                                    type="number"
                                    step="5000"
                                    value={claimForm.amount}
                                    onChange={(e) => setClaimForm({ ...claimForm, amount: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Deskripsi Pengeluaran</Label>
                            <Input
                                id="description"
                                placeholder="Contoh: Pembelian kacamata resep dokter mata"
                                value={claimForm.description}
                                onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="receipt_file">Unggah Foto / PDF Bukti Kuitansi</Label>
                            <Input
                                id="receipt_file"
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setReceiptFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Kirim Pengajuan Klaim
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateTypeOpen} onOpenChange={setIsCreateTypeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Kategori Klaim Baru</DialogTitle>
                        <DialogDescription>
                            Tentukan plafon tahunan dan kode kategori reimbursement.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateType} className="space-y-4">
                        <div>
                            <Label htmlFor="type_code">Kode Kategori</Label>
                            <Input
                                id="type_code"
                                placeholder="OPTICAL"
                                value={typeForm.code}
                                onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="type_name">Nama Kategori</Label>
                            <Input
                                id="type_name"
                                placeholder="Klaim Kacamata & Lensa"
                                value={typeForm.name}
                                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="type_limit">Plafon Tahunan (IDR)</Label>
                            <Input
                                id="type_limit"
                                type="number"
                                step="100000"
                                value={typeForm.annual_limit}
                                onChange={(e) => setTypeForm({ ...typeForm, annual_limit: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateTypeOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan Kategori
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui Klaim Reimbursement</DialogTitle>
                        <DialogDescription>
                            Klaim: {selectedClaim?.claim_number} - Diajukan: {formatRupiah(selectedClaim?.amount ?? 0)}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleApprove} className="space-y-4">
                        <div>
                            <Label htmlFor="approved_amount">Nominal Yang Disetujui (IDR)</Label>
                            <Input
                                id="approved_amount"
                                type="number"
                                value={approvedAmount}
                                onChange={(e) => setApprovedAmount(Number(e.target.value))}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsApproveOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Konfirmasi Persetujuan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

