import { Head, router } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Eye,
    Filter,
    Plus,
    Search,
    Star,
    UserCheck,
    UserPlus,
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
import type {
    CandidateItem,
    JobPostingItem,
} from '@/types/hris';

interface Props {
    postings: JobPostingItem[];
    candidates: CandidateItem[];
    branches: Array<{ id: number; name: string; code: string }>;
    departments: Array<{ id: number; name: string; code: string }>;
    positions: Array<{ id: number; name: string; code: string }>;
    stages: Array<{ value: string; label: string }>;
    postingStatuses: Array<{ value: string; label: string }>;
}

export default function RecruitmentIndexPage({
    postings,
    candidates,
    branches,
    departments,
    positions,
    stages,
    postingStatuses,
}: Props) {
    const [activeTab, setActiveTab] = useState<'postings' | 'candidates'>('postings');
    const [isCreatePostingOpen, setIsCreatePostingOpen] = useState(false);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isHireOpen, setIsHireOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);

    const [postingForm, setPostingForm] = useState({
        title: '',
        branch_id: branches[0]?.id?.toString() ?? '',
        department_id: departments[0]?.id?.toString() ?? '',
        position_id: positions[0]?.id?.toString() ?? '',
        employment_status: 'PKWTT',
        quota: 1,
        min_experience_years: 1,
        salary_range_min: 8000000,
        salary_range_max: 15000000,
        description: '',
        requirements: '',
        deadline_date: '',
    });

    const [candidateForm, setCandidateForm] = useState({
        job_posting_id: postings[0]?.id?.toString() ?? '',
        name: '',
        email: '',
        phone_number: '',
        portfolio_url: '',
        expected_salary: 10000000,
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const [hireForm, setHireForm] = useState({
        branch_id: branches[0]?.id?.toString() ?? '',
        department_id: departments[0]?.id?.toString() ?? '',
        position_id: positions[0]?.id?.toString() ?? '',
        join_date: new Date().toISOString().substring(0, 10),
        agreed_salary: 10000000,
    });

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalOpenings = postings.filter((p) => p.status === 'PUBLISHED').length;
    const totalQuota = postings.reduce((acc, p) => acc + p.quota, 0);
    const totalHired = candidates.filter((c) => c.stage === 'HIRED').length;

    const handleCreatePosting = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/recruitment/postings', postingForm, {
            onSuccess: () => {
                setIsCreatePostingOpen(false);
                setPostingForm({
                    title: '',
                    branch_id: branches[0]?.id?.toString() ?? '',
                    department_id: departments[0]?.id?.toString() ?? '',
                    position_id: positions[0]?.id?.toString() ?? '',
                    employment_status: 'PKWTT',
                    quota: 1,
                    min_experience_years: 1,
                    salary_range_min: 8000000,
                    salary_range_max: 15000000,
                    description: '',
                    requirements: '',
                    deadline_date: '',
                });
            },
        });
    };

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('job_posting_id', candidateForm.job_posting_id);
        data.append('name', candidateForm.name);
        data.append('email', candidateForm.email);
        data.append('phone_number', candidateForm.phone_number);
        data.append('portfolio_url', candidateForm.portfolio_url);
        data.append('expected_salary', candidateForm.expected_salary.toString());
        if (resumeFile) {
            data.append('resume_file', resumeFile);
        }

        router.post('/recruitment/apply', data as any, {
            onSuccess: () => {
                setIsApplyOpen(false);
                setResumeFile(null);
                setCandidateForm({
                    job_posting_id: postings[0]?.id?.toString() ?? '',
                    name: '',
                    email: '',
                    phone_number: '',
                    portfolio_url: '',
                    expected_salary: 10000000,
                });
            },
        });
    };

    const handleUpdateStage = (candidateId: number, newStage: string) => {
        router.post(`/recruitment/candidates/${candidateId}/stage`, {
            stage: newStage,
        });
    };

    const handleHire = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidate) return;

        router.post(`/recruitment/candidates/${selectedCandidate.id}/hire`, hireForm, {
            onSuccess: () => {
                setIsHireOpen(false);
                setSelectedCandidate(null);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HRIS', href: '/dashboard' },
                { title: 'Rekrutmen & ATS', href: '/recruitment' },
            ]}
        >
            <Head title="Rekrutmen & ATS (Applicant Tracking System)" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Rekrutmen & Pelacakan Kandidat (ATS)
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Perencanaan tenaga kerja (MPP), publikasi lowongan, pipeline seleksi pelamar, hingga bridging ke onboarding karyawan baru.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsApplyOpen(true)}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Input Pelamar Baru
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setIsCreatePostingOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Buka Lowongan Baru
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Lowongan Dibuka (Published)
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {totalOpenings} Posisi
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Total alokasi kuota MPP: {totalQuota} orang
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Kandidat Masuk (Pipeline)
                            </CardTitle>
                            <Users className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                {candidates.length} Pelamar
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Dalam seluruh tahapan skrining
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-neutral-500">
                                Kandidat Berhasil Di-Hire
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {totalHired} Orang
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Resmi bergabung sebagai karyawan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-2 border-b pb-2">
                    <Button
                        variant={activeTab === 'postings' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('postings')}
                    >
                        Lowongan Kerja ({postings.length})
                    </Button>
                    <Button
                        variant={activeTab === 'candidates' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('candidates')}
                    >
                        Pipeline Pelamar ({candidates.length})
                    </Button>
                </div>

                {activeTab === 'postings' ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {postings.map((p) => (
                            <Card key={p.id} className="flex flex-col justify-between">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base font-bold">
                                            {p.title}
                                        </CardTitle>
                                        <Badge variant={p.status === 'PUBLISHED' ? 'default' : 'outline'}>
                                            {p.status}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs">
                                        {p.department?.name ?? 'Umum'} • {p.branch?.name ?? 'Semua Cabang'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-neutral-500">Status Kontrak</span>
                                        <span className="font-semibold">{p.employment_status}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-neutral-500">Target Kuota</span>
                                        <span className="font-semibold">{p.quota} Orang</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-neutral-500">Rentang Gaji</span>
                                        <span className="font-semibold text-emerald-600">
                                            {formatRupiah(p.salary_range_min)} - {formatRupiah(p.salary_range_max)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">Pelamar Terdaftar</span>
                                        <span className="font-bold text-blue-600">{p.candidates_count ?? 0} Pelamar</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                Pelamar & Tahapan Rekrutmen (Pipeline ATS)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-900">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Nama Pelamar</th>
                                            <th className="px-4 py-3 font-medium">Lowongan Dilamar</th>
                                            <th className="px-4 py-3 font-medium">Kontak</th>
                                            <th className="px-4 py-3 font-medium">Ekspektasi Gaji</th>
                                            <th className="px-4 py-3 font-medium">Tahapan Seleksi</th>
                                            <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {candidates.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-sm text-neutral-500">
                                                    Belum ada pelamar di pipeline.
                                                </td>
                                            </tr>
                                        ) : (
                                            candidates.map((cand) => (
                                                <tr key={cand.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                                    <td className="px-4 py-3 font-medium">{cand.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs font-semibold">{cand.job_posting?.title}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs">
                                                        <div>{cand.email}</div>
                                                        <div className="text-neutral-400">{cand.phone_number ?? '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-mono font-medium">
                                                        {cand.expected_salary > 0 ? formatRupiah(cand.expected_salary) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Select
                                                            value={cand.stage}
                                                            onValueChange={(val) => handleUpdateStage(cand.id, val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs w-44">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {stages.map((s) => (
                                                                    <SelectItem key={s.value} value={s.value}>
                                                                        {s.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {cand.stage === 'OFFERING' && (
                                                            <Button
                                                                size="sm"
                                                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                                onClick={() => {
                                                                    setSelectedCandidate(cand);
                                                                    setHireForm({
                                                                        ...hireForm,
                                                                        agreed_salary: cand.expected_salary || 10000000,
                                                                    });
                                                                    setIsHireOpen(true);
                                                                }}
                                                            >
                                                                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                                                                Hire Jadi Karyawan
                                                            </Button>
                                                        )}
                                                        {cand.stage === 'HIRED' && cand.hired_employee && (
                                                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                                                                NIK: {cand.hired_employee.nik}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={isCreatePostingOpen} onOpenChange={setIsCreatePostingOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Buka Lowongan Pekerjaan Baru</DialogTitle>
                        <DialogDescription>
                            Tentukan judul, kuota alokasi tenaga kerja, dan rentang kompensasi.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePosting} className="space-y-4">
                        <div>
                            <Label htmlFor="posting_title">Judul Posisi Lowongan</Label>
                            <Input
                                id="posting_title"
                                placeholder="Contoh: Senior Full-Stack Engineer"
                                value={postingForm.title}
                                onChange={(e) => setPostingForm({ ...postingForm, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Departemen</Label>
                                <Select
                                    value={postingForm.department_id}
                                    onValueChange={(val) => setPostingForm({ ...postingForm, department_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih departemen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Cabang Penempatan</Label>
                                <Select
                                    value={postingForm.branch_id}
                                    onValueChange={(val) => setPostingForm({ ...postingForm, branch_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih cabang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="quota">Target Kuota MPP (Orang)</Label>
                                <Input
                                    id="quota"
                                    type="number"
                                    min="1"
                                    value={postingForm.quota}
                                    onChange={(e) => setPostingForm({ ...postingForm, quota: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="min_exp">Min. Pengalaman (Tahun)</Label>
                                <Input
                                    id="min_exp"
                                    type="number"
                                    min="0"
                                    value={postingForm.min_experience_years}
                                    onChange={(e) => setPostingForm({ ...postingForm, min_experience_years: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sal_min">Gaji Minimal (IDR)</Label>
                                <Input
                                    id="sal_min"
                                    type="number"
                                    step="500000"
                                    value={postingForm.salary_range_min}
                                    onChange={(e) => setPostingForm({ ...postingForm, salary_range_min: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="sal_max">Gaji Maksimal (IDR)</Label>
                                <Input
                                    id="sal_max"
                                    type="number"
                                    step="500000"
                                    value={postingForm.salary_range_max}
                                    onChange={(e) => setPostingForm({ ...postingForm, salary_range_max: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="desc">Deskripsi Tanggung Jawab Pekerjaan</Label>
                            <Input
                                id="desc"
                                placeholder="Tanggung jawab utama posisi..."
                                value={postingForm.description}
                                onChange={(e) => setPostingForm({ ...postingForm, description: e.target.value })}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreatePostingOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Terbitkan Lowongan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Input Pelamar Baru ke Pipeline</DialogTitle>
                        <DialogDescription>
                            Masukkan identitas dan CV kandidat untuk proses skrining HR.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleApply} className="space-y-4">
                        <div>
                            <Label>Pilih Lowongan</Label>
                            <Select
                                value={candidateForm.job_posting_id}
                                onValueChange={(val) => setCandidateForm({ ...candidateForm, job_posting_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih lowongan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {postings.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="cand_name">Nama Lengkap Pelamar</Label>
                            <Input
                                id="cand_name"
                                placeholder="Contoh: Dimas Aditya"
                                value={candidateForm.name}
                                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cand_email">Alamat Email</Label>
                                <Input
                                    id="cand_email"
                                    type="email"
                                    placeholder="dimas@email.com"
                                    value={candidateForm.email}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="cand_phone">Nomor Telepon / WhatsApp</Label>
                                <Input
                                    id="cand_phone"
                                    placeholder="08123456789"
                                    value={candidateForm.phone_number}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, phone_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="cand_sal">Ekspektasi Gaji Bulanan (IDR)</Label>
                            <Input
                                id="cand_sal"
                                type="number"
                                step="500000"
                                value={candidateForm.expected_salary}
                                onChange={(e) => setCandidateForm({ ...candidateForm, expected_salary: Number(e.target.value) })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="resume_file">Unggah Resume / CV (PDF)</Label>
                            <Input
                                id="resume_file"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setResumeFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Simpan ke Pipeline
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isHireOpen} onOpenChange={setIsHireOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hire Kandidat Menjadi Karyawan Resmi</DialogTitle>
                        <DialogDescription>
                            Kandidat: {selectedCandidate?.name} ({selectedCandidate?.email})
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleHire} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Cabang Penempatan</Label>
                                <Select
                                    value={hireForm.branch_id}
                                    onValueChange={(val) => setHireForm({ ...hireForm, branch_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Departemen</Label>
                                <Select
                                    value={hireForm.department_id}
                                    onValueChange={(val) => setHireForm({ ...hireForm, department_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Posisi Jabatan</Label>
                            <Select
                                value={hireForm.position_id}
                                onValueChange={(val) => setHireForm({ ...hireForm, position_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="hire_date">Tanggal Mulai Bekerja</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={hireForm.join_date}
                                    onChange={(e) => setHireForm({ ...hireForm, join_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="hire_salary">Gaji Disepakati (IDR)</Label>
                                <Input
                                    id="hire_salary"
                                    type="number"
                                    step="500000"
                                    value={hireForm.agreed_salary}
                                    onChange={(e) => setHireForm({ ...hireForm, agreed_salary: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsHireOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                Konfirmasi Hire Karyawan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

