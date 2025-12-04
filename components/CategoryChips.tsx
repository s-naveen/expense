'use client';

import { ExpenseCategory } from '@/types/expense';
import { formatCurrency, getCategoryIcon } from '@/lib/utils';

interface CategoryChipsProps {
    categoryBreakdown: Record<ExpenseCategory, number>;
    selectedCategory: ExpenseCategory | 'All';
    onSelectCategory: (category: ExpenseCategory | 'All') => void;
}

export default function CategoryChips({
    categoryBreakdown,
    selectedCategory,
    onSelectCategory,
}: CategoryChipsProps) {
    const sortedCategories = Object.entries(categoryBreakdown)
        .filter(([_, amount]) => amount > 0)
        .sort(([, a], [, b]) => b - a);

    if (sortedCategories.length === 0) {
        return null;
    }

    return (
        <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                {/* All chip */}
                <button
                    type="button"
                    onClick={() => onSelectCategory('All')}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${selectedCategory === 'All'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                >
                    <span>🏠</span>
                    <span>All</span>
                </button>

                {/* Category chips */}
                {sortedCategories.map(([category, amount]) => {
                    const categoryKey = category as ExpenseCategory;
                    const icon = getCategoryIcon(categoryKey);
                    const isActive = selectedCategory === categoryKey;

                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => onSelectCategory(categoryKey)}
                            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                        >
                            <span className="text-sm">{icon}</span>
                            <span>{category.split(' ')[0]}</span>
                            <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {formatCurrency(amount)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
