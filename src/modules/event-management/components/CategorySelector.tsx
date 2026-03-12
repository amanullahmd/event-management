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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <div className="flex items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800/50" role="status" aria-label="Loading categories">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <div className="p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
          <button
            type="button"
            onClick={loadCategories}
            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Category
        </legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {categories.map((category) => {
            const isSelected = value === category.id;
            return (
              <label
                key={category.id}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 min-h-[90px] ${
                  isSelected
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20 ring-1 ring-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={isSelected}
                  onChange={() => onChange(category.id)}
                  className="sr-only"
                  aria-label={category.name}
                />
                {category.iconName && (
                  <span className="text-2xl mb-1.5" aria-hidden="true">{category.iconName}</span>
                )}
                <span className={`text-xs font-medium text-center leading-tight ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {category.name}
                </span>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Clear selection
          </button>
        )}
      </fieldset>
    </div>
  );
};

export default CategorySelector;
