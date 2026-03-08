'use client';

import { DashboardLayout } from '@/modules/shared-common/components/common/DashboardLayout';
import { getRoleSidebarLinks } from '@/lib/utils/sidebar-links';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebarLinks={getRoleSidebarLinks('ADMIN')} pageTitle="">
      {children}
    </DashboardLayout>
  );
}
