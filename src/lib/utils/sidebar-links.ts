/**
 * Sidebar link utilities
 */

export interface SidebarLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

/**
 * Get role-specific sidebar links
 */
export function getRoleSidebarLinks(role?: string): SidebarLink[] {
  switch (role) {
    case 'admin':
      return [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Organizers', href: '/admin/organizers' },
        { label: 'Events', href: '/admin/events' },
        { label: 'Orders', href: '/admin/orders' },
        { label: 'Settings', href: '/admin/settings' },
      ];
    case 'organizer':
      return [
        { label: 'Dashboard', href: '/organizer' },
        { label: 'Events', href: '/organizer/events' },
        { label: 'Analytics', href: '/organizer/analytics' },
        { label: 'Check-in', href: '/organizer/checkin' },
      ];
    case 'customer':
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tickets', href: '/dashboard/tickets' },
        { label: 'Orders', href: '/dashboard/orders' },
        { label: 'Profile', href: '/dashboard/profile' },
      ];
    default:
      return [];
  }
}
