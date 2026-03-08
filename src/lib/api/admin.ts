/**
 * Admin API service for fetching real data from backend
 */

import { apiRequest } from '@/modules/shared-common/utils/api';

// Dashboard metrics
export async function getDashboardMetrics(startDate?: string, endDate?: string) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiRequest(`/api/admin/fraud/metrics?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

// Users management
export async function getAllUsers() {
  try {
    const response = await apiRequest('/api/admin/users');
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const response = await apiRequest(`/api/admin/users/email/${encodeURIComponent(email)}`);
    return response;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    const response = await apiRequest('/api/admin/users/role', {
      method: 'PUT',
      body: JSON.stringify({ userId, role }),
    });
    return response;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Organizers
export async function getPendingOrganizers() {
  try {
    const response = await apiRequest('/api/admin/organizers/pending');
    return response;
  } catch (error) {
    console.error('Error fetching pending organizers:', error);
    throw error;
  }
}

export async function approveOrganizer(organizerId: string) {
  try {
    const response = await apiRequest(`/api/admin/organizers/${organizerId}/approve`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error approving organizer:', error);
    throw error;
  }
}

export async function rejectOrganizer(organizerId: string, reason?: string) {
  try {
    const response = await apiRequest(`/api/admin/organizers/${organizerId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return response;
  } catch (error) {
    console.error('Error rejecting organizer:', error);
    throw error;
  }
}

// Fraud metrics
export async function getFraudMetrics(startDate?: string, endDate?: string) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiRequest(`/api/admin/fraud/metrics?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching fraud metrics:', error);
    throw error;
  }
}

export async function getPendingTransactions() {
  try {
    const response = await apiRequest('/api/admin/fraud/transactions/pending');
    return response;
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    throw error;
  }
}

export async function getTransactionsByRiskLevel(riskLevel: string) {
  try {
    const response = await apiRequest(`/api/admin/fraud/transactions/by-risk-level?riskLevel=${encodeURIComponent(riskLevel)}`);
    return response;
  } catch (error) {
    console.error('Error fetching transactions by risk level:', error);
    throw error;
  }
}

