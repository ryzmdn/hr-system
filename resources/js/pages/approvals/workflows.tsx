import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    GitBranch,
    Shield,
    UserCheck,
    Users,
} from 'lucide-react';
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
import type { WorkflowItem } from '@/types/hris';

interface Props {
    workflows: WorkflowItem[];
}

export default function ApprovalWorkflows({ workflows }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Pusat Approval', href: '/dashboard/approvals' },
                { title: 'Alur Workflow', href: '/dashboard/approvals/workflows' },
            ]}
        >
            <Head title="Konfigurasi Alur Persetujuan (Workflow Engine)" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                            Konfigurasi Alur Workflow Persetujuan
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Visualisasi skema persetujuan berjenjang (multi-level approval) berdasarkan struktur jabatan dan otorisasi peran.
                        </p>
                    </div>
                    <Link href="/dashboard/approvals">
                        <Button variant="outline" size="sm">
                            Buka Kotak Masuk Persetujuan
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {workflows.map((wf) => (
                        <Card key={wf.id} className="border-neutral-200 dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                                            <GitBranch className="size-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base font-semibold">{wf.name}</CardTitle>
                                                <Badge variant="outline" className="text-xs">
                                                    {wf.module_label}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs">{wf.description}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={wf.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400' : ''}
                                    >
                                        {wf.is_active ? 'Workflow Aktif' : 'Non-Aktif'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row md:items-center gap-3 overflow-x-auto pt-2 pb-1">
                                    {wf.steps.map((step, idx) => (
                                        <div key={step.id} className="flex items-center gap-3">
                                            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/50 min-w-[240px]">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-mono font-semibold text-neutral-500 uppercase">
                                                        Langkah {step.step_order}
                                                    </span>
                                                    <CheckCircle2 className="size-3.5 text-neutral-400" />
                                                </div>
                                                <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                                    {step.name}
                                                </div>
                                                <div className="mt-1 text-xs text-neutral-500">
                                                    {step.approver_type_label}
                                                    {step.role_name && ` (${step.role_name})`}
                                                    {step.user_name && ` (${step.user_name})`}
                                                </div>
                                            </div>

                                            {idx < wf.steps.length - 1 && (
                                                <ArrowRight className="size-5 text-neutral-400 hidden md:block shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

