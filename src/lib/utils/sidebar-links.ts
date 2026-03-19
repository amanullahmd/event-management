/**
 * Sidebar link utilities
 * This file provides sidebar link configurations for different user roles
 */

import {
  LayoutDashboard,
  Users,
  Settings,
  Ticket,
  QrCode,
  ShoppingCart,
  User,
  RefreshCw,
  Calendar,
  Building2,
  CreditCard,
  PieChart,
  BarChart3,
  UsersRound,
  Store,
  MessageCircle,
  HeadphonesIcon,
  Video,
  ShieldCheck,
} from 'lucide-react';
import React from 'react';

export interface SidebarLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  description?: string;
}

/**
 * Get role-specific sidebar links with icons
 */
export function getRoleSidebarLinks(role?: string): SidebarLink[] {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return [
        { 
          label: 'Dashboard', 
          href: '/admin', 
          icon: React.createElement(LayoutDashboard, { className: 'w-5 h-5' }),
          description: 'Overview & metrics'
        },
        { 
          label: 'Users', 
          href: '/admin/users', 
          icon: React.createElement(Users, { className: 'w-5 h-5' }),
          description: 'Manage user accounts'
        },
        { 
          label: 'Organizers', 
          href: '/admin/organizers', 
          icon: React.createElement(Building2, { className: 'w-5 h-5' }),
          description: 'Organizer verification'
        },
        { 
          label: 'Events', 
          href: '/admin/events', 
          icon: React.createElement(Calendar, { className: 'w-5 h-5' }),
          description: 'All platform events'
        },
        { 
          label: 'Orders', 
          href: '/admin/orders', 
          icon: React.createElement(CreditCard, { className: 'w-5 h-5' }),
          description: 'Transaction history'
        },
        { 
          label: 'Analytics', 
          href: '/admin/analytics', 
          icon: React.createElement(PieChart, { className: 'w-5 h-5' }),
          description: 'Platform analytics'
        },
        {
          label: 'Support',
          href: '/admin/support',
          icon: React.createElement(HeadphonesIcon, { className: 'w-5 h-5' }),
          description: 'Support tickets'
        },
        {
          label: 'Team Chat',
          href: '/admin/chat',
          icon: React.createElement(MessageCircle, { className: 'w-5 h-5' }),
          description: 'Admin group chat'
        },
        {
          label: 'Team',
          href: '/admin/team',
          icon: React.createElement(ShieldCheck, { className: 'w-5 h-5' }),
          description: 'Admin team & permissions'
        },
        {
          label: 'Videos',
          href: '/admin/videos',
          icon: React.createElement(Video, { className: 'w-5 h-5' }),
          description: 'Video moderation queue'
        },
        {
          label: 'Settings',
          href: '/admin/settings',
          icon: React.createElement(Settings, { className: 'w-5 h-5' }),
          description: 'System configuration'
        },
        {
          label: 'Profile',
          href: '/admin/profile',
          icon: React.createElement(User, { className: 'w-5 h-5' }),
          description: 'Account settings'
        },
      ];
    case 'ORGANIZER':
      return [
        { 
          label: 'Dashboard', 
          href: '/organizer', 
          icon: React.createElement(LayoutDashboard, { className: 'w-5 h-5' }),
          description: 'Your overview'
        },
        { 
          label: 'My Events', 
          href: '/organizer/events', 
          icon: React.createElement(Calendar, { className: 'w-5 h-5' }),
          description: 'Manage your events'
        },
        { 
          label: 'Analytics', 
          href: '/organizer/analytics', 
          icon: React.createElement(BarChart3, { className: 'w-5 h-5' }),
          description: 'Sales & insights'
        },
        { 
          label: 'Tickets', 
          href: '/organizer/tickets', 
          icon: React.createElement(Ticket, { className: 'w-5 h-5' }),
          description: 'Ticket management'
        },
        { 
          label: 'Check-in', 
          href: '/organizer/checkin', 
          icon: React.createElement(QrCode, { className: 'w-5 h-5' }),
          description: 'QR code scanner'
        },
        {
          label: 'My Team',
          href: '/organizer/teams',
          icon: React.createElement(UsersRound, { className: 'w-5 h-5' }),
          description: 'Manage your organization'
        },
        {
          label: 'Team Chat',
          href: '/organizer/chat',
          icon: React.createElement(MessageCircle, { className: 'w-5 h-5' }),
          description: 'Group team messaging'
        },
        {
          label: 'Video Updates',
          href: '/organizer/video-notifications',
          icon: React.createElement(Video, { className: 'w-5 h-5' }),
          description: 'Send video notifications'
        },
        {
          label: 'Get Help',
          href: '/organizer/support',
          icon: React.createElement(HeadphonesIcon, { className: 'w-5 h-5' }),
          description: 'Contact support'
        },
        {
          label: 'Refunds',
          href: '/organizer/refunds',
          icon: React.createElement(RefreshCw, { className: 'w-5 h-5' }),
          description: 'Process refunds'
        },
        {
          label: 'Profile',
          href: '/organizer/profile',
          icon: React.createElement(User, { className: 'w-5 h-5' }),
          description: 'Account settings'
        },
      ];
    case 'CUSTOMER':
      return [
        { 
          label: 'Dashboard', 
          href: '/dashboard', 
          icon: React.createElement(LayoutDashboard, { className: 'w-5 h-5' }),
          description: 'Your overview'
        },
        {
          label: 'My Tickets',
          href: '/dashboard/tickets',
          icon: React.createElement(Ticket, { className: 'w-5 h-5' }),
          description: 'View your tickets'
        },
        {
          label: 'Resale Market',
          href: '/dashboard/marketplace',
          icon: React.createElement(Store, { className: 'w-5 h-5' }),
          description: 'Buy & sell tickets'
        },
        {
          label: 'Orders',
          href: '/dashboard/orders',
          icon: React.createElement(ShoppingCart, { className: 'w-5 h-5' }),
          description: 'Purchase history'
        },
        {
          label: 'Get Help',
          href: '/dashboard/support',
          icon: React.createElement(HeadphonesIcon, { className: 'w-5 h-5' }),
          description: 'Contact support'
        },
        {
          label: 'Profile',
          href: '/dashboard/profile',
          icon: React.createElement(User, { className: 'w-5 h-5' }),
          description: 'Account settings'
        },
      ];
    default:
      return [];
  }
}

