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
import { 
  ShoppingCart, 
  ArrowLeft, 
  CheckCircle, 
  Ticket, 
  Calendar, 
  MapPin, 
  CreditCard,
  Shield,
  Trash2,
  Minus,
  Plus,
  User,
  Mail,
  Phone,
  Home,
  Sparkles
} from 'lucide-react';

export const dynamic = 'force-dynamic';

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
      const orderTickets = items.flatMap((item) =>
        Array.from({ length: item.quantity }, (_, index) => ({
          id: `ticket-${Date.now()}-${index}`,
          ticketTypeId: item.ticketTypeId,
          quantity: 1,
          qrCode: `QR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          checkedIn: false,
        }))
      );

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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your purchase. Your tickets are on their way!
            </p>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{orderId}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
              <Mail className="w-4 h-4" />
              <span>Confirmation sent to {billingInfo.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && (
                <Link href="/dashboard/orders">
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white">
                    <Ticket className="w-4 h-4 mr-2" /> View My Orders
                  </Button>
                </Link>
              )}
              <Link href="/events">
                <Button variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white">
                  Browse More Events
                </Button>
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Add some tickets to your cart to proceed with checkout.
            </p>
            <Link href="/events">
              <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white">
                <Ticket className="w-4 h-4 mr-2" /> Browse Events
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <Link href="/events" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Checkout</h1>
              <p className="text-white/80">{items.reduce((t, i) => t + i.quantity, 0)} tickets in your cart</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items & Billing Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                Your Tickets
              </h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const event = events[item.eventId];
                  return (
                    <div
                      key={item.ticketTypeId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
                            {event?.category?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {event?.name || 'Event'}
                            </h3>
                            <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                              {item.ticketType.name} - ${item.ticketType.price.toFixed(2)} each
                            </p>
                            {event && (
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" /> {formatDate(event.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" /> {event.location.split(',')[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200"
                            onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-10 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200"
                            onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white w-20 text-right">
                          ${(item.ticketType.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.ticketTypeId)}
                          aria-label="Remove item"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Billing Information Form */}
            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                Billing Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={billingInfo.firstName}
                      onChange={handleInputChange}
                      className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.firstName ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    />
                    {errors.firstName && (
                      <p id="firstName-error" className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={billingInfo.lastName}
                      onChange={handleInputChange}
                      className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.lastName ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    />
                    {errors.lastName && (
                      <p id="lastName-error" className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email *</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={billingInfo.email}
                      onChange={handleInputChange}
                      className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.email ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone *</span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={billingInfo.phone}
                      onChange={handleInputChange}
                      className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.phone ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Address *</span>
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={billingInfo.address}
                    onChange={handleInputChange}
                    className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.address ? 'border-red-500' : ''}`}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? 'address-error' : undefined}
                  />
                  {errors.address && (
                    <p id="address-error" className="text-sm text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
                    <Input
                      id="city"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.city ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? 'city-error' : undefined}
                    />
                    {errors.city && (
                      <p id="city-error" className="text-sm text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                    <Input
                      id="state"
                      name="state"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.state ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.state}
                      aria-describedby={errors.state ? 'state-error' : undefined}
                    />
                    {errors.state && (
                      <p id="state-error" className="text-sm text-red-500 mt-1">{errors.state}</p>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code *</label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      className={`bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white ${errors.zipCode ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.zipCode}
                      aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
                    />
                    {errors.zipCode && (
                      <p id="zipCode-error" className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* Submit button for mobile */}
                <div className="lg:hidden pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white h-12 text-lg font-semibold"
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
            <div className="sticky top-4 space-y-4">
              <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Service Fee (10%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">${getFees().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-slate-600 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-violet-600 dark:text-violet-400">${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit button for desktop */}
                <div className="hidden lg:block">
                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white h-12 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Purchase'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </Card>

              {/* Trust Badges */}
              <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Secure Checkout</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">SSL Encrypted Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">Instant E-Ticket Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">100% Money-Back Guarantee</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
