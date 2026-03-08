/**
 * Property-based tests for sidebar link configuration
 * Feature: frontend-role-based-dashboard, Property 7: Sidebar displays correct links for each role
 *
 * Validates: Requirements 5.1, 5.2, 5.3
 */

import * as fc from 'fast-check';
import { getRoleSidebarLinks, SidebarLink } from '../../../../../lib/utils/sidebar-links';

// Expected link configurations per role
const ADMIN_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Organizers', href: '/admin/organizers' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Profile', href: '/admin/profile' },
];

const ORGANIZER_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Dashboard', href: '/organizer' },
  { label: 'My Events', href: '/organizer/events' },
  { label: 'Analytics', href: '/organizer/analytics' },
  { label: 'Tickets', href: '/organizer/tickets' },
  { label: 'Check-in', href: '/organizer/checkin' },
  { label: 'Refunds', href: '/organizer/refunds' },
  { label: 'Profile', href: '/organizer/profile' },
];

const CUSTOMER_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Tickets', href: '/dashboard/tickets' },
  { label: 'Orders', href: '/dashboard/orders' },
  { label: 'Profile', href: '/dashboard/profile' },
];

const EXPECTED_LINKS: Record<string, Array<{ label: string; href: string }>> = {
  ADMIN: ADMIN_LINKS,
  ORGANIZER: ORGANIZER_LINKS,
  CUSTOMER: CUSTOMER_LINKS,
};

/**
 * Property 7: Sidebar displays correct links for each role
 *
 * For any user role (ADMIN, ORGANIZER, CUSTOMER), getRoleSidebarLinks returns
 * exactly the specified navigation links with correct labels and href paths.
 *
 * Validates: Requirements 5.1, 5.2, 5.3
 */
describe('Property 7: Sidebar displays correct links for each role', () => {
  it('returns the exact number of links for each role', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ADMIN', 'ORGANIZER', 'CUSTOMER'),
        (role) => {
          const links = getRoleSidebarLinks(role);
          const expected = EXPECTED_LINKS[role];
          return links.length === expected.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns links with correct hrefs for each role', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ADMIN', 'ORGANIZER', 'CUSTOMER'),
        (role) => {
          const links = getRoleSidebarLinks(role);
          const expectedHrefs = EXPECTED_LINKS[role].map((l) => l.href);
          const actualHrefs = links.map((l: SidebarLink) => l.href);
          return expectedHrefs.every((href) => actualHrefs.includes(href));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns links with correct labels for each role', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ADMIN', 'ORGANIZER', 'CUSTOMER'),
        (role) => {
          const links = getRoleSidebarLinks(role);
          const expectedLabels = EXPECTED_LINKS[role].map((l) => l.label);
          const actualLabels = links.map((l: SidebarLink) => l.label);
          return expectedLabels.every((label) => actualLabels.includes(label));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns links where each label matches the expected href for that role', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ADMIN', 'ORGANIZER', 'CUSTOMER'),
        (role) => {
          const links = getRoleSidebarLinks(role);
          const expected = EXPECTED_LINKS[role];
          return expected.every(({ label, href }) => {
            const match = links.find((l: SidebarLink) => l.label === label);
            return match !== undefined && match.href === href;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns no extra links beyond the specified set for each role', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ADMIN', 'ORGANIZER', 'CUSTOMER'),
        (role) => {
          const links = getRoleSidebarLinks(role);
          const expectedHrefs = new Set(EXPECTED_LINKS[role].map((l) => l.href));
          return links.every((l: SidebarLink) => expectedHrefs.has(l.href));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('is case-insensitive for role input', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ADMIN', 'ORGANIZER', 'CUSTOMER'),
        (role) => {
          const upperLinks = getRoleSidebarLinks(role);
          const lowerLinks = getRoleSidebarLinks(role.toLowerCase());
          return (
            upperLinks.length === lowerLinks.length &&
            upperLinks.every((l: SidebarLink, i: number) => l.href === lowerLinks[i].href)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
