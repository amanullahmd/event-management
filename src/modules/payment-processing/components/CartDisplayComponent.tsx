'use client';

import React, { useState } from 'react';
import { CartResponse, CartItemResponse } from '../types/cart';

interface CartDisplayComponentProps {
  cart: CartResponse;
  onUpdateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  onRemoveItem: (cartItemId: string) => Promise<void>;
  onCheckout: () => void;
  isLoading?: boolean;
  error?: string;
}

/**
 * CartDisplayComponent
 * Component for displaying cart contents and allowing modifications
 */
export function CartDisplayComponent({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isLoading = false,
  error,
}: CartDisplayComponentProps) {
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    setUpdatingItemId(cartItemId);
    try {
      if (newQuantity === 0) {
        await onRemoveItem(cartItemId);
      } else {
        await onUpdateQuantity(cartItemId, newQuantity);
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setRemovingItemId(cartItemId);
    try {
      await onRemoveItem(cartItemId);
    } finally {
      setRemovingItemId(null);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Your cart is empty</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Add tickets to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Cart Items ({cart.items.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {cart.items.map((item) => (
            <div
              key={item.cartItemId}
              className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {item.ticketTypeName}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {formatPrice(item.unitPrice)} each
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.cartItemId, item.quantity - 1)
                    }
                    disabled={updatingItemId === item.cartItemId || isLoading}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>

                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.cartItemId,
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={updatingItemId === item.cartItemId || isLoading}
                    className="w-12 text-center border border-slate-300 dark:border-slate-600 rounded px-2 py-1 dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  <button
                    onClick={() =>
                      handleQuantityChange(item.cartItemId, item.quantity + 1)
                    }
                    disabled={updatingItemId === item.cartItemId || isLoading}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right min-w-[100px]">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(item.lineTotal)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.cartItemId)}
                  disabled={removingItemId === item.cartItemId || isLoading}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Order Summary
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>

          {cart.discountAmount && cart.discountAmount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount {cart.appliedPromoCode && `(${cart.appliedPromoCode})`}</span>
              <span>-{formatPrice(cart.discountAmount)}</span>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between text-lg font-semibold text-slate-900 dark:text-white">
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={isLoading || cart.items.length === 0}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
}

