'use client';

import React, { createContext, useContext, useState } from 'react';
import type { TicketType } from '../types/event';

/**
 * Cart item representing a ticket type with quantity
 */
export interface CartItem {
  ticketTypeId: string;
  eventId: string;
  ticketType: TicketType;
  quantity: number;
}

/**
 * Cart context for managing shopping cart state
 */
export interface CartContextType {
  items: CartItem[];
  addItem: (ticketType: TicketType, eventId: string, quantity: number) => void;
  removeItem: (ticketTypeId: string) => void;
  updateQuantity: (ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getFees: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider component that wraps the application with cart context
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (ticketType: TicketType, eventId: string, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.ticketTypeId === ticketType.id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.ticketTypeId === ticketType.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          ticketTypeId: ticketType.id,
          eventId,
          ticketType,
          quantity,
        },
      ];
    });
  };

  const removeItem = (ticketTypeId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.ticketTypeId !== ticketTypeId)
    );
  };

  const updateQuantity = (ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(ticketTypeId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.ticketTypeId === ticketTypeId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      return total + item.ticketType.price * item.quantity;
    }, 0);
  };

  const getFees = () => {
    // Calculate fees as 10% of subtotal
    return getSubtotal() * 0.1;
  };

  const getTotal = () => {
    return getSubtotal() + getFees();
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getSubtotal,
    getFees,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart context
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
