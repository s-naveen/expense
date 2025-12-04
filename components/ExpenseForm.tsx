'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExpenseCategory, ExpenseFormData, Expense, CATEGORY_SUBCATEGORIES, EXPENSE_CATEGORIES } from '@/types/expense';
import { calculateMonthlyCost, formatCurrency, generateAvatarUrl, generateId } from '@/lib/utils';
import { categorizeExpense } from '@/app/actions/categorize';
import { Sparkles, Loader2, Info } from 'lucide-react';

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
      {/* Name & AI */}
      <div className="space-y-2">
        <label className="label">Item Name</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              className="input-field pr-10"
              placeholder="e.g., MacBook Pro"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <button
            type="button"
            onClick={handleAiCategorize}
            disabled={isAiLoading || !formData.name.trim()}
            className="btn-primary px-4"
            title="Auto-categorize with AI"
          >
            {isAiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="sr-only sm:not-sr-only sm:ml-2">Smart Fill</span>
          </button>
        </div>
        {aiSuggestion && (
          <p className={`text-xs ${aiSuggestion.startsWith('Error') ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
            {aiSuggestion}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Category */}
        <div className="space-y-2">
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

        {/* Subcategory */}
        <div className="space-y-2">
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

        {/* Cost */}
        <div className="space-y-2">
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

        {/* Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Usage Period</label>
            <span className="text-xs text-muted-foreground">{formData.usageMonths} months</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            className="w-full accent-primary"
            value={formData.usageMonths}
            onChange={(e) => setFormData({ ...formData, usageMonths: parseInt(e.target.value) || 1 })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 mo</span>
            <span>5 years</span>
          </div>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">Brand Identity</h4>
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-16 rounded-md border shadow-sm ${hasBrandSelections ? '' : 'bg-muted'
                }`}
              style={brandingGradientStyle}
            />
            <div className="h-8 w-8 overflow-hidden rounded-md border bg-background flex items-center justify-center">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Brand logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">?</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                value={brandPrimary}
                onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
              />
              <span className="text-xs font-mono text-muted-foreground">{formData.brandColor || 'None'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                value={brandAccent}
                onChange={(e) => setFormData(prev => ({ ...prev, brandAccentColor: e.target.value }))}
              />
              <span className="text-xs font-mono text-muted-foreground">{formData.brandAccentColor || 'None'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Logo URL</label>
            <input
              type="url"
              className="input-field h-8 text-xs"
              placeholder="https://..."
              value={formData.brandLogoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, brandLogoUrl: e.target.value, imageUrl: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="label">Notes</label>
        <textarea
          className="input-field min-h-[80px] py-2"
          placeholder="Add any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Estimated Monthly Cost</p>
            <p className="text-xs text-muted-foreground">Based on {formData.usageMonths} months usage</p>
          </div>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(monthlyCost)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary w-full sm:w-auto">
          {initialData ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
