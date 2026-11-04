import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CreditCard,
    DollarSign,
    Lock,
    Save,
    Shield,
    User,
    UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Props {
    branches: { id: number; name: string }[];
    departments: { id: number; name: string }[];
    positions: { id: number; name: string; department_id: number }[];
    managers: { id: number; name: string; nik: string }[];
    roles: { id: number; name: string; code: string }[];
    taxPtkpStatuses: string[];
    employmentStatuses: { value: string; label: string }[];
}

export default function EmployeeCreate({
    branches,
    departments,
    positions,
    managers,
    roles,
    taxPtkpStatuses,
    employmentStatuses,
}: Props) {
    const form = useForm({
        nik: '',
        name: '',
        email: '',
        phone_number: '',
        id_card_number: '',
        tax_number: '',
        bank_name: 'BCA',
        bank_account_number: '',
        bank_account_holder: '',
        gender: 'MALE',
        birth_place: '',
        birth_date: '',
        marital_status: 'SINGLE',
        tax_ptkp_status: 'TK/0',
        employment_status: 'PROBATION',
        join_date: new Date().toISOString().split('T')[0],
        probation_end_date: '',
        contract_end_date: '',
        current_branch_id: branches[0]?.id ? String(branches[0].id) : '',
        current_department_id: departments[0]?.id ? String(departments[0].id) : '',
        current_position_id: positions[0]?.id ? String(positions[0].id) : '',
        current_manager_id: '',
        base_salary: '',
        create_user_account: true,
        user_password: '',
        role_id: roles.find((r) => r.code === 'employee')?.id ? String(roles.find((r) => r.code === 'employee')!.id) : '',
    });

    const filteredPositions = positions.filter(
        (p) => !form.data.current_department_id || p.department_id === Number(form.data.current_department_id),
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/employees');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Direktori Karyawan', href: '/employees' },
                { title: 'Tambah Karyawan Baru', href: '/employees/create' },
            ]}
        >
            <Head title="Tambah Karyawan Baru" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/employees">
                            <Button variant="outline" size="sm" className="size-8 p-0">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Onboarding Karyawan Baru
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Input biodata, data finansial/pajak terenkripsi AES-256, dan struktur remunerasi awal.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <User className="size-5 text-neutral-500" />
                                <div>
                                    <CardTitle className="text-base font-semibold">1. Identitas Pribadi</CardTitle>
                                    <CardDescription>Informasi pokok sesuai kartu tanda penduduk</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nik">NIK Karyawan (ID Perusahaan)</Label>
                                    <Input
                                        id="nik"
                                        value={form.data.nik}
                                        onChange={(e) => form.setData('nik', e.target.value)}
                                        placeholder="Contoh: TMB-021"
                                        required
                                    />
                                    {form.errors.nik && <p className="text-xs text-red-500">{form.errors.nik}</p>}
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="name">Nama Lengkap (Sesuai KTP)</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Nama lengkap tanpa gelar"
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email Perusahaan / Aktif</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="karyawan@tmb-enterprise.co.id"
                                        required
                                    />
                                    {form.errors.email && <p className="text-xs text-red-500">{form.errors.email}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                                    <Input
                                        id="phone"
                                        value={form.data.phone_number}
                                        onChange={(e) => form.setData('phone_number', e.target.value)}
                                        placeholder="+62812345678"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Jenis Kelamin</Label>
                                    <Select
                                        value={form.data.gender}
                                        onValueChange={(val) => form.setData('gender', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Laki-Laki</SelectItem>
                                            <SelectItem value="FEMALE">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="birth_place">Tempat Lahir</Label>
                                    <Input
                                        id="birth_place"
                                        value={form.data.birth_place}
                                        onChange={(e) => form.setData('birth_place', e.target.value)}
                                        placeholder="Kota Kelahiran"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="birth_date">Tanggal Lahir</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={form.data.birth_date}
                                        onChange={(e) => form.setData('birth_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Status Pernikahan</Label>
                                    <Select
                                        value={form.data.marital_status}
                                        onValueChange={(val) => form.setData('marital_status', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status Pernikahan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SINGLE">Lajang / Belum Menikah</SelectItem>
                                            <SelectItem value="MARRIED">Menikah</SelectItem>
                                            <SelectItem value="DIVORCED">Cerai Hidup</SelectItem>
                                            <SelectItem value="WIDOWED">Cerai Mati</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Status Pajak PTKP</Label>
                                    <Select
                                        value={form.data.tax_ptkp_status}
                                        onValueChange={(val) => form.setData('tax_ptkp_status', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih PTKP" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {taxPtkpStatuses.map((st) => (
                                                <SelectItem key={st} value={st}>
                                                    {st}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="size-5 text-neutral-500" />
                                <div>
                                    <CardTitle className="text-base font-semibold">2. Data Finansial, Perbankan & Pajak (Terenkripsi)</CardTitle>
                                    <CardDescription>Disimpan menggunakan enkripsi tingkat kolom AES-256 (Kepatuhan UU PDP)</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="id_card_number">Nomor Induk Kependudukan (NIK KTP 16 Digit)</Label>
                                    <Input
                                        id="id_card_number"
                                        maxLength={16}
                                        value={form.data.id_card_number}
                                        onChange={(e) => form.setData('id_card_number', e.target.value)}
                                        placeholder="3171xxxxxxxxxxxx"
                                        required
                                    />
                                    {form.errors.id_card_number && <p className="text-xs text-red-500">{form.errors.id_card_number}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="tax_number">Nomor Pokok Wajib Pajak (NPWP 16 Digit)</Label>
                                    <Input
                                        id="tax_number"
                                        value={form.data.tax_number}
                                        onChange={(e) => form.setData('tax_number', e.target.value)}
                                        placeholder="01.xxx.xxx.x-xxx.xxx"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="bank_name">Nama Bank Payroll</Label>
                                    <Input
                                        id="bank_name"
                                        value={form.data.bank_name}
                                        onChange={(e) => form.setData('bank_name', e.target.value)}
                                        placeholder="BCA / Mandiri / BNI / BRI"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="bank_acc">Nomor Rekening</Label>
                                    <Input
                                        id="bank_acc"
                                        value={form.data.bank_account_number}
                                        onChange={(e) => form.setData('bank_account_number', e.target.value)}
                                        placeholder="1234567890"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="bank_holder">Nama Pemilik Rekening</Label>
                                    <Input
                                        id="bank_holder"
                                        value={form.data.bank_account_holder}
                                        onChange={(e) => form.setData('bank_account_holder', e.target.value)}
                                        placeholder="Sesuai buku tabungan"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <DollarSign className="size-5 text-neutral-500" />
                                <div>
                                    <CardTitle className="text-base font-semibold">3. Penempatan Organisasi & Remunerasi Awal</CardTitle>
                                    <CardDescription>Penugasan cabang, divisi, serta riwayat gaji awal dengan effective dating</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Kantor Cabang</Label>
                                    <Select
                                        value={form.data.current_branch_id}
                                        onValueChange={(val) => form.setData('current_branch_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Cabang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)}>
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Divisi / Departemen</Label>
                                    <Select
                                        value={form.data.current_department_id}
                                        onValueChange={(val) => form.setData('current_department_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Divisi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem key={d.id} value={String(d.id)}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Posisi Jabatan</Label>
                                    <Select
                                        value={form.data.current_position_id}
                                        onValueChange={(val) => form.setData('current_position_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Jabatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredPositions.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Atasan Langsung (Manager)</Label>
                                    <Select
                                        value={form.data.current_manager_id || 'none'}
                                        onValueChange={(val) => form.setData('current_manager_id', val === 'none' ? '' : val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Atasan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Tanpa Atasan Langsung</SelectItem>
                                            {managers.map((m) => (
                                                <SelectItem key={m.id} value={String(m.id)}>
                                                    {m.name} ({m.nik})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Status Ikatan Kerja</Label>
                                    <Select
                                        value={form.data.employment_status}
                                        onValueChange={(val) => form.setData('employment_status', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Status Kerja" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employmentStatuses.map((st) => (
                                                <SelectItem key={st.value} value={st.value}>
                                                    {st.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="join_date">Tanggal Mulai Bekerja</Label>
                                    <Input
                                        id="join_date"
                                        type="date"
                                        value={form.data.join_date}
                                        onChange={(e) => form.setData('join_date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="prob_date">Selesai Probation (Opsional)</Label>
                                    <Input
                                        id="prob_date"
                                        type="date"
                                        value={form.data.probation_end_date}
                                        onChange={(e) => form.setData('probation_end_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="base_salary">Gaji Pokok Awal (IDR)</Label>
                                    <Input
                                        id="base_salary"
                                        type="number"
                                        value={form.data.base_salary}
                                        onChange={(e) => form.setData('base_salary', e.target.value)}
                                        placeholder="Contoh: 15000000"
                                        required
                                    />
                                    {form.errors.base_salary && <p className="text-xs text-red-500">{form.errors.base_salary}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="size-5 text-neutral-500" />
                                <div>
                                    <CardTitle className="text-base font-semibold">4. Akun Pengguna Portal (ESS / MSS)</CardTitle>
                                    <CardDescription>Kredensial login aplikasi untuk absensi dan pengajuan mandiri</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="create_user"
                                    checked={form.data.create_user_account}
                                    onCheckedChange={(checked) => form.setData('create_user_account', Boolean(checked))}
                                />
                                <Label htmlFor="create_user" className="text-sm font-normal cursor-pointer">
                                    Buatkan akun login pengguna secara otomatis menggunakan email perusahaan di atas.
                                </Label>
                            </div>

                            {form.data.create_user_account && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pass">Kata Sandi Awal</Label>
                                        <Input
                                            id="pass"
                                            type="password"
                                            value={form.data.user_password}
                                            onChange={(e) => form.setData('user_password', e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            required={form.data.create_user_account}
                                        />
                                        {form.errors.user_password && <p className="text-xs text-red-500">{form.errors.user_password}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Peran Hak Akses (Role)</Label>
                                        <Select
                                            value={form.data.role_id}
                                            onValueChange={(val) => form.setData('role_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Peran" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((r) => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        {r.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link href="/employees">
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" disabled={form.processing} className="gap-2">
                            <Save className="size-4" />
                            Simpan Data Karyawan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

