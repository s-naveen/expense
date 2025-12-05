import { Expense } from '@/types/expense';
import { createClient } from '@/lib/supabase/client';
import { DatabaseExpense, toDatabaseExpense, fromDatabaseExpense } from '@/types/database';

export const supabaseStorageService = {
  // Get individual expenses for the current user (group_id is NULL)
  getExpenses: async (userId: string): Promise<Expense[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .is('group_id', null)
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

  // Get expenses for a specific group
  getGroupExpenses: async (groupId: string): Promise<Expense[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching group expenses:', error);
        return [];
      }

      return (data as DatabaseExpense[])?.map(fromDatabaseExpense) || [];
    } catch (error) {
      console.error('Error fetching group expenses:', error);
      return [];
    }
  },

  // Add a new expense (individual or group)
  addExpense: async (userId: string, expense: Expense, groupId?: string): Promise<Expense | null> => {
    try {
      const supabase = createClient();
      const dbExpense = toDatabaseExpense(expense, userId, groupId);

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
  updateExpense: async (userId: string, id: string, updatedExpense: Expense, groupId?: string): Promise<Expense | null> => {
    try {
      const supabase = createClient();
      const dbExpense = toDatabaseExpense(updatedExpense, userId, groupId);

      // Build query - for group expenses, don't filter by user_id
      let query = supabase
        .from('expenses')
        .update(dbExpense)
        .eq('id', id);

      if (groupId) {
        query = query.eq('group_id', groupId);
      } else {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.select().single();

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
  deleteExpense: async (userId: string, id: string, groupId?: string): Promise<boolean> => {
    try {
      const supabase = createClient();

      // Build query - for group expenses, don't filter by user_id
      let query = supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (groupId) {
        query = query.eq('group_id', groupId);
      } else {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

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

  // Clear all individual expenses for a user
  clearAll: async (userId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', userId)
        .is('group_id', null);

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
