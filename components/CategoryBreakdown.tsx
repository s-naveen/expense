'use client';

import { ExpenseCategory } from '@/types/expense';
import { formatCurrency, getCategoryColor, getCategoryIcon } from '@/lib/utils';

interface CategoryBreakdownProps {
  categoryBreakdown: Record<ExpenseCategory, number>;
  totalMonthly: number;
  selectedCategory?: ExpenseCategory | 'All';
  onSelectCategory?: (category: ExpenseCategory) => void;
}

export default function CategoryBreakdown({
  categoryBreakdown,
  totalMonthly,
  selectedCategory,
  onSelectCategory,
}: CategoryBreakdownProps) {
  const sortedCategories = Object.entries(categoryBreakdown)
    .filter(([_, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a);

  if (sortedCategories.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Category Breakdown</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No expenses yet. Add your first expense to see the breakdown.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Category Breakdown</h3>
      {onSelectCategory && (
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Tap a category to focus the list. Tap again to clear the filter.
        </p>
      )}
      <div className="space-y-4">
        {sortedCategories.map(([category, amount]) => {
          const percentage = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
          const categoryKey = category as ExpenseCategory;
          const categoryColor = getCategoryColor(categoryKey);
          const icon = getCategoryIcon(categoryKey);
          const isActive = selectedCategory === categoryKey;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory?.(categoryKey)}
              className={`w-full rounded-2xl border border-transparent bg-white/60 dark:bg-gray-800/60 p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-gray-800 ${
                isActive
                  ? 'ring-1 ring-indigo-300/70 dark:ring-indigo-500/40 backdrop-blur'
                  : 'hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span
                      className={`font-medium ${
                        isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(amount)}</span>
                </div>

                <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${categoryColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{percentage.toFixed(1)}% of total</span>
                  <span>{formatCurrency(amount)}/month</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
