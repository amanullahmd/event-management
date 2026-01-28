'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { getEventById, createOrder } from '@/lib/dummy-data';
import type { Event } from '@/lib/types';

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * Checkout page
 * Displays cart items, order summary, and billing form
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */
export default function CheckoutPage() {
  const { items, getSubtotal, getFees, getTotal, clearCart, removeItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Load event details for cart items
  useEffect(() => {
    const eventMap: Record<string, Event> = {};
    items.forEach((item) => {
      if (!eventMap[item.eventId]) {
        const event = getEventById(item.eventId);
        if (event) {
          eventMap[item.eventId] = event;
        }
      }
    });
    setEvents(eventMap);
    setIsLoading(false);
  }, [items]);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setBillingInfo((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!billingInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!billingInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!billingInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!billingInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!billingInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!billingInfo.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!billingInfo.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!billingInfo.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order tickets
      const orderTickets = items.flatMap((item) =>
        Array.from({ length: item.quantity }, (_, index) => ({
          id: `ticket-${Date.now()}-${index}`,
          ticketTypeId: item.ticketTypeId,
          quantity: 1,
          qrCode: `QR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          checkedIn: false,
        }))
      );

      // Create the order
      const order = createOrder({
        customerId: user?.id || 'guest',
        eventId: items[0]?.eventId || '',
        tickets: orderTickets,
        totalAmount: getTotal(),
        status: 'completed',
        paymentMethod: 'credit_card',
        createdAt: new Date(),
      });

      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Order confirmation view
  if (orderComplete && orderId) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-lg font-mono font-semibold">{orderId}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              A confirmation email has been sent to {billingInfo.email}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && (
                <Link href="/dashboard/orders">
                  <Button>View My Orders</Button>
                </Link>
              )}
              <Link href="/events">
                <Button variant="outline">Browse More Events</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🛒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-6">
              Add some tickets to your cart to proceed with checkout.
            </p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items & Billing Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Your Tickets
              </h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const event = events[item.eventId];
                  return (
                    <div
                      key={item.ticketTypeId}
                      className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {event?.name || 'Event'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.ticketType.name} - ${item.ticketType.price.toFixed(2)} each
                        </p>
                        {event && (
                          <p className="text-sm text-gray-500">
                            {formatDate(event.date)} • {event.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </Button>
                        </div>
                        <p className="font-semibold w-20 text-right">
                          ${(item.ticketType.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.ticketTypeId)}
                          aria-label="Remove item"
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Billing Information Form */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Billing Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={billingInfo.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'border-red-500' : ''}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    />
                    {errors.firstName && (
                      <p id="firstName-error" className="text-sm text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={billingInfo.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'border-red-500' : ''}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    />
                    {errors.lastName && (
                      <p id="lastName-error" className="text-sm text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={billingInfo.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'border-red-500' : ''}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={billingInfo.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'border-red-500' : ''}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-sm text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={billingInfo.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'border-red-500' : ''}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? 'address-error' : undefined}
                  />
                  {errors.address && (
                    <p id="address-error" className="text-sm text-red-500 mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'border-red-500' : ''}
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? 'city-error' : undefined}
                    />
                    {errors.city && (
                      <p id="city-error" className="text-sm text-red-500 mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <Input
                      id="state"
                      name="state"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      className={errors.state ? 'border-red-500' : ''}
                      aria-invalid={!!errors.state}
                      aria-describedby={errors.state ? 'state-error' : undefined}
                    />
                    {errors.state && (
                      <p id="state-error" className="text-sm text-red-500 mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      className={errors.zipCode ? 'border-red-500' : ''}
                      aria-invalid={!!errors.zipCode}
                      aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
                    />
                    {errors.zipCode && (
                      <p id="zipCode-error" className="text-sm text-red-500 mt-1">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit button for mobile */}
                <div className="lg:hidden pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : `Complete Purchase - $${getTotal().toFixed(2)}`}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Fee (10%)</span>
                    <span>${getFees().toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit button for desktop */}
                <div className="hidden lg:block">
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Purchase'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  By completing this purchase, you agree to our Terms of Service
                  and Privacy Policy.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
