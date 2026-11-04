import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    Calendar,
    CalendarCheck,
    CheckSquare,
    Clock,
    Flame,
    FolderGit2,
    GitBranch,
    LayoutGrid,
    ShieldAlert,
    Smartphone,
    Users,
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'ESS Presensi Mobile',
        href: '/ess/attendance',
        icon: Smartphone,
    },
    {
        title: 'Pengajuan Cuti',
        href: '/leaves',
        icon: CalendarCheck,
    },
    {
        title: 'Lembur (SPL)',
        href: '/overtime',
        icon: Flame,
    },
    {
        title: 'Monitoring Presensi',
        href: '/attendance',
        icon: Clock,
    },
    {
        title: 'Jadwal & Roster Shift',
        href: '/attendance/roster',
        icon: Calendar,
    },
    {
        title: 'Direktori Karyawan',
        href: '/employees',
        icon: Users,
    },
    {
        title: 'Organisasi & Cabang',
        href: '/organization',
        icon: Building2,
    },
    {
        title: 'Pusat Approval',
        href: '/approvals',
        icon: CheckSquare,
    },
    {
        title: 'Alur Workflow',
        href: '/approvals/workflows',
        icon: GitBranch,
    },
    {
        title: 'Jejak Audit Log',
        href: '/audit-logs',
        icon: ShieldAlert,
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
        href: '/organization',
        icon: BookOpen,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
