import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Search,
    ShieldAlert,
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
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { AuditLogItem, PaginatedData } from '@/types/hris';

interface Props {
    logs: PaginatedData<AuditLogItem>;
    filters: {
        event?: string;
        user_id?: string;
    };
}

export default function AuditIndex({ logs, filters }: Props) {
    const [eventFilter, setEventFilter] = useState(filters.event || '');
    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard/audit-logs', { event: eventFilter }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Jejak Audit Log', href: '/dashboard/audit-logs' },
            ]}
        >
            <Head title="Jejak Audit Keamanan & Kepatuhan" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Jejak Audit Keamanan (Immutable Audit Trail)
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pencatatan riwayat perubahan data sensitif, transaksi persetujuan, dan perubahan status (Kepatuhan UU PDP & ISO 27001).
                        </p>
                    </div>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Search className="size-4 text-neutral-500" />
                            Filter Peristiwa (Event)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                            <Input
                                value={eventFilter}
                                onChange={(e) => setEventFilter(e.target.value)}
                                placeholder="Cari event: employee.created, approval, ..."
                            />
                            <Button type="submit" size="sm">
                                Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 overflow-hidden dark:border-neutral-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/80 text-xs uppercase text-neutral-500 border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3">Waktu (WIB)</th>
                                    <th className="px-4 py-3">Peristiwa (Event)</th>
                                    <th className="px-4 py-3">Objek / Model</th>
                                    <th className="px-4 py-3">Aktor (Pengguna)</th>
                                    <th className="px-4 py-3">IP Address</th>
                                    <th className="px-4 py-3 text-center">Rincian Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors text-xs">
                                            <td className="px-4 py-3 font-mono text-neutral-500">
                                                {log.created_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {log.event}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200">
                                                {log.auditable_type} #{log.auditable_id}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                                                {log.user_name}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-neutral-500">
                                                {log.ip_address || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <Eye className="size-3.5" />
                                                    Lihat Diff
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">
                                            <ShieldAlert className="size-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Belum ada catatan aktivitas audit yang tersimpan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.total > logs.per_page && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                            <div>
                                Menampilkan {((logs.current_page - 1) * logs.per_page) + 1} - {Math.min(logs.current_page * logs.per_page, logs.total)} dari {logs.total} log
                            </div>
                            <div className="flex items-center gap-1">
                                {logs.prev_page_url ? (
                                    <Link href={logs.prev_page_url} preserveState>
                                        <Button variant="outline" size="sm" className="h-7 px-2">
                                            <ChevronLeft className="size-3.5" />
                                            Prev
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button variant="outline" size="sm" disabled className="h-7 px-2">
                                        <ChevronLeft className="size-3.5" />
                                        Prev
                                    </Button>
                                )}
                                <span className="px-2">
                                    Halaman {logs.current_page} dari {logs.last_page}
                                </span>
                                {logs.next_page_url ? (
                                    <Link href={logs.next_page_url} preserveState>
                                        <Button variant="outline" size="sm" className="h-7 px-2">
                                            Next
                                            <ChevronRight className="size-3.5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button variant="outline" size="sm" disabled className="h-7 px-2">
                                        Next
                                        <ChevronRight className="size-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Rincian Nilai Audit Log (#{selectedLog?.id})</DialogTitle>
                        <DialogDescription>
                            Peristiwa: {selectedLog?.event} pada {selectedLog?.auditable_type} #{selectedLog?.auditable_id} oleh {selectedLog?.user_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                            <span className="font-sans font-semibold text-neutral-500 block mb-1">Nilai Lama (Sebelum):</span>
                            <pre className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-x-auto max-h-60">
                                {selectedLog?.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : 'null'}
                            </pre>
                        </div>
                        <div>
                            <span className="font-sans font-semibold text-neutral-500 block mb-1">Nilai Baru (Sesudah):</span>
                            <pre className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-x-auto max-h-60">
                                {selectedLog?.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : 'null'}
                            </pre>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

