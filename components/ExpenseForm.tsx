'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ExpenseCategory, ExpenseFormData, Expense, CATEGORY_SUBCATEGORIES, EXPENSE_CATEGORIES } from '@/types/expense';
import { calculateMonthlyCost, formatCurrency, generateAvatarUrl, generateId } from '@/lib/utils';
import { CategorizeResult, CategorizeError } from '@/lib/categorize';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Palette, Calculator } from 'lucide-react';

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

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input on mount
  useEffect(() => {
    if (!initialData) {
      nameInputRef.current?.focus();
    }
  }, [initialData]);

  // Update subcategory when category changes
  useEffect(() => {
    const subcategories = CATEGORY_SUBCATEGORIES[formData.category];
    if (formData.subcategory && !subcategories.includes(formData.subcategory)) {
      setFormData(prev => ({ ...prev, subcategory: subcategories[0] || '' }));
    }
  }, [formData.category, formData.subcategory]);

  const handleAiCategorize = async () => {
    if (!formData.name.trim()) return;

    setIsAiLoading(true);
    setAiSuggestion('');

    try {
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
      });

      const result: CategorizeResult | CategorizeError = await response.json();

      if ('error' in result) {
        setAiSuggestion(`Error: ${result.error}`);
      } else {
        const nextCategory = result.suggestedCategory;
        const subcategories = CATEGORY_SUBCATEGORIES[nextCategory] || [];
        const nextSubcategory =
          result.suggestedSubcategory && subcategories.includes(result.suggestedSubcategory)
            ? result.suggestedSubcategory
            : subcategories[0] || '';

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
        setAiSuggestion('Auto-categorized!');
      }
    } catch (error) {
      setAiSuggestion('Failed to categorize');
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiSuggestion(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const monthlyCost = calculateMonthlyCost(formData.totalCost, formData.usageMonths);
    const now = new Date().toISOString();
    const fallbackAvatar = generateAvatarUrl(formData.name || 'Expense', formData.category);
    const normalizedLogo = formData.brandLogoUrl?.trim() || formData.imageUrl?.trim() || fallbackAvatar;
    const normalizedImage = formData.imageUrl?.trim() || formData.brandLogoUrl?.trim() || fallbackAvatar;

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
  };

  const monthlyCost = calculateMonthlyCost(formData.totalCost, formData.usageMonths);
  const brandPrimary = formData.brandColor || FALLBACK_PRIMARY_COLOR;
  const brandAccent = formData.brandAccentColor || FALLBACK_ACCENT_COLOR;
  const hasBrandSelections = Boolean(formData.brandColor || formData.brandAccentColor);
  const brandingGradientStyle = hasBrandSelections
    ? { backgroundImage: `linear-gradient(135deg, ${brandPrimary}, ${brandAccent})` }
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Name Input */}
      <div className="relative">
        <input
          ref={nameInputRef}
          type="text"
          className="w-full text-lg sm:text-2xl font-semibold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 py-2 pr-10 focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-500"
          placeholder="What did you buy?"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onBlur={() => !initialData && handleAiCategorize()}
          required
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          {isAiLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : aiSuggestion ? (
            <span className="text-xs text-emerald-500 font-medium">{aiSuggestion}</span>
          ) : (
            <button
              type="button"
              onClick={handleAiCategorize}
              disabled={!formData.name.trim()}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors"
              title="Auto-categorize"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category & Subcategory - Side by side */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Category</label>
          <select
            className="select-styled"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
          >
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Subcategory</label>
          <select
            className="select-styled"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
          >
            {CATEGORY_SUBCATEGORIES[formData.category].map(subcategory => (
              <option key={subcategory} value={subcategory}>{subcategory}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cost Section - Compact inline layout */}
      <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cost Input */}
          <div className="flex-1">
            <label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Cost</label>
            <div className="relative mt-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input
                type="number"
                className="w-full pl-7 pr-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-mono"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.totalCost || ''}
                onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          {/* Monthly Result - Compact display */}
          <div className="text-center px-3 py-2 rounded-xl bg-primary/10 min-w-[90px]">
            <p className="text-[10px] text-muted-foreground">Monthly</p>
            <p className="text-base sm:text-lg font-bold text-primary">{formatCurrency(monthlyCost)}</p>
          </div>
        </div>

        {/* Usage Period Slider */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-muted-foreground">Usage Period</label>
            <span className="text-xs font-semibold text-primary">{formData.usageMonths} mo</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            className="w-full accent-primary h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            value={formData.usageMonths}
            onChange={(e) => setFormData({ ...formData, usageMonths: parseInt(e.target.value) || 1 })}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            <span>1 mo</span>
            <span>5 years</span>
          </div>
        </div>
      </div>

      {/* Advanced Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        <span>Advanced</span>
      </button>

      {showAdvanced && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Brand Colors */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1.5 mb-2">
                <Palette className="h-3 w-3" />
                Colors
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    className="h-7 w-7 rounded cursor-pointer border-0 p-0"
                    value={brandPrimary}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                  />
                  <span className="text-[10px] text-muted-foreground">Pri</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    className="h-7 w-7 rounded cursor-pointer border-0 p-0"
                    value={brandAccent}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandAccentColor: e.target.value }))}
                  />
                  <span className="text-[10px] text-muted-foreground">Acc</span>
                </div>
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="text-xs font-medium mb-2 block">Logo URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  className="flex-1 min-w-0 rounded-lg border bg-background px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="https://..."
                  value={formData.brandLogoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandLogoUrl: e.target.value, imageUrl: e.target.value }))}
                />
                <div className="h-8 w-8 rounded border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.brandLogoUrl ? (
                    <Image
                      src={formData.brandLogoUrl}
                      alt="Preview"
                      width={20}
                      height={20}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">?</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium mb-1 block">Notes</label>
            <textarea
              className="w-full rounded-lg border bg-background px-2.5 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[60px] resize-none"
              placeholder="Additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Actions - Sticky at bottom on mobile */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-primary px-4 sm:px-6 py-2 text-sm shadow-lg shadow-primary/25"
        >
          {initialData ? 'Update' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}

