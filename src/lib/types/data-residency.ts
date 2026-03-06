/**
 * Data Residency and Retention type definitions
 */

export interface RetentionPolicy {
  id: string;
  policyName: string;
  dataType: string;
  description: string | null;
  retentionDays: number;
  action: 'DELETE' | 'ARCHIVE';
  archiveLocation: string | null;
  isActive: boolean;
  legalBasis: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRetentionPolicyRequest {
  policyName: string;
  dataType: string;
  description?: string;
  retentionDays: number;
  action: 'DELETE' | 'ARCHIVE';
  archiveLocation?: string;
  legalBasis?: string;
}

export interface UpdateRetentionPolicyRequest {
  policyName?: string;
  description?: string;
  retentionDays?: number;
  action?: string;
  archiveLocation?: string;
  legalBasis?: string;
  isActive?: boolean;
}

export interface RetentionExecutionLog {
  id: string;
  policyId: string;
  policyName: string;
  dataType: string;
  action: string;
  recordsProcessed: number;
  recordsDeleted: number;
  recordsArchived: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  executedBy: string;
}

export interface RegionDetail {
  region: string;
  displayName: string;
  active: boolean;
  isPrimary: boolean;
  replicationLagSeconds: number | null;
  userCount: number;
}

export interface RegionalStorageSummary {
  totalRegions: number;
  activeRegions: number;
  totalResidencyPolicies: number;
  usersPerRegion: Record<string, number>;
  regions: RegionDetail[];
}

