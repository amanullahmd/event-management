'use client';

import { DashboardLayout } from '@/modules/shared-common/components/common/DashboardLayout';
import { RoleGuard } from '@/modules/shared-common/components/common/RoleGuard';
import { getRoleSidebarLinks } from '@/lib/utils/sidebar-links';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <DashboardLayout sidebarLinks={getRoleSidebarLinks('ADMIN')} pageTitle="">
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
