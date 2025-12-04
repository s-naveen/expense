import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-data';

export const storageService = {
  // Get all expenses from localStorage
  getExpenses: (): Expense[] => {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Save expenses to localStorage
  saveExpenses: (expenses: Expense[]): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Add a new expense
  addExpense: (expense: Expense): void => {
    const expenses = storageService.getExpenses();
    expenses.push(expense);
    storageService.saveExpenses(expenses);
  },

  // Update an existing expense
  updateExpense: (id: string, updatedExpense: Expense): void => {
    const expenses = storageService.getExpenses();
    const index = expenses.findIndex(exp => exp.id === id);

    if (index !== -1) {
      expenses[index] = updatedExpense;
      storageService.saveExpenses(expenses);
    }
  },

  // Delete an expense
  deleteExpense: (id: string): void => {
    const expenses = storageService.getExpenses();
    const filteredExpenses = expenses.filter(exp => exp.id !== id);
    storageService.saveExpenses(filteredExpenses);
  },

  // Clear all expenses
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
