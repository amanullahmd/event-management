/**
 * Type definitions for Organizer Trust Profiles feature
 */

export interface OrganizerTrustProfile {
  id: string;
  organizerId: string;
  name: string;
  bio: string;
  profilePictureUrl?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationBadgeDisplayed: boolean;
  trustScore: number;
  totalReviews: number;
  memberSinceDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventHistoryItem {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  ticketSalesCount: number;
  status: 'completed' | 'cancelled' | 'upcoming';
  createdAt: string;
}

export interface PerformanceMetrics {
  id: string;
  organizerId: string;
  totalEventsCreated: number;
  completedEvents: number;
  cancelledEvents: number;
  eventCompletionRate: number;
  totalAttendance: number;
  averageAttendanceRate: number;
  averageTicketSalesPerEvent: number;
  memberSinceDate: string;
  lastUpdatedAt: string;
}

export interface Review {
  id: string;
  organizerId: string;
  attendeeId: string;
  attendeeName: string;
  eventId: string;
  rating: number;
  content?: string;
  status: 'pending_moderation' | 'approved' | 'rejected';
  moderationReason?: string;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  organizerId: string;
  eventId: string;
  rating: number;
  content?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
}

export interface VerificationApplication {
  id: string;
  organizerId: string;
  identityProofUrl: string;
  businessRegistrationUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  reviewDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVerificationApplicationRequest {
  identityProofUrl: string;
  businessRegistrationUrl: string;
}

export interface VisibilitySettings {
  id: string;
  organizerId: string;
  eventHistoryVisible: boolean;
  performanceMetricsVisible: boolean;
  reviewsVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVisibilitySettingsRequest {
  eventHistoryVisible?: boolean;
  performanceMetricsVisible?: boolean;
  reviewsVisible?: boolean;
}
