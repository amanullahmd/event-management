/**
 * Pricing type definitions for the Event Management & Ticketing System
 */

export type PricingRuleType = 'FREE' | 'PAID' | 'DONATION';
export type AvailabilityStatus = 'AVAILABLE' | 'LOW_STOCK' | 'SOLD_OUT';
export type AuditAction = 'PRICING_RULE_CREATED' | 'PRICING_RULE_UPDATED' | 'TICKET_TYPE_SOLD_OUT' | 'TICKET_PURCHASE_REJECTED';

export interface PricingRule {
  id: string;
  ticketTypeId: string;
  pricingRuleType: PricingRuleType;
  price?: number;
  minimumDonation?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRuleRequest {
  pricingRuleType: PricingRuleType;
  price?: number;
  minimumDonation?: number;
}

export interface UpdatePricingRuleRequest {
  pricingRuleType?: PricingRuleType;
  price?: number;
  minimumDonation?: number;
}

export interface AvailabilityInfo {
  status: AvailabilityStatus;
  availability: number;
  availabilityPercentage: number;
  lowStockWarning: boolean;
  soldOutStatus: boolean;
}

export interface PricingAuditLog {
  id: string;
  ticketTypeId: string;
  eventId: string;
  organizerId?: string;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  rejectionReason?: string;
  timestamp: string;
}

export interface TicketTypeWithPricing {
  id: string;
  eventId: string;
  name: string;
  category: string;
  pricingRuleType: PricingRuleType;
  price?: number;
  minimumDonation?: number;
  quantityLimit: number;
  quantitySold: number;
  availability: number;
  availabilityPercentage: number;
  availabilityStatus: AvailabilityStatus;
  lowStockWarning: boolean;
  soldOutStatus: boolean;
  saleStartDate: string;
  saleEndDate: string;
  createdAt: string;
  updatedAt: string;
}

