'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart, Sparkles, Clock, Ticket } from 'lucide-react';
import type { TicketType } from '@/lib/types';

interface TicketSelectorProps {
  ticketTypes: TicketType[];
  onAddToCart: (ticketType: TicketType, quantity: number) => void;
}

/**
 * Ticket type selector component
 * Displays available ticket types with prices and quantity selector
 * Requirements: 17.3, 17.4
 */
export function TicketSelector({ ticketTypes, onAddToCart }: TicketSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getAvailable = (ticketType: TicketType) => {
    return ticketType.quantity - ticketType.sold;
  };

  const getQuantity = (ticketTypeId: string) => {
    return quantities[ticketTypeId] || 0;
  };

  const handleQuantityChange = (ticketTypeId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const ticketType = ticketTypes.find((t) => t.id === ticketTypeId);
      const available = ticketType ? getAvailable(ticketType) : 0;
      const newQuantity = Math.max(0, Math.min(available, current + delta));
      return { ...prev, [ticketTypeId]: newQuantity };
    });
  };

  const handleAddToCart = (ticketType: TicketType) => {
    const quantity = getQuantity(ticketType.id);
    if (quantity > 0) {
      onAddToCart(ticketType, quantity);
      setQuantities((prev) => ({ ...prev, [ticketType.id]: 0 }));
    }
  };

  const getTicketTypeConfig = (type: string) => {
    switch (type) {
      case 'vip':
        return { 
          badge: <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">VIP</Badge>,
          icon: <Sparkles className="w-4 h-4" />,
          gradient: 'from-purple-500 to-pink-500'
        };
      case 'early-bird':
        return { 
          badge: <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">Early Bird</Badge>,
          icon: <Clock className="w-4 h-4" />,
          gradient: 'from-green-500 to-emerald-500'
        };
      default:
        return { 
          badge: <Badge className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-0">Regular</Badge>,
          icon: <Ticket className="w-4 h-4" />,
          gradient: 'from-violet-500 to-fuchsia-500'
        };
    }
  };

  return (
    <div className="space-y-3">
      {ticketTypes.map((ticketType) => {
        const available = getAvailable(ticketType);
        const quantity = getQuantity(ticketType.id);
        const isSoldOut = available === 0;
        const config = getTicketTypeConfig(ticketType.type);

        return (
          <div
            key={ticketType.id}
            className={`border rounded-xl p-4 transition-all ${
              isSoldOut 
                ? 'bg-gray-50 dark:bg-slate-800/50 opacity-60 border-gray-200 dark:border-slate-700' 
                : 'bg-white dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 hover:border-violet-300 dark:hover:border-violet-500'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ticketType.name}</h3>
                  {config.badge}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isSoldOut ? (
                    <span className="text-red-500 dark:text-red-400 font-medium">Sold Out</span>
                  ) : (
                    <span>{available} tickets available</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${ticketType.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">per ticket</p>
              </div>
            </div>

            {!isSoldOut && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-600">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleQuantityChange(ticketType.id, -1)}
                    disabled={quantity === 0}
                    aria-label={`Decrease ${ticketType.name} quantity`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span
                    className="w-10 text-center font-semibold text-gray-900 dark:text-white"
                    aria-label={`${ticketType.name} quantity: ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleQuantityChange(ticketType.id, 1)}
                    disabled={quantity >= available}
                    aria-label={`Increase ${ticketType.name} quantity`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(ticketType)}
                  disabled={quantity === 0}
                  className={`rounded-lg font-medium ${
                    quantity > 0 
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white' 
                      : 'bg-gray-100 dark:bg-slate-600 text-gray-400 dark:text-gray-500'
                  }`}
                  aria-label={`Add ${quantity} ${ticketType.name} tickets to cart`}
                >
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                  Add to Cart
                </Button>
              </div>
            )}

            {isSoldOut && (
              <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
                <Button
                  size="sm"
                  disabled
                  className="w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                >
                  Sold Out
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {ticketTypes.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Ticket className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            No tickets available for this event.
          </p>
        </div>
      )}
    </div>
  );
}

export default TicketSelector;
