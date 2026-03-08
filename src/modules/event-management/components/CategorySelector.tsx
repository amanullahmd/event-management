'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  displayOrder: number;
  active: boolean;
}

export interface CategorySelectorProps {
  value?: string;          // selected categoryId
  onChange: (categoryId: string | null) => void;
  disabled?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  if (loading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg" role="status" aria-label="Loading categories">
          <svg
            className="animate-spin h-5 w-5 text-blue-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="p-4 border border-red-300 rounded-lg bg-red-50">
          <p className="text-sm text-red-600" role="alert">{error}</p>
          <button
            type="button"
            onClick={loadCategories}
            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <fieldset disabled={disabled}>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          Category
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                value === category.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={value === category.id}
                onChange={() => onChange(category.id)}
                className="sr-only"
                aria-label={category.name}
              />
              <div className="flex items-center gap-2">
                {category.iconName && (
                  <span className="text-lg" aria-hidden="true">{category.iconName}</span>
                )}
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </div>
            </label>
          ))}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear selection
          </button>
        )}
      </fieldset>
    </div>
  );
};

export default CategorySelector;
