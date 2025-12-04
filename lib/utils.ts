import { Expense, ExpenseSummary, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Housing': 'bg-amber-600',
  'Transportation': 'bg-blue-500',
  'Food & Dining': 'bg-rose-500',
  'Shopping': 'bg-fuchsia-500',
  'Entertainment': 'bg-indigo-500',
  'Technology & Electronics': 'bg-sky-500',
  'Health & Fitness': 'bg-emerald-500',
  'Education': 'bg-violet-500',
  'Personal Care': 'bg-pink-400',
  'Pets': 'bg-orange-400',
  'Travel': 'bg-cyan-500',
  'Financial': 'bg-slate-600',
  'Insurance': 'bg-yellow-500',
  'Gifts & Donations': 'bg-red-400',
  'Kids & Family': 'bg-lime-500',
  'Business Expenses': 'bg-stone-500',
  'Subscriptions': 'bg-purple-500',
  'Utilities & Bills': 'bg-teal-500',
  'Savings & Investments': 'bg-green-600',
  'Miscellaneous': 'bg-gray-500',
};

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  'Housing': '🏠',
  'Transportation': '🚗',
  'Food & Dining': '🍽',
  'Shopping': '🛍',
  'Entertainment': '🎬',
  'Technology & Electronics': '💻',
  'Health & Fitness': '🏋️',
  'Education': '🎓',
  'Personal Care': '💅',
  'Pets': '🐾',
  'Travel': '✈️',
  'Financial': '💰',
  'Insurance': '🛡️',
  'Gifts & Donations': '🎁',
  'Kids & Family': '👪',
  'Business Expenses': '💼',
  'Subscriptions': '🔁',
  'Utilities & Bills': '💡',
  'Savings & Investments': '📈',
  'Miscellaneous': '📦',
};

function createEmptyCategoryBreakdown(): Record<ExpenseCategory, number> {
  return EXPENSE_CATEGORIES.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
}

export function calculateMonthlyCost(totalCost: number, usageMonths: number): number {
  if (usageMonths <= 0) return 0;
  return totalCost / usageMonths;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function calculateExpenseSummary(expenses: Expense[]): ExpenseSummary {
  const summary: ExpenseSummary = {
    totalMonthlyExpense: 0,
    totalInvestment: 0,
    expenseCount: expenses.length,
    categoryBreakdown: createEmptyCategoryBreakdown(),
  };

  expenses.forEach(expense => {
    summary.totalMonthlyExpense += expense.monthlyCost;
    summary.totalInvestment += expense.totalCost;
    if (summary.categoryBreakdown[expense.category] === undefined) {
      summary.categoryBreakdown[expense.category] = 0;
    }
    summary.categoryBreakdown[expense.category] += expense.monthlyCost;
  });

  return summary;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCategoryColor(category: ExpenseCategory): string {
  return CATEGORY_COLORS[category] || 'bg-gray-500';
}

export function getCategoryIcon(category: ExpenseCategory): string {
  return CATEGORY_ICONS[category] || '📦';
}

const fallbackAvatarCache = new Map<string, string>();

export function generateAvatarUrl(name: string, category: ExpenseCategory): string {
  const key = `${name.toLowerCase().trim()}|${category}`;
  const cached = fallbackAvatarCache.get(key);
  if (cached) return cached;

  const seed = key || `expense-${category.toLowerCase().replace(/\s+/g, '-')}`;
  const url = `https://api.dicebear.com/7.x/icons/png?seed=${encodeURIComponent(seed)}&size=256&backgroundColor=6366f1&backgroundType=gradientLinear`;
  fallbackAvatarCache.set(key, url);
  return url;
}
