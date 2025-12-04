import { Expense } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import Image from 'next/image';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Main Content */}
        <div className="flex items-start gap-4">
          {/* Icon/Image */}
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border bg-muted/50 sm:h-14 sm:w-14">
            {expense.brandLogoUrl || expense.imageUrl ? (
              <Image
                src={expense.brandLogoUrl || expense.imageUrl || ''}
                alt={expense.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                {expense.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate pr-8 sm:pr-0">
              {expense.name}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {expense.category}
              </span>
              {expense.subcategory && (
                <span className="hidden sm:inline-block">• {expense.subcategory}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(expense.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Cost & Actions */}
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(expense.monthlyCost)}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(expense.totalCost)}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(expense)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Edit expense"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(expense.id)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Delete expense"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Brand accent line */}
      {(expense.brandColor || expense.brandAccentColor) && (
        <div
          className="absolute bottom-0 left-0 h-1 w-full opacity-50"
          style={{
            background: `linear-gradient(to right, ${expense.brandColor || 'transparent'}, ${expense.brandAccentColor || 'transparent'})`
          }}
        />
      )}
    </div>
  );
}
