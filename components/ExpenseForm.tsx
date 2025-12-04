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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero Input Section */}
      <div className="space-y-4">
        <div className="relative group">
          <input
            ref={nameInputRef}
            type="text"
            className="w-full text-3xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 py-2 px-0 focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-600"
            placeholder="What did you buy?"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => !initialData && handleAiCategorize()}
            required
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isAiLoading ? (
              <div className="flex items-center gap-2 text-primary text-sm font-medium animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Magic...</span>
              </div>
            ) : aiSuggestion ? (
              <span className="text-sm text-emerald-500 font-medium animate-fade-in">
                {aiSuggestion}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={!formData.name.trim()}
                className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                title="Auto-categorize"
              >
                <Sparkles className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
            >
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subcategory</label>
            <select
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            >
              {CATEGORY_SUBCATEGORIES[formData.category].map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-6 space-y-6 border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Calculator className="h-4 w-4" />
          <span>Cost Calculator</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Total Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <input
                  type="number"
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-foreground"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={formData.totalCost || ''}
                  onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Usage Period</label>
                <span className="text-sm font-medium text-primary">{formData.usageMonths} months</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                value={formData.usageMonths}
                onChange={(e) => setFormData({ ...formData, usageMonths: parseInt(e.target.value) || 1 })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 mo</span>
                <span>5 years</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center space-y-1 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 w-full">
              <p className="text-sm text-muted-foreground">Monthly Impact</p>
              <p className="text-3xl font-bold text-primary tracking-tight">
                {formatCurrency(monthlyCost)}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>Advanced Customization</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-slide-up space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Palette className="h-4 w-4" />
                  <span>Brand Colors</span>
                </div>
                <div className="flex gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Primary</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                        value={brandPrimary}
                        onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                      />
                      <span className="text-xs font-mono text-muted-foreground">{formData.brandColor || 'Default'}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                        value={brandAccent}
                        onChange={(e) => setFormData(prev => ({ ...prev, brandAccentColor: e.target.value }))}
                      />
                      <span className="text-xs font-mono text-muted-foreground">{formData.brandAccentColor || 'Default'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Logo URL</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="https://..."
                    value={formData.brandLogoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandLogoUrl: e.target.value, imageUrl: e.target.value }))}
                  />
                  <div className="h-10 w-10 rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.brandLogoUrl ? (
                      <Image
                        src={formData.brandLogoUrl}
                        alt="Preview"
                        width={24}
                        height={24}
                        className="h-full w-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">?</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[80px]"
                placeholder="Add any additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-primary px-6 py-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
        >
          {initialData ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
