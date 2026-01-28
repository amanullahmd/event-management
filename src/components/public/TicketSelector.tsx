'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const getTicketTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return <Badge className="bg-purple-500">VIP</Badge>;
      case 'early-bird':
        return <Badge className="bg-green-500">Early Bird</Badge>;
      default:
        return <Badge variant="secondary">Regular</Badge>;
    }
  };


  return (
    <div className="space-y-4">
      {ticketTypes.map((ticketType) => {
        const available = getAvailable(ticketType);
        const quantity = getQuantity(ticketType.id);
        const isSoldOut = available === 0;

        return (
          <div
            key={ticketType.id}
            className={`border rounded-lg p-4 ${
              isSoldOut ? 'bg-gray-50 opacity-60' : 'bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{ticketType.name}</h3>
                  {getTicketTypeBadge(ticketType.type)}
                </div>
                <p className="text-sm text-gray-600">
                  {isSoldOut ? 'Sold Out' : `${available} available`}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ${ticketType.price.toFixed(2)}
              </p>
            </div>

            {!isSoldOut && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(ticketType.id, -1)}
                    disabled={quantity === 0}
                    aria-label={`Decrease ${ticketType.name} quantity`}
                  >
                    -
                  </Button>
                  <span
                    className="w-8 text-center font-medium"
                    aria-label={`${ticketType.name} quantity: ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(ticketType.id, 1)}
                    disabled={quantity >= available}
                    aria-label={`Increase ${ticketType.name} quantity`}
                  >
                    +
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(ticketType)}
                  disabled={quantity === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                  aria-label={`Add ${quantity} ${ticketType.name} tickets to cart`}
                >
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {ticketTypes.length === 0 && (
        <p className="text-center text-gray-600 py-4">
          No tickets available for this event.
        </p>
      )}
    </div>
  );
}

export default TicketSelector;
