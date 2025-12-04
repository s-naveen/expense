import { Expense } from '@/types/expense';
import { createClient } from '@/lib/supabase/client';
import { DatabaseExpense, toDatabaseExpense, fromDatabaseExpense } from '@/types/database';

export const supabaseStorageService = {
  // Get all expenses for the current user
  getExpenses: async (userId: string): Promise<Expense[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }

      // Convert database format to application format
      return (data as DatabaseExpense[])?.map(fromDatabaseExpense) || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  // Add a new expense
  addExpense: async (userId: string, expense: Expense): Promise<Expense | null> => {
    try {
      const supabase = createClient();
      const dbExpense = toDatabaseExpense(expense, userId);

      const { data, error } = await supabase
        .from('expenses')
        .insert([dbExpense])
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        return null;
      }

      return fromDatabaseExpense(data as DatabaseExpense);
    } catch (error) {
      console.error('Error adding expense:', error);
      return null;
    }
  },

  // Update an existing expense
  updateExpense: async (userId: string, id: string, updatedExpense: Expense): Promise<Expense | null> => {
    try {
      const supabase = createClient();
      const dbExpense = toDatabaseExpense(updatedExpense, userId);

      const { data, error } = await supabase
        .from('expenses')
        .update(dbExpense)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        return null;
      }

      return fromDatabaseExpense(data as DatabaseExpense);
    } catch (error) {
      console.error('Error updating expense:', error);
      return null;
    }
  },

  // Delete an expense
  deleteExpense: async (userId: string, id: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting expense:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  },

  // Clear all expenses for a user
  clearAll: async (userId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing expenses:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error clearing expenses:', error);
      return false;
    }
  },
};
