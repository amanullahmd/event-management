'use client';

import React, { useState } from 'react';
import { OrderResponse } from '../types/order';
import { DiscountResponse } from '@/lib/types/discount';

interface CheckoutUIComponentProps {
  order: OrderResponse;
  onSubmit: (checkoutData: CheckoutFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export interface CheckoutFormData {
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  billingAddressStreet: string;
  billingAddressCity: string;
  billingAddressState: string;
  billingAddressPostalCode: string;
  billingAddressCountry: string;
  promoCode?: string;
}

interface FormErrors {
  [key: string]: string;
}

/**
 * CheckoutUIComponent
 * Component for collecting attendee information and initiating payment
 */
export function CheckoutUIComponent({
  order,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}: CheckoutUIComponentProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
    billingAddressStreet: '',
    billingAddressCity: '',
    billingAddressState: '',
    billingAddressPostalCode: '',
    billingAddressCountry: '',
    promoCode: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountResponse | null>(null);
  const [promoCodeError, setPromoCodeError] = useState<string>('');
  const [applyingPromoCode, setApplyingPromoCode] = useState(false);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.attendeeName.trim()) {
      errors.attendeeName = 'Name is required';
    }

    if (!formData.attendeeEmail.trim()) {
      errors.attendeeEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.attendeeEmail)) {
      errors.attendeeEmail = 'Invalid email format';
    }

    if (!formData.attendeePhone.trim()) {
      errors.attendeePhone = 'Phone number is required';
    } else if (!/^\+?1?\d{9,15}$/.test(formData.attendeePhone.replace(/\D/g, ''))) {
      errors.attendeePhone = 'Invalid phone format';
    }

    if (!formData.billingAddressStreet.trim()) {
      errors.billingAddressStreet = 'Street address is required';
    }

    if (!formData.billingAddressCity.trim()) {
      errors.billingAddressCity = 'City is required';
    }

    if (!formData.billingAddressState.trim()) {
      errors.billingAddressState = 'State is required';
    }

    if (!formData.billingAddressPostalCode.trim()) {
      errors.billingAddressPostalCode = 'Postal code is required';
    }

    if (!formData.billingAddressCountry.trim()) {
      errors.billingAddressCountry = 'Country is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const totalAmount = order.totalAmountCents / 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Attendee Information Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Attendee Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="attendeeName"
                    value={formData.attendeeName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                      formErrors.attendeeName
                        ? 'border-red-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="John Doe"
                  />
                  {formErrors.attendeeName && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {formErrors.attendeeName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="attendeeEmail"
                    value={formData.attendeeEmail}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                      formErrors.attendeeEmail
                        ? 'border-red-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.attendeeEmail && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {formErrors.attendeeEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="attendeePhone"
                    value={formData.attendeePhone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                      formErrors.attendeePhone
                        ? 'border-red-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {formErrors.attendeePhone && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {formErrors.attendeePhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Billing Address
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="billingAddressStreet"
                    value={formData.billingAddressStreet}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                      formErrors.billingAddressStreet
                        ? 'border-red-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                    placeholder="123 Main St"
                  />
                  {formErrors.billingAddressStreet && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {formErrors.billingAddressStreet}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="billingAddressCity"
                      value={formData.billingAddressCity}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                        formErrors.billingAddressCity
                          ? 'border-red-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="New York"
                    />
                    {formErrors.billingAddressCity && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {formErrors.billingAddressCity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="billingAddressState"
                      value={formData.billingAddressState}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                        formErrors.billingAddressState
                          ? 'border-red-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="NY"
                    />
                    {formErrors.billingAddressState && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {formErrors.billingAddressState}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="billingAddressPostalCode"
                      value={formData.billingAddressPostalCode}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                        formErrors.billingAddressPostalCode
                          ? 'border-red-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="10001"
                    />
                    {formErrors.billingAddressPostalCode && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {formErrors.billingAddressPostalCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="billingAddressCountry"
                      value={formData.billingAddressCountry}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50 ${
                        formErrors.billingAddressCountry
                          ? 'border-red-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      placeholder="United States"
                    />
                    {formErrors.billingAddressCountry && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {formErrors.billingAddressCountry}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Promo Code
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  name="promoCode"
                  value={formData.promoCode}
                  onChange={handleInputChange}
                  disabled={isLoading || applyingPromoCode}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white disabled:opacity-50"
                  placeholder="Enter promo code"
                />
                <button
                  type="button"
                  disabled={isLoading || applyingPromoCode || !formData.promoCode}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {applyingPromoCode ? 'Applying...' : 'Apply'}
                </button>
              </div>

              {promoCodeError && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  {promoCodeError}
                </p>
              )}

              {appliedDiscount && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Discount applied: {appliedDiscount.discountName} (
                    {formatPrice(appliedDiscount.discountAmount)})
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
              >
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              {order.items && order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {item.ticketTypeName} x {item.quantity}
                  </span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {formatPrice((item.priceCents * item.quantity) / 100)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(appliedDiscount.discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

