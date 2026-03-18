'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getEventById,
  getTicketTypeById,
  updateTicketType,
  deleteTicketType,
  type Event,
  type TicketType,
} from '@/modules/shared-common/services/apiService';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Trash2, ArrowLeft, Save } from 'lucide-react';

const CATEGORIES = [
  { value: 'GENERAL_ADMISSION', label: 'General Admission' },
  { value: 'VIP', label: 'VIP' },
  { value: 'EARLY_BIRD', label: 'Early Bird' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'GROUP', label: 'Group' },
  { value: 'CUSTOM', label: 'Custom' },
];

export default function EditTicketTypePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const ticketTypeId = params.ticketTypeId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketType, setTicketType] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'GENERAL_ADMISSION',
    price: 0,
    quantityLimit: 0,
    saleStartDate: '',
    saleEndDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventData, ttData] = await Promise.all([
          getEventById(eventId),
          getTicketTypeById(eventId, ticketTypeId),
        ]);
        setEvent(eventData || null);
        if (ttData) {
          setTicketType(ttData);
          const extended = ttData as TicketType & { saleStartDate?: string; saleEndDate?: string };
          setFormData({
            name: ttData.name || '',
            category: ttData.type || 'GENERAL_ADMISSION',
            price: ttData.price || 0,
            quantityLimit: ttData.quantity || 0,
            saleStartDate: extended.saleStartDate ? extended.saleStartDate.slice(0, 10) : '',
            saleEndDate: extended.saleEndDate ? extended.saleEndDate.slice(0, 10) : '',
          });
        }
      } catch (err) {
        setError('Failed to load ticket type');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [eventId, ticketTypeId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    if (formData.quantityLimit < 1) newErrors.quantityLimit = 'Quantity must be at least 1';
    if (formData.saleStartDate && formData.saleEndDate && formData.saleStartDate > formData.saleEndDate) {
      newErrors.saleEndDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateTicketType(eventId, ticketTypeId, {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        quantityLimit: formData.quantityLimit,
        saleStartDate: formData.saleStartDate || undefined,
        saleEndDate: formData.saleEndDate || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/organizer/events/${eventId}`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket type');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTicketType(eventId, ticketTypeId);
      router.push(`/organizer/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket type');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const field = (key: keyof typeof formData) => ({
    value: formData[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setFormData((prev) => ({ ...prev, [key]: val }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!ticketType || !event) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Ticket type not found.</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Ticket Type</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {event.title || event.name}
          </p>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300 font-medium">
          Ticket type updated successfully! Redirecting...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats banner */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex gap-6 text-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Sold</span>
          <p className="font-bold text-slate-900 dark:text-white text-lg">{ticketType.sold || 0}</p>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Available</span>
          <p className="font-bold text-slate-900 dark:text-white text-lg">
            {(ticketType.quantity || 0) - (ticketType.sold || 0)}
          </p>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">Revenue</span>
          <p className="font-bold text-green-600 dark:text-green-400 text-lg">
            ${((ticketType.sold || 0) * (ticketType.price || 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Ticket Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. VIP Pass, General Admission"
            {...field('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <select
            {...field('category')}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Price (USD) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...field('price')}
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Total Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              placeholder="100"
              {...field('quantityLimit')}
              className={errors.quantityLimit ? 'border-red-500' : ''}
            />
            {errors.quantityLimit && <p className="text-red-500 text-xs mt-1">{errors.quantityLimit}</p>}
            {ticketType.sold > 0 && formData.quantityLimit < ticketType.sold && (
              <p className="text-amber-600 text-xs mt-1">
                Warning: quantity is less than {ticketType.sold} already sold
              </p>
            )}
          </div>
        </div>

        {/* Sale dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Sale Start Date
            </label>
            <Input type="date" {...field('saleStartDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Sale End Date
            </label>
            <Input
              type="date"
              {...field('saleEndDate')}
              className={errors.saleEndDate ? 'border-red-500' : ''}
            />
            {errors.saleEndDate && <p className="text-red-500 text-xs mt-1">{errors.saleEndDate}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting || isSaving}
          className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Delete Ticket Type
        </button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || success}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Ticket Type?</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              This will permanently delete <strong>{ticketType.name}</strong>.
              {ticketType.sold > 0 && (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {' '}Warning: {ticketType.sold} tickets have already been sold.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
