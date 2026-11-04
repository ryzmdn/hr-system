import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Lock,
    Plus,
    Search,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { EmployeeListItem, PaginatedData } from '@/types/hris';

interface Props {
    employees: PaginatedData<EmployeeListItem>;
    filters: {
        search?: string;
        branch_id?: string;
        department_id?: string;
        status?: string;
        employment_status?: string;
    };
    branches: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    canViewSensitive: boolean;
}

export default function EmployeeIndex({
    employees,
    filters,
    branches,
    departments,
    canViewSensitive,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [branchId, setBranchId] = useState(filters.branch_id || 'all');
    const [departmentId, setDepartmentId] = useState(filters.department_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilterChange = (params: Record<string, string>) => {
        const query: Record<string, string> = {
            search: search,
            branch_id: branchId === 'all' ? '' : branchId,
            department_id: departmentId === 'all' ? '' : departmentId,
            status: status === 'all' ? '' : status,
            ...params,
        };

        Object.keys(query).forEach((k) => {
            if (!query[k]) delete query[k];
        });

        router.get('/employees', query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const getStatusBadge = (statusValue: string) => {
        switch (statusValue) {
            case 'ACTIVE':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400">Aktif</Badge>;
            case 'SUSPENDED':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400">Skorsing</Badge>;
            case 'RESIGNED':
                return <Badge variant="secondary">Resign</Badge>;
            case 'TERMINATED':
                return <Badge variant="destructive">PHK</Badge>;
            default:
                return <Badge variant="outline">{statusValue}</Badge>;
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Direktori Karyawan', href: '/employees' },
            ]}
        >
            <Head title="Direktori Master Karyawan" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Direktori Master Karyawan
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pusat data karyawan enterprise, riwayat penugasan, dan catatan kepatuhan ketenagakerjaan.
                        </p>
                    </div>
                    <Link href="/employees/create">
                        <Button className="gap-1.5">
                            <Plus className="size-4" />
                            Tambah Karyawan
                        </Button>
                    </Link>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Filter className="size-4 text-neutral-500" />
                            Filter & Pencarian Karyawan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4 lg:grid-cols-5">
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari NIK, nama lengkap, atau email..."
                                    className="pl-9"
                                />
                            </div>

                            <Select
                                value={branchId}
                                onValueChange={(val) => {
                                    setBranchId(val);
                                    handleFilterChange({ branch_id: val === 'all' ? '' : val });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Cabang</SelectItem>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={departmentId}
                                onValueChange={(val) => {
                                    setDepartmentId(val);
                                    handleFilterChange({ department_id: val === 'all' ? '' : val });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Divisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Divisi</SelectItem>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    setStatus(val);
                                    handleFilterChange({ status: val === 'all' ? '' : val });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                                    <SelectItem value="SUSPENDED">Skorsing</SelectItem>
                                    <SelectItem value="RESIGNED">Resigned</SelectItem>
                                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 overflow-hidden dark:border-neutral-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50/80 text-xs uppercase text-neutral-500 border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3">Karyawan</th>
                                    <th className="px-4 py-3">Cabang & Divisi</th>
                                    <th className="px-4 py-3">Jabatan</th>
                                    <th className="px-4 py-3">Status Kontrak</th>
                                    {canViewSensitive && (
                                        <th className="px-4 py-3 text-right">Gaji Pokok Aktif</th>
                                    )}
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                {employees.data.length > 0 ? (
                                    employees.data.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {emp.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                                                    <span>{emp.nik}</span>
                                                    <span>•</span>
                                                    <span>{emp.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <div className="font-medium text-neutral-800 dark:text-neutral-200">
                                                    {emp.branch?.name || '-'}
                                                </div>
                                                <div className="text-neutral-500">
                                                    {emp.department?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                                    {emp.position?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <Badge variant="outline" className="font-normal text-xs">
                                                    {emp.employment_status_label}
                                                </Badge>
                                            </td>
                                            {canViewSensitive && (
                                                <td className="px-4 py-3 text-xs text-right font-mono font-medium text-neutral-900 dark:text-neutral-100">
                                                    {emp.effective_salary !== null ? (
                                                        `Rp ${emp.effective_salary.toLocaleString('id-ID')}`
                                                    ) : (
                                                        <span className="text-neutral-400">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(emp.status)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={`/employees/${emp.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                                        <Eye className="size-3.5" />
                                                        Detail
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={canViewSensitive ? 7 : 6} className="px-4 py-12 text-center text-neutral-400">
                                            <Users className="size-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">Tidak ada data karyawan yang cocok dengan filter saat ini.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {employees.total > employees.per_page && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                            <div>
                                Menampilkan {((employees.current_page - 1) * employees.per_page) + 1} - {Math.min(employees.current_page * employees.per_page, employees.total)} dari {employees.total} karyawan
                            </div>
                            <div className="flex items-center gap-1">
                                {employees.prev_page_url ? (
                                    <Link href={employees.prev_page_url} preserveState>
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
                                    Halaman {employees.current_page} dari {employees.last_page}
                                </span>
                                {employees.next_page_url ? (
                                    <Link href={employees.next_page_url} preserveState>
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
        </AppLayout>
    );
}

