import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    Clock,
    History,
    LogIn,
    LogOut,
    MapPin,
    Navigation,
    RotateCcw,
    ShieldAlert,
    Smartphone,
    UserCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

interface Props {
    employee: {
        id: number;
        name: string;
        nik: string;
        branch: {
            name: string;
            latitude: number;
            longitude: number;
            radius_meters: number;
            timezone: string;
        };
    };
    todayRoster: {
        shift_name: string;
        start_time: string;
        end_time: string;
        is_off_day: boolean;
    } | null;
    summary: {
        clock_in_at: string | null;
        clock_out_at: string | null;
        late_minutes: number;
        status: string;
        status_label: string;
    } | null;
    recentLogs: {
        id: number;
        type: string;
        type_label: string;
        recorded_at: string;
        is_within_geofence: boolean;
        distance_meters: number;
        verification_status: string;
    }[];
}

export default function EssAttendance({
    employee,
    todayRoster,
    summary,
    recentLogs,
}: Props) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
    const [isLocating, setIsLocating] = useState<boolean>(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    const detectLocation = () => {
        setIsLocating(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Perangkat Anda tidak mendukung geolokasi GPS.');
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = pos.coords.latitude;
                const userLon = pos.coords.longitude;
                setUserLocation({ latitude: userLat, longitude: userLon });

                const dist = calculateDistance(
                    userLat,
                    userLon,
                    employee.branch.latitude,
                    employee.branch.longitude,
                );
                setDistanceMeters(dist);
                setIsLocating(false);
            },
            (err) => {
                setLocationError('Izin akses lokasi GPS ditolak atau sinyal satelit lemah.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
    };

    useEffect(() => {
        detectLocation();
    }, [employee.branch.latitude, employee.branch.longitude]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 480, height: 480 },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch (err) {
            alert('Tidak dapat mengakses kamera perangkat untuk verifikasi selfie.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 400, 400);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedSelfie(dataUrl);
            stopCamera();
        }
    };

    const handleClockAction = (type: 'clock-in' | 'clock-out') => {
        if (!userLocation) {
            alert('Lokasi GPS belum terdeteksi. Silakan aktifkan izin lokasi.');
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/dashboard/ess/attendance/${type}`,
            {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                selfie: capturedSelfie,
                device_info: navigator.userAgent,
                is_mock_location: false,
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    setCapturedSelfie(null);
                },
            },
        );
    };

    const isWithinRadius = distanceMeters !== null && distanceMeters <= employee.branch.radius_meters;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Presensi Mandiri (ESS)', href: '/dashboard/ess/attendance' },
            ]}
        >
            <Head title="Presensi Mandiri (ESS Mobile)" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 max-w-2xl mx-auto w-full">
                <div className="text-center space-y-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                        {employee.branch.name} • {employee.branch.timezone}
                    </span>
                    <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                        {currentTime || '--:--:--'}
                    </div>
                    <div className="text-xs text-neutral-500">
                        Jadwal Shift: <strong className="text-neutral-900 dark:text-neutral-100">{todayRoster?.shift_name || 'Reguler'}</strong> ({todayRoster?.start_time?.slice(0, 5)} - {todayRoster?.end_time?.slice(0, 5)})
                    </div>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-neutral-500" />
                                <CardTitle className="text-sm font-semibold">Validasi Radius Lokasi (Geofencing)</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={detectLocation}
                                disabled={isLocating}
                                className="h-7 text-xs gap-1"
                            >
                                <Navigation className={`size-3 ${isLocating ? 'animate-spin' : ''}`} />
                                Refresk GPS
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLocating ? (
                            <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900 rounded-lg animate-pulse">
                                Mendeteksi koordinat satelit GPS perangkat Anda...
                            </div>
                        ) : locationError ? (
                            <div className="flex items-center gap-2 p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{locationError}</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/50 text-xs">
                                <div>
                                    <span className="text-neutral-500 block">Jarak ke Kantor Cabang:</span>
                                    <span className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                        {distanceMeters} Meter
                                    </span>
                                    <span className="text-neutral-400 block text-[11px]">
                                        (Batas Radius Maksimal: {employee.branch.radius_meters}m)
                                    </span>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={isWithinRadius ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}
                                >
                                    {isWithinRadius ? 'Dalam Radius Kantor' : 'Luar Radius Kantor'}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Camera className="size-4 text-neutral-500" />
                            <CardTitle className="text-sm font-semibold">Verifikasi Wajah / Selfie (Anti-Spoofing)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isCameraActive ? (
                            <div className="flex flex-col items-center space-y-3">
                                <div className="relative size-48 overflow-hidden rounded-full border-4 border-emerald-500 shadow-md">
                                    <video ref={videoRef} autoPlay playsInline className="size-full object-cover" />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={capturePhoto} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                                        <Camera className="size-4" />
                                        Ambil Foto Sekarang
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={stopCamera}>
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        ) : capturedSelfie ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={capturedSelfie}
                                        alt="Selfie Preview"
                                        className="size-14 rounded-full object-cover border-2 border-emerald-500"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                            <CheckCircle2 className="size-3.5" />
                                            Foto Selfie Siap
                                        </div>
                                        <span className="text-[11px] text-neutral-400">Siap dilampirkan ke log absensi</span>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" onClick={startCamera} className="gap-1 text-xs">
                                    <RotateCcw className="size-3.5" />
                                    Foto Ulang
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center p-4 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                                <Camera className="size-8 mx-auto text-neutral-400 mb-2 opacity-50" />
                                <p className="text-xs text-neutral-500 mb-3">
                                    Ambil foto selfie langsung untuk verifikasi kehadiran resmi.
                                </p>
                                <Button size="sm" variant="outline" onClick={startCamera} className="gap-1.5 text-xs">
                                    <Camera className="size-3.5" />
                                    Buka Kamera Selfie
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Button
                        size="lg"
                        disabled={isSubmitting || summary?.clock_in_at !== null}
                        onClick={() => handleClockAction('clock-in')}
                        className="h-16 flex-col gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                        <div className="flex items-center gap-1.5 font-bold text-base">
                            <LogIn className="size-5" />
                            Clock In (Masuk)
                        </div>
                        <span className="text-[11px] font-normal opacity-90">
                            {summary?.clock_in_at ? `Tercatat: ${summary.clock_in_at}` : 'Tap saat tiba di kantor'}
                        </span>
                    </Button>

                    <Button
                        size="lg"
                        disabled={isSubmitting || summary?.clock_in_at === null || summary?.clock_out_at !== null}
                        onClick={() => handleClockAction('clock-out')}
                        variant="outline"
                        className="h-16 flex-col gap-1 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <div className="flex items-center gap-1.5 font-bold text-base text-neutral-900 dark:text-neutral-100">
                            <LogOut className="size-5" />
                            Clock Out (Pulang)
                        </div>
                        <span className="text-[11px] font-normal text-neutral-500">
                            {summary?.clock_out_at ? `Tercatat: ${summary.clock_out_at}` : 'Tap saat selesai kerja'}
                        </span>
                    </Button>
                </div>

                <Card className="border-neutral-200 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <History className="size-4 text-neutral-500" />
                            <CardTitle className="text-sm font-semibold">Riwayat Absensi Terakhir</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentLogs.length > 0 ? (
                            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                                {recentLogs.map((log) => (
                                    <div key={log.id} className="py-2.5 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                {log.type_label}
                                            </div>
                                            <div className="text-neutral-500">
                                                {log.recorded_at} ({log.distance_meters}m dari kantor)
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={log.is_within_geofence ? 'text-emerald-600 border-emerald-300' : 'text-amber-600 border-amber-300'}
                                        >
                                            {log.is_within_geofence ? 'Valid Geofence' : 'Luar Radius'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 py-3 text-center">
                                Belum ada rekaman riwayat presensi terbaru.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

