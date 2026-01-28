'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TicketTypeFormProps {
  onSubmit: (data: {
    name: string;
    price: number;
    quantity: number;
    type: 'vip' | 'regular' | 'early-bird';
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: {
    name: string;
    price: number;
    quantity: number;
    type: 'vip' | 'regular' | 'early-bird';
  };
}

/**
 * Ticket Type Form Component
 * Form for creating and editing ticket types
 */
export function TicketTypeForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}: TicketTypeFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      price: 0,
      quantity: 0,
      type: 'regular' as const,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ticket type name is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formData);
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'quantity'
          ? parseFloat(value) || 0
          : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const ticketTypes = ['early-bird', 'regular', 'vip'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ticket Type Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Ticket Type Name *
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., VIP Pass, General Admission"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Price and Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Price ($) *
          </label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {errors.price}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Quantity *
          </label>
          <Input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className={errors.quantity ? 'border-red-500' : ''}
          />
          {errors.quantity && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {errors.quantity}
            </p>
          )}
        </div>
      </div>

      {/* Ticket Type Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Ticket Category
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ticketTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Saving...' : 'Save Ticket Type'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
