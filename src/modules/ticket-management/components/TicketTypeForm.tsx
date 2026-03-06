'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TicketTypeFormProps {
  onSubmit: (data: {
    name: string;
    category: string;
    price: number;
    quantityLimit: number;
    saleStartDate: string;
    saleEndDate: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: {
    name: string;
    category: string;
    price: number;
    quantityLimit: number;
    saleStartDate: string;
    saleEndDate: string;
  };
}

/**
 * Ticket Type Form Component
 * Form for creating and editing ticket types with pricing, quantity limits, and sale periods
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
      category: 'GENERAL_ADMISSION',
      price: 0,
      quantityLimit: 0,
      saleStartDate: '',
      saleEndDate: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'GENERAL_ADMISSION', label: 'General Admission' },
    { value: 'VIP', label: 'VIP' },
    { value: 'EARLY_BIRD', label: 'Early Bird' },
    { value: 'STUDENT', label: 'Student' },
    { value: 'GROUP', label: 'Group' },
    { value: 'CUSTOM', label: 'Custom' },
  ];

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ticket type name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Ticket type name must be 100 characters or less';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.quantityLimit <= 0) {
      newErrors.quantityLimit = 'Quantity limit must be greater than 0';
    }

    if (!formData.saleStartDate) {
      newErrors.saleStartDate = 'Sale start date is required';
    }

    if (!formData.saleEndDate) {
      newErrors.saleEndDate = 'Sale end date is required';
    }

    if (formData.saleStartDate && formData.saleEndDate) {
      const startDate = new Date(formData.saleStartDate);
      const endDate = new Date(formData.saleEndDate);
      if (endDate <= startDate) {
        newErrors.saleEndDate = 'Sale end date must be after start date';
      }
      if (endDate < new Date()) {
        newErrors.saleEndDate = 'Sale end date must be in the future';
      }
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
        name === 'price' || name === 'quantityLimit'
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
          maxLength={100}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Category *
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
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

        {/* Quantity Limit */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Quantity Limit *
          </label>
          <Input
            type="number"
            name="quantityLimit"
            value={formData.quantityLimit}
            onChange={handleChange}
            placeholder="0"
            min="1"
            className={errors.quantityLimit ? 'border-red-500' : ''}
          />
          {errors.quantityLimit && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {errors.quantityLimit}
            </p>
          )}
        </div>
      </div>

      {/* Sale Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sale Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sale Start Date *
          </label>
          <Input
            type="datetime-local"
            name="saleStartDate"
            value={formData.saleStartDate}
            onChange={handleChange}
            className={errors.saleStartDate ? 'border-red-500' : ''}
          />
          {errors.saleStartDate && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {errors.saleStartDate}
            </p>
          )}
        </div>

        {/* Sale End Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sale End Date *
          </label>
          <Input
            type="datetime-local"
            name="saleEndDate"
            value={formData.saleEndDate}
            onChange={handleChange}
            className={errors.saleEndDate ? 'border-red-500' : ''}
          />
          {errors.saleEndDate && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {errors.saleEndDate}
            </p>
          )}
        </div>
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

