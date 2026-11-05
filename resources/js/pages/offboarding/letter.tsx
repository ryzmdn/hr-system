import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    FileCheck2,
    Printer,
    QrCode,
    ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ExperienceLetterItem } from '@/types/hris';

interface Props {
    letter: ExperienceLetterItem;
}

export default function ExperienceLetterPage({ letter }: Props) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-8 print:p-0 print:bg-white flex flex-col items-center">
            <Head title={`Surat Pengalaman Kerja - ${letter.employee?.name}`} />

            <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak / Simpan PDF
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-4xl rounded-2xl border bg-white p-12 text-neutral-900 shadow-md print:border-none print:shadow-none print:p-0 print:rounded-none">
                <div className="border-b-2 border-neutral-800 pb-6 text-center">
                    <h2 className="text-xl font-bold tracking-widest uppercase text-neutral-800">
                        PT ENTERPRISE PRIMA INDONESIA
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                        Gedung Menara Mandiri, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan 12190
                    </p>
                    <p className="text-xs text-neutral-400">
                        Telepon: (021) 5299-8800 • Email: hr@enterprise.id • Website: https://enterprise.id
                    </p>
                </div>

                <div className="my-8 text-center space-y-1">
                    <h1 className="text-xl font-bold tracking-wider uppercase underline">
                        SURAT PENGALAMAN KERJA
                    </h1>
                    <p className="text-sm italic text-neutral-600 font-serif">
                        Certificate of Employment
                    </p>
                    <p className="text-xs font-mono font-medium text-neutral-500 pt-1">
                        Nomor: {letter.letter_number}
                    </p>
                </div>

                <div className="my-8 text-sm leading-relaxed space-y-6 text-neutral-800">
                    <p>
                        Yang bertanda tangan di bawah ini, Manajemen Human Resources PT Enterprise Prima Indonesia, dengan ini menerangkan dengan sebenarnya bahwa:
                    </p>

                    <div className="pl-6 space-y-2 border-l-2 border-neutral-300">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-neutral-600">Nama Lengkap</span>
                            <span className="col-span-2 font-bold text-neutral-900">: {letter.employee?.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-neutral-600">Nomor Induk Karyawan</span>
                            <span className="col-span-2 font-mono font-semibold">: {letter.employee?.nik}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-neutral-600">Jabatan Terakhir</span>
                            <span className="col-span-2 font-semibold">: {letter.last_position}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-neutral-600">Departemen / Divisi</span>
                            <span className="col-span-2 font-semibold">: {letter.last_department}</span>
                        </div>
                    </div>

                    <p>
                        Benar telah bekerja pada perusahaan kami terhitung sejak tanggal <span className="font-semibold">{formatDate(letter.start_date)}</span> sampai dengan tanggal <span className="font-semibold">{formatDate(letter.end_date)}</span>.
                    </p>

                    <p>
                        Selama masa pengabdian dan hubungan kerja di perusahaan kami, yang bersangkutan telah menunjukkan dedikasi, loyalitas, integritas, serta etos kerja yang sangat baik bagi kemajuan perusahaan.
                    </p>

                    <p>
                        Kami menyampaikan penghargaan dan terima kasih yang setinggi-tingginya atas seluruh kontribusi dan kerja sama yang telah diberikan, serta mendoakan semoga sukses dalam perjalanan karir dan masa depan selanjutnya.
                    </p>
                </div>

                <div className="mt-16 pt-8 grid grid-cols-2 gap-8 items-end">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-lg border p-3 bg-neutral-50 text-xs">
                            <QrCode className="h-10 w-10 text-neutral-800 shrink-0" />
                            <div>
                                <span className="font-semibold block text-[11px] text-neutral-900">
                                    Verifikasi Keaslian Dokumen
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono break-all block max-w-xs">
                                    Token: {letter.verification_token.substring(0, 24)}...
                                </span>
                                <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">
                                    ✓ Dokumen Resmi Terdaftar di HRIS
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right space-y-1 text-sm">
                        <p className="text-xs text-neutral-600">
                            Jakarta, {formatDate(letter.issued_date)}
                        </p>
                        <p className="text-xs font-semibold text-neutral-800">
                            PT ENTERPRISE PRIMA INDONESIA
                        </p>
                        <div className="h-20 flex items-center justify-end pr-8">
                            <div className="font-serif italic text-neutral-400 text-xs">
                                [Digital Signature Valid]
                            </div>
                        </div>
                        <p className="font-bold underline text-neutral-900">
                            HERDIAN SANTOSO, S.Psi., M.M.
                        </p>
                        <p className="text-xs text-neutral-500">
                            Head of People & Culture
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

