/**
 * User type definitions for the Event Management & Ticketing System
 */

export type UserRole = 'admin' | 'organizer' | 'customer';
export type UserStatus = 'active' | 'blocked';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  profileImage?: string;
}

export interface OrganizerProfile extends User {
  role: 'organizer';
  businessName: string;
  verificationStatus: VerificationStatus;
  documents: Document[];
  commissionRate: number;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface AuthUser extends User {
  token?: string;
}
