import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    BarChart3,
    BookOpen,
    Building2,
    Calendar,
    CalendarCheck,
    CheckSquare,
    Clock,
    CreditCard,
    FileText,
    Flame,
    FolderGit2,
    GitBranch,
    Laptop,
    LayoutGrid,
    LogOut,
    Receipt,
    ShieldAlert,
    Smartphone,
    Target,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    roles: Array<{ id: number; code: string; name: string }>;
    is_super_admin: boolean;
}

interface PagePropsWithAuth {
    auth: {
        user: AuthUser | null;
        permissions: string[];
    };
    [key: string]: unknown;
}

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'ESS Presensi Mobile',
        href: '/dashboard/ess/attendance',
        icon: Smartphone,
        permission: 'attendance.clock',
    },
    {
        title: 'Pengajuan Cuti',
        href: '/dashboard/leaves',
        icon: CalendarCheck,
        permission: 'leave.view',
    },
    {
        title: 'Lembur (SPL)',
        href: '/dashboard/overtime',
        icon: Flame,
        permission: 'overtime.view',
    },
    {
        title: 'Slip Gaji Saya',
        href: '/dashboard/ess/payslips',
        icon: FileText,
        permission: 'payroll.view',
    },
    {
        title: 'Pinjaman & Kasbon',
        href: '/dashboard/loans',
        icon: CreditCard,
        permission: 'loan.view',
    },
    {
        title: 'Klaim & Reimbursement',
        href: '/dashboard/claims',
        icon: Wallet,
        permission: 'reimbursement.view',
    },
    {
        title: 'Pusat Approval',
        href: '/dashboard/approvals',
        icon: CheckSquare,
        permission: 'approval.inbox',
    },
    {
        title: 'Monitoring Presensi',
        href: '/dashboard/attendance',
        icon: Clock,
        permission: 'attendance.manage',
    },
    {
        title: 'Jadwal & Roster Shift',
        href: '/dashboard/attendance/roster',
        icon: Calendar,
        permission: 'attendance.manage',
    },
    {
        title: 'Direktori Karyawan',
        href: '/dashboard/employees',
        icon: Users,
        permission: 'employee.view',
    },
    {
        title: 'Organisasi & Cabang',
        href: '/dashboard/organization',
        icon: Building2,
        permission: 'org.view',
    },
    {
        title: 'Payroll & Gaji',
        href: '/dashboard/payroll',
        icon: Banknote,
        permission: 'payroll.calculate',
    },
    {
        title: 'Komponen Gaji',
        href: '/dashboard/payroll/components',
        icon: Receipt,
        permission: 'payroll.calculate',
    },
    {
        title: 'Inventaris Aset',
        href: '/dashboard/assets',
        icon: Laptop,
        permission: 'asset.view',
    },
    {
        title: 'Offboarding & Pesangon',
        href: '/dashboard/offboarding',
        icon: LogOut,
        permission: 'offboarding.manage',
    },
    {
        title: 'Rekrutmen & ATS',
        href: '/dashboard/recruitment',
        icon: UserPlus,
        permission: 'recruitment.view',
    },
    {
        title: 'Kinerja & KPI (OKR)',
        href: '/dashboard/performance',
        icon: Target,
        permission: 'performance.view',
    },
    {
        title: 'Analitik Eksekutif',
        href: '/dashboard/analytics',
        icon: BarChart3,
        permission: 'analytics.view',
    },
    {
        title: 'Alur Workflow',
        href: '/dashboard/approvals/workflows',
        icon: GitBranch,
        permission: 'approval.manage_workflow',
    },
    {
        title: 'Jejak Audit Log',
        href: '/dashboard/audit-logs',
        icon: ShieldAlert,
        permission: 'audit.view',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Dokumentasi HRIS',
        href: '/dashboard/organization',
        icon: BookOpen,
        permission: 'org.view',
    },
];

export function AppSidebar() {
    const { auth } = usePage<PagePropsWithAuth>().props;
    const permissions = auth?.permissions || [];
    const isSuperAdmin = Boolean(auth?.user?.is_super_admin) || permissions.includes('*');

    const filteredNavItems = mainNavItems.filter((item) => {
        if (isSuperAdmin) {
            return true;
        }
        if (item.permission && !permissions.includes(item.permission)) {
            return false;
        }
        if (item.roles && !item.roles.some((r) => auth?.user?.roles?.some((ur) => ur.code === r))) {
            return false;
        }
        return true;
    });

    const filteredFooterItems = footerNavItems.filter((item) => {
        if (isSuperAdmin) {
            return true;
        }
        if (item.permission && !permissions.includes(item.permission)) {
            return false;
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={filteredFooterItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
