import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    CheckSquare,
    Clock,
    History,
    Plus,
    Shield,
    Trash2,
    UserCheck,
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
    ApprovalHistoryItem,
    DelegationItem,
    PendingApprovalItem,
} from '@/types/hris';

interface Props {
    pending: PendingApprovalItem[];
    history: ApprovalHistoryItem[];
    delegations: DelegationItem[];
    availableUsers: { id: number; name: string; email: string }[];
}

export default function ApprovalInbox({
    pending,
    history,
    delegations,
    availableUsers,
}: Props) {
    const [selectedActionTx, setSelectedActionTx] = useState<PendingApprovalItem | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isDelegationOpen, setIsDelegationOpen] = useState(false);

    const approveForm = useForm({ remarks: '' });
    const rejectForm = useForm({ remarks: '' });

    const delegationForm = useForm({
        delegatee_user_id: availableUsers[0]?.id ? String(availableUsers[0].id) : '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        reason: '',
    });

    const handleConfirmAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedActionTx) return;

        if (actionType === 'approve') {
            router.post(`/approvals/${selectedActionTx.id}/approve`, { remarks }, {
                onSuccess: () => {
                    setSelectedActionTx(null);
                    setActionType(null);
                    setRemarks('');
                },
            });
        } else if (actionType === 'reject') {
            router.post(`/approvals/${selectedActionTx.id}/reject`, { remarks }, {
                onSuccess: () => {
                    setSelectedActionTx(null);
                    setActionType(null);
                    setRemarks('');
                },
            });
        }
    };

    const handleCreateDelegation = (e: React.FormEvent) => {
        e.preventDefault();
        delegationForm.post('/approvals/delegations', {
            onSuccess: () => {
                setIsDelegationOpen(false);
                delegationForm.reset();
            },
        });
    };

    const handleRevokeDelegation = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menonaktifkan delegasi wewenang ini?')) {
            router.delete(`/approvals/delegations/${id}`);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Pusat Approval', href: '/approvals' },
            ]}
        >
            <Head title="Pusat Approval & Delegasi" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Pusat Persetujuan (Approval Center)
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Kelola persetujuan berjenjang permohonan tim dan delegasikan wewenang saat cuti / tugas luar kota.
                        </p>
                    </div>

                    <Dialog open={isDelegationOpen} onOpenChange={setIsDelegationOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <UserCheck className="size-4" />
                                Atur Delegasi Wewenang
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delegasi Wewenang Persetujuan</DialogTitle>
                                <DialogDescription>
                                    Alihkan hak persetujuan Anda kepada rekan kerja (acting approver) dalam rentang tanggal tertentu tanpa meminjamkan akun login.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateDelegation} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Pilih Pengganti (Acting Approver)</Label>
                                    <Select
                                        value={delegationForm.data.delegatee_user_id}
                                        onValueChange={(val) => delegationForm.setData('delegatee_user_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Rekan Kerja" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUsers.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.name} ({u.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="del_start">Mulai Berlaku</Label>
                                        <Input
                                            id="del_start"
                                            type="date"
                                            value={delegationForm.data.start_date}
                                            onChange={(e) => delegationForm.setData('start_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="del_end">Selesai Berlaku</Label>
                                        <Input
                                            id="del_end"
                                            type="date"
                                            value={delegationForm.data.end_date}
                                            onChange={(e) => delegationForm.setData('end_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="del_reason">Alasan Delegasi</Label>
                                    <Input
                                        id="del_reason"
                                        value={delegationForm.data.reason}
                                        onChange={(e) => delegationForm.setData('reason', e.target.value)}
                                        placeholder="Contoh: Mengambil cuti tahunan / Tugas dinas luar kota"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDelegationOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={delegationForm.processing}>
                                        Aktifkan Delegasi
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="size-5 text-amber-500" />
                        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                            Menunggu Keputusan Anda ({pending.length})
                        </h2>
                    </div>

                    {pending.length > 0 ? (
                        <div className="grid gap-4">
                            {pending.map((item) => (
                                <Card key={item.id} className="border-neutral-200 dark:border-neutral-800">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.module_label}
                                                    </Badge>
                                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                                                        {item.workflow_name}
                                                    </span>
                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 text-[11px]">
                                                        Tahap {item.current_step_order} dari {item.total_steps}: {item.current_step_name}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                    Diajukan oleh <strong className="text-neutral-900 dark:text-neutral-100">{item.requester.name}</strong> ({item.requester.department} • {item.requester.branch}) • {item.created_at}
                                                </p>
                                                {item.notes && (
                                                    <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 p-2 rounded border border-neutral-100 dark:border-neutral-800">
                                                        "{item.notes}"
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    onClick={() => {
                                                        setSelectedActionTx(item);
                                                        setActionType('reject');
                                                        setRemarks('');
                                                    }}
                                                >
                                                    <XCircle className="size-4 mr-1.5" />
                                                    Tolak
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={() => {
                                                        setSelectedActionTx(item);
                                                        setActionType('approve');
                                                        setRemarks('');
                                                    }}
                                                >
                                                    <CheckCircle className="size-4 mr-1.5" />
                                                    Setujui
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-neutral-200 dark:border-neutral-800 p-8 text-center text-neutral-400">
                            <CheckSquare className="size-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Kotak masuk Anda bersih!
                            </p>
                            <p className="text-xs text-neutral-400">
                                Tidak ada pengajuan yang membutuhkan persetujuan Anda saat ini.
                            </p>
                        </Card>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-5 text-neutral-500" />
                                <CardTitle className="text-base font-semibold">Delegasi Wewenang Aktif</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {delegations.length > 0 ? (
                                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                                    {delegations.map((d) => (
                                        <div key={d.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {d.is_outgoing ? `Didelegasikan ke: ${d.delegatee_name}` : `Diterima dari: ${d.delegator_name}`}
                                                </div>
                                                <div className="text-neutral-500">
                                                    Periode: {d.start_date} s.d {d.end_date} {d.reason ? `(${d.reason})` : ''}
                                                </div>
                                            </div>
                                            {d.is_outgoing && d.is_active && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="size-7 p-0 text-red-500"
                                                    onClick={() => handleRevokeDelegation(d.id)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-400 py-4 text-center">
                                    Tidak ada delegasi wewenang yang aktif saat ini.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <History className="size-5 text-neutral-500" />
                                <CardTitle className="text-base font-semibold">Riwayat Tindakan Approval Saya</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {history.length > 0 ? (
                                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                                    {history.map((h) => (
                                        <div key={h.id} className="py-2.5 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {h.workflow_name}
                                                </div>
                                                <div className="text-neutral-500">
                                                    Pemohon: {h.requester_name} • {h.updated_at}
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={h.status === 'APPROVED' ? 'text-emerald-600 border-emerald-300' : 'text-red-600 border-red-300'}
                                            >
                                                {h.status_label}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-400 py-4 text-center">
                                    Belum ada riwayat persetujuan yang tercatat.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={selectedActionTx !== null} onOpenChange={(open) => !open && setSelectedActionTx(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve'
                                ? `Apakah Anda yakin ingin menyetujui pengajuan "${selectedActionTx?.workflow_name}" oleh ${selectedActionTx?.requester.name}?`
                                : `Berikan alasan penolakan untuk pengajuan "${selectedActionTx?.workflow_name}" oleh ${selectedActionTx?.requester.name}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleConfirmAction} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="action_remarks">
                                Catatan {actionType === 'reject' ? '(Wajib Diisi)' : '(Opsional)'}
                            </Label>
                            <Input
                                id="action_remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder={actionType === 'reject' ? 'Masukkan alasan penolakan...' : 'Catatan persetujuan...'}
                                required={actionType === 'reject'}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedActionTx(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant={actionType === 'reject' ? 'destructive' : 'default'}
                                className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                            >
                                {actionType === 'approve' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
