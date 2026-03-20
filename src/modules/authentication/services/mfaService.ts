/**
 * MFA API service — wraps all /auth/mfa/* endpoints.
 * Authenticated endpoints use apiRequest() for automatic JWT injection.
 * The /auth/mfa/verify endpoint is public (called from mfa-verify page via AuthContext).
 */

import { apiRequest } from '../../shared-common/utils/api';

export interface MfaStatusResponse {
  mfaEnabled: boolean;
  primaryMethod: string | null;
  enabledMethods: string[];
  totpConfigured: boolean;
  smsConfigured: boolean;
  maskedPhone: string | null;
}

export interface MfaSetupInitResponse {
  secret: string;
  qrUri: string;
}

// ─── TOTP ─────────────────────────────────────────────────────────────────────

export async function initiateTotpSetup(): Promise<MfaSetupInitResponse> {
  const data = await apiRequest<MfaSetupInitResponse>('/auth/mfa/totp/setup', {
    method: 'POST',
  });
  if (!data) throw new Error('TOTP setup failed');
  return data;
}

export async function confirmTotpSetup(code: string): Promise<void> {
  await apiRequest('/auth/mfa/totp/confirm', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// ─── SMS ──────────────────────────────────────────────────────────────────────

export async function initiateSmsSetup(phoneNumber: string): Promise<string> {
  const data = await apiRequest<{ mfaChallengeId: string }>('/auth/mfa/sms/setup', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
  if (!data?.mfaChallengeId) throw new Error('SMS setup failed');
  return data.mfaChallengeId;
}

export async function confirmSmsSetup(challengeId: string, code: string): Promise<void> {
  await apiRequest('/auth/mfa/sms/confirm', {
    method: 'POST',
    body: JSON.stringify({ challengeId, code }),
  });
}

// ─── Status & Disable ─────────────────────────────────────────────────────────

export async function getMfaStatus(): Promise<MfaStatusResponse> {
  const data = await apiRequest<MfaStatusResponse>('/auth/mfa/status');
  if (!data) throw new Error('Failed to load MFA status');
  return data;
}

export async function disableMfa(method: string, password: string): Promise<void> {
  await apiRequest('/auth/mfa/disable', {
    method: 'POST',
    body: JSON.stringify({ method, password }),
  });
}
