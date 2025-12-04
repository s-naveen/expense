'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExpenseCategory, ExpenseFormData, Expense, CATEGORY_SUBCATEGORIES, EXPENSE_CATEGORIES } from '@/types/expense';
import { calculateMonthlyCost, formatCurrency, generateAvatarUrl, generateId } from '@/lib/utils';
import { categorizeExpense } from '@/app/actions/categorize';
import { Sparkles, Loader2 } from 'lucide-react';

const FALLBACK_PRIMARY_COLOR = '#2563EB';
const FALLBACK_ACCENT_COLOR = '#7C3AED';

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  initialData?: Expense;
  onCancel?: () => void;
}

export default function ExpenseForm({ onSubmit, initialData, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'Technology & Electronics',
    subcategory: initialData?.subcategory || '',
    totalCost: initialData?.totalCost || 0,
    usageMonths: initialData?.usageMonths || 12,
    brandColor: initialData?.brandColor,
    brandAccentColor: initialData?.brandAccentColor,
    brandLogoUrl: initialData?.brandLogoUrl || '',
    imageUrl: initialData?.imageUrl || initialData?.brandLogoUrl || '',
    purchaseDate: initialData?.purchaseDate || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || '',
  });

  // Update subcategory when category changes
  useEffect(() => {
    const subcategories = CATEGORY_SUBCATEGORIES[formData.category];
    // If current subcategory is not valid for the new category, reset to first option
    if (formData.subcategory && !subcategories.includes(formData.subcategory)) {
      setFormData(prev => ({ ...prev, subcategory: subcategories[0] || '' }));
    }
  }, [formData.category, formData.subcategory]);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  const handleAiCategorize = async () => {
    if (!formData.name.trim()) {
      setAiSuggestion('Please enter an item name first');
      setTimeout(() => setAiSuggestion(''), 3000);
      return;
    }

    setIsAiLoading(true);
    setAiSuggestion('');

    try {
      const result = await categorizeExpense(formData.name);

      if ('error' in result) {
        setAiSuggestion(`Error: ${result.error}`);
      } else {
        const nextCategory = result.suggestedCategory;
        const subcategories = CATEGORY_SUBCATEGORIES[nextCategory] || [];
        const nextSubcategory =
          result.suggestedSubcategory && subcategories.includes(result.suggestedSubcategory)
            ? result.suggestedSubcategory
            : subcategories[0] || '';

        // Update form with AI suggestions
        setFormData(prev => {
          const fallbackAvatar = generateAvatarUrl(result.cleanedName, nextCategory);
          const inferredLogo =
            result.brandLogoUrl || result.imageUrl || prev.brandLogoUrl || prev.imageUrl || fallbackAvatar;
          const inferredImage =
            result.imageUrl || result.brandLogoUrl || prev.imageUrl || prev.brandLogoUrl || fallbackAvatar;
          return {
            ...prev,
            name: result.cleanedName,
            category: nextCategory,
            subcategory: nextSubcategory,
            brandColor: result.brandColor || prev.brandColor,
            brandAccentColor: result.brandAccentColor || prev.brandAccentColor,
            brandLogoUrl: inferredLogo,
            imageUrl: inferredImage,
          };
        });

        const subcatMsg = nextSubcategory ? ` > ${nextSubcategory}` : '';
        const brandingBits: string[] = [];
        if (result.brandLogoUrl || result.imageUrl) brandingBits.push('logo');
        if (result.brandColor || result.brandAccentColor) brandingBits.push('colors');
        const brandingMsg = brandingBits.length ? ` + ${brandingBits.join(' & ')}` : '';

        setAiSuggestion(
          `AI suggested: "${result.cleanedName}" in ${nextCategory}${subcatMsg}${brandingMsg} (${result.confidence} confidence)`
        );
      }
    } catch (error) {
      setAiSuggestion('Failed to categorize. Please try again.');
    } finally {
      setIsAiLoading(false);
      // Clear suggestion after 5 seconds
      setTimeout(() => setAiSuggestion(''), 5000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const monthlyCost = calculateMonthlyCost(formData.totalCost, formData.usageMonths);
    const now = new Date().toISOString();
    const trimmedLogo = formData.brandLogoUrl?.trim();
    const trimmedImage = formData.imageUrl?.trim();
    const fallbackAvatar = generateAvatarUrl(formData.name || 'Expense', formData.category);
    const normalizedLogo = trimmedLogo || trimmedImage || fallbackAvatar;
    const normalizedImage = trimmedImage || trimmedLogo || fallbackAvatar;

    const expense: Expense = {
      id: initialData?.id || generateId(),
      ...formData,
      brandColor: formData.brandColor?.trim() || undefined,
      brandAccentColor: formData.brandAccentColor?.trim() || undefined,
      brandLogoUrl: normalizedLogo,
      imageUrl: normalizedImage,
      monthlyCost,
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(expense);

    // Reset form if creating new expense
    if (!initialData) {
      setFormData({
        name: '',
        category: 'Technology & Electronics',
        subcategory: '',
        totalCost: 0,
        usageMonths: 12,
        brandColor: undefined,
        brandAccentColor: undefined,
        brandLogoUrl: '',
        imageUrl: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  };

  const monthlyCost = calculateMonthlyCost(formData.totalCost, formData.usageMonths);
  const brandPrimary = formData.brandColor || FALLBACK_PRIMARY_COLOR;
  const brandAccent = formData.brandAccentColor || FALLBACK_ACCENT_COLOR;
  const hasBrandSelections = Boolean(formData.brandColor || formData.brandAccentColor);
  const brandingGradientStyle = hasBrandSelections
    ? {
        backgroundImage: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})`,
      }
    : undefined;
  const avatarFallback = generateAvatarUrl(formData.name || 'Expense', formData.category);
  const logoPreview = formData.brandLogoUrl?.trim() || formData.imageUrl?.trim() || avatarFallback;
  const brandNameForAlt = formData.name || 'Brand';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-gray-200/40 dark:hover:border-gray-600/60">
        <label className="label">Item Name</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="e.g., MacBook Pro or AMZN*123456"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={handleAiCategorize}
            disabled={isAiLoading || !formData.name.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200/70 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            title="Auto-categorize with AI"
          >
            {isAiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>Smart Fill</span>
          </button>
        </div>
        {aiSuggestion && (
          <p
            className={`mt-2 text-sm ${
              aiSuggestion.startsWith('Error') || aiSuggestion.startsWith('Failed') || aiSuggestion.startsWith('Please')
                ? 'text-red-600 dark:text-red-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {aiSuggestion}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-gray-200/40 dark:hover:border-gray-600/60">
          <label className="label">Category</label>
          <select
            className="input-field"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
            required
          >
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-gray-200/40 dark:hover:border-gray-600/60">
          <label className="label">Total Cost (₹)</label>
          <input
            type="number"
            className="input-field"
            placeholder="0"
            min="0"
            step="0.01"
            value={formData.totalCost || ''}
            onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-gray-200/40 dark:hover:border-gray-600/60">
          <label className="label">Expected Usage (Months)</label>
          <input
            type="number"
            className="input-field"
            placeholder="12"
            min="1"
            value={formData.usageMonths || ''}
            onChange={(e) => setFormData({ ...formData, usageMonths: parseInt(e.target.value) || 1 })}
            required
          />
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-gray-200/40 dark:hover:border-gray-600/60 md:col-span-2">
          <label className="label">Subcategory</label>
          <select
            className="input-field"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
          >
            {CATEGORY_SUBCATEGORIES[formData.category].map(subcategory => (
              <option key={subcategory} value={subcategory}>{subcategory}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-gray-200/40 dark:hover:border-gray-600/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <label className="label">Brand Identity</label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Automatically suggested by Smart Fill. Customize if you prefer different branding.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-24 rounded-xl border border-gray-200/70 dark:border-gray-700/60 shadow-sm ${
                hasBrandSelections ? '' : 'bg-gray-100 dark:bg-gray-800/60'
              }`}
              style={brandingGradientStyle}
              aria-hidden="true"
            />
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/60 flex items-center justify-center">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt={`${brandNameForAlt} logo`}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                    loader={({ src }) => src}
                    unoptimized
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-400 dark:text-gray-500">
                    {brandNameForAlt.substring(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Primary Color</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-12 w-14 cursor-pointer rounded-lg border border-gray-200/70 dark:border-gray-700/60 bg-transparent p-1"
                value={brandPrimary}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    brandColor: e.target.value,
                  }))
                }
                aria-label="Primary brand color"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {formData.brandColor ?? 'Default'}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Accent Color</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-12 w-14 cursor-pointer rounded-lg border border-gray-200/70 dark:border-gray-700/60 bg-transparent p-1"
                value={brandAccent}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    brandAccentColor: e.target.value,
                  }))
                }
                aria-label="Accent brand color"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {formData.brandAccentColor ?? 'Default'}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Logo URL</p>
            <input
              type="url"
              className="input-field"
              placeholder="https://logo.clearbit.com/example.com"
              value={formData.brandLogoUrl}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  brandLogoUrl: e.target.value,
                  imageUrl: e.target.value,
                }))
              }
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supports secure image URLs (PNG, SVG, JPG). Leave empty if unavailable.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-gray-200/40 dark:hover:border-gray-600/60">
        <label className="label">Notes (Optional)</label>
        <textarea
          className="input-field"
          placeholder="Add any additional details..."
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="rounded-2xl border border-blue-200/80 dark:border-blue-800/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-900/40 dark:to-purple-900/40 px-6 py-5 shadow-inner">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Estimated Monthly Cost</p>
        <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-200">
          {formatCurrency(monthlyCost)}
        </p>
        <p className="mt-1 text-xs text-blue-500/80 dark:text-blue-300/70">
          Based on total cost and usage period
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <div className="flex w-full gap-3 sm:w-auto">
          {initialData && (
            <button
              type="button"
              onClick={() => setFormData({
                name: '',
                category: 'Technology & Electronics',
                subcategory: '',
                totalCost: 0,
                usageMonths: 12,
                brandColor: undefined,
                brandAccentColor: undefined,
                brandLogoUrl: '',
                imageUrl: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                notes: '',
              })}
              className="btn-secondary w-full sm:w-auto"
            >
              Reset
            </button>
          )}
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {initialData ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </div>
    </form>
  );
}
