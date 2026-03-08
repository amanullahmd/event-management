'use client';

import { DashboardLayout } from '@/modules/shared-common/components/common/DashboardLayout';
import { RoleGuard } from '@/modules/shared-common/components/common/RoleGuard';
import { getRoleSidebarLinks } from '@/lib/utils/sidebar-links';

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['CUSTOMER']}>
      <DashboardLayout sidebarLinks={getRoleSidebarLinks('CUSTOMER')} pageTitle="">
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
