'use client';

import { Expense } from '@/types/expense';
import { formatCurrency, getCategoryColor, getCategoryIcon } from '@/lib/utils';
import Image from 'next/image';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const categoryColor = getCategoryColor(expense.category);
  const categoryIcon = getCategoryIcon(expense.category);
  const avatarImageUrl = expense.brandLogoUrl || expense.imageUrl;
  const avatarAlt = expense.name ? `${expense.name} logo` : 'Expense logo';
  const brandPrimary = expense.brandColor;
  const brandAccent = expense.brandAccentColor;
  const hasAvatarImage = Boolean(avatarImageUrl);
  const hasBrandMetadata = Boolean(brandPrimary || brandAccent || avatarImageUrl);
  const showGradientBackground = !hasAvatarImage && (brandPrimary || brandAccent);
  const iconStyle = showGradientBackground
    ? {
        backgroundImage: `linear-gradient(135deg, ${brandPrimary || brandAccent || '#2563EB'}, ${brandAccent || brandPrimary || '#7C3AED'})`,
      }
    : undefined;
  const brandInitial = (expense.name || '').trim().charAt(0).toUpperCase();
  const iconClasses = hasAvatarImage
    ? 'w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200/80 dark:border-gray-700/70 shadow-sm'
    : showGradientBackground
      ? 'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold uppercase text-white shadow-lg flex-shrink-0 overflow-hidden'
      : `${categoryColor} w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 text-white`;

  return (
    <div className="card p-5 hover:shadow-2xl transition-all duration-200 border border-gray-100/70 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {hasAvatarImage ? (
            <div className={iconClasses}>
              <Image
                src={avatarImageUrl!}
                alt={avatarAlt}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                loader={({ src }) => src}
                unoptimized
              />
            </div>
          ) : (
            <div className={iconClasses} style={iconStyle}>
              {showGradientBackground ? (
                <span>{brandInitial || categoryIcon}</span>
              ) : (
                categoryIcon
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{expense.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {expense.category}
                  </span>
                  {expense.subcategory && (
                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                      {expense.subcategory}
                    </span>
                  )}
                </div>
                {hasBrandMetadata && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {expense.brandColor && (
                      <span
                        className="inline-flex h-3 w-3 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm"
                        style={{ backgroundColor: expense.brandColor }}
                        aria-label="Brand primary color"
                      />
                    )}
                    {expense.brandAccentColor && (
                      <span
                        className="inline-flex h-3 w-3 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm"
                        style={{ backgroundColor: expense.brandAccentColor }}
                        aria-label="Brand accent color"
                      />
                    )}
                    {avatarImageUrl && (
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        Brand assets synced
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Cost</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(expense.totalCost)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Cost</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(expense.monthlyCost)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Usage Period</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{expense.usageMonths} months</p>
              </div>
            </div>

            {expense.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic">
                {expense.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(expense)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
