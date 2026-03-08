'use client';

import { DashboardLayout } from '@/modules/shared-common/components/common/DashboardLayout';
import { RoleGuard } from '@/modules/shared-common/components/common/RoleGuard';
import { getRoleSidebarLinks } from '@/lib/utils/sidebar-links';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ORGANIZER']}>
      <DashboardLayout sidebarLinks={getRoleSidebarLinks('ORGANIZER')} pageTitle="">
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
