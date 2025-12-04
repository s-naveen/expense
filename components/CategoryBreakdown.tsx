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
        <h3 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No expenses yet. Add your first expense to see the breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
      {onSelectCategory && (
        <p className="mb-4 text-xs text-muted-foreground">
          Tap a category to filter the list.
        </p>
      )}
      <div className="space-y-3">
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
              className={`group w-full rounded-lg border p-3 text-left transition-all duration-200 hover:shadow-sm ${isActive
                  ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20'
                  : 'bg-card border-transparent hover:bg-muted/50'
                }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>
                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'
                      }`}>
                      {category}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(amount)}
                  </span>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${categoryColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}%</span>
                  <span>{formatCurrency(amount)}/mo</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
