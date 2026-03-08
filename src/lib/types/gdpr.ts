/**
 * GDPR consent and data minimization type definitions
 */

export type ConsentType =
  | 'MARKETING_EMAILS'
  | 'ANALYTICS'
  | 'PROFILING'
  | 'THIRD_PARTY_SHARING'
  | 'LOCATION_TRACKING';

export interface ConsentPreference {
  consentType: ConsentType;
  granted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
  description: string;
}

export interface ConsentStatusResponse {
  preferences: ConsentPreference[];
  lastUpdated: string | null;
}

export interface ConsentAuditEntry {
  id: string;
  userId: string;
  consentType: ConsentType;
  action: 'GRANTED' | 'REVOKED';
  previousState: boolean | null;
  newState: boolean;
  source: string;
  reason: string | null;
  createdAt: string;
}

export interface FieldPolicy {
  fieldName: string;
  dataCategory: string;
  purpose: string;
  required: boolean;
  retentionDays: number | null;
  legalBasis: string;
  description: string;
}

export interface DataMinimizationReport {
  totalPolicies: number;
  requiredFields: number;
  optionalFields: number;
  policies: FieldPolicy[];
}

