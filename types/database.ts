import { Expense } from './expense';

// Database types matching the Supabase schema (snake_case)
export interface DatabaseExpense {
  id: string;
  user_id: string;
  group_id?: string | null;
  name: string;
  category: string;
  subcategory?: string | null;
  total_cost: number;
  usage_months: number;
  monthly_cost: number;
  brand_color?: string | null;
  brand_accent_color?: string | null;
  brand_logo_url?: string | null;
  image_url?: string | null;
  purchase_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions to convert between database and application types
export function toDatabaseExpense(expense: Expense, userId: string, groupId?: string): Partial<DatabaseExpense> {
  return {
    id: expense.id,
    user_id: userId,
    group_id: groupId || expense.groupId || null,
    name: expense.name,
    category: expense.category,
    subcategory: expense.subcategory || null,
    total_cost: expense.totalCost,
    usage_months: expense.usageMonths,
    monthly_cost: expense.monthlyCost,
    brand_color: expense.brandColor || null,
    brand_accent_color: expense.brandAccentColor || null,
    brand_logo_url: expense.brandLogoUrl || null,
    image_url: expense.imageUrl || null,
    purchase_date: expense.purchaseDate,
    notes: expense.notes || null,
    created_at: expense.createdAt,
    updated_at: expense.updatedAt,
  };
}

export function fromDatabaseExpense(dbExpense: DatabaseExpense): Expense {
  return {
    id: dbExpense.id,
    name: dbExpense.name,
    category: dbExpense.category as any, // Category type is validated at DB level
    subcategory: dbExpense.subcategory || undefined,
    totalCost: dbExpense.total_cost,
    usageMonths: dbExpense.usage_months,
    monthlyCost: dbExpense.monthly_cost,
    brandColor: dbExpense.brand_color || undefined,
    brandAccentColor: dbExpense.brand_accent_color || undefined,
    brandLogoUrl: dbExpense.brand_logo_url || undefined,
    imageUrl: dbExpense.image_url || undefined,
    purchaseDate: dbExpense.purchase_date,
    notes: dbExpense.notes || undefined,
    groupId: dbExpense.group_id || undefined,
    createdAt: dbExpense.created_at,
    updatedAt: dbExpense.updated_at,
  };
}
