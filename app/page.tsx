'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Expense, ExpenseCategory } from '@/types/expense';
import { supabaseStorageService } from '@/lib/supabase-storage';
import { calculateExpenseSummary, formatCurrency } from '@/lib/utils';
import StatsCard from '@/components/StatsCard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseItem from '@/components/ExpenseItem';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import Modal from '@/components/Modal';
import { LogOut, Plus, Search, ArrowUpDown } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'amountHigh' | 'amountLow' | 'name';

export default function Home() {
  const { user, signOut } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);

  // Load expenses from Supabase on mount
  useEffect(() => {
    const loadExpenses = async () => {
      if (!user) return;

      setLoading(true);
      const loadedExpenses = await supabaseStorageService.getExpenses(user.id);
      setExpenses(loadedExpenses);
      setLoading(false);
    };

    if (user) {
      loadExpenses();
    }
  }, [user]);

  const handleAddExpense = async (expense: Expense) => {
    if (!user) return;

    if (editingExpense) {
      const updated = await supabaseStorageService.updateExpense(user.id, expense.id, expense);
      if (updated) {
        setExpenses(expenses.map(exp => exp.id === expense.id ? updated : exp));
        setEditingExpense(null);
      }
    } else {
      const added = await supabaseStorageService.addExpense(user.id, expense);
      if (added) {
        setExpenses([added, ...expenses]);
      }
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to delete this expense?')) {
      const deleted = await supabaseStorageService.deleteExpense(user.id, id);
      if (deleted) {
        setExpenses(expenses.filter(exp => exp.id !== id));
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const summary = calculateExpenseSummary(expenses);

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const parseDate = (date: string) => new Date(date).getTime();
    switch (sortOption) {
      case 'newest':
        return parseDate(b.createdAt) - parseDate(a.createdAt);
      case 'oldest':
        return parseDate(a.createdAt) - parseDate(b.createdAt);
      case 'amountHigh':
        return b.monthlyCost - a.monthlyCost;
      case 'amountLow':
        return a.monthlyCost - b.monthlyCost;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const categories = ['All', ...Array.from(new Set(expenses.map(e => e.category)))];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Latest added' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'amountHigh', label: 'Monthly cost ↓' },
    { value: 'amountLow', label: 'Monthly cost ↑' },
    { value: 'name', label: 'Name A → Z' },
  ];

  const handleCategoryQuickFilter = (category: ExpenseCategory) => {
    setFilterCategory(prev => (prev === category ? 'All' : category));
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto">
        {/* User Info Bar */}
        {user && (
          <div className="mb-6 flex justify-end items-center gap-4">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              {user.user_metadata?.avatar_url && (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.name || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.user_metadata?.name || user.email}
              </span>
              <button
                onClick={signOut}
                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Monthly Expense Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Convert your one-time purchases into monthly expenses. Track furniture, electronics, and more with smart amortization.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Monthly Expense"
            value={formatCurrency(summary.totalMonthlyExpense)}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatsCard
            title="Total Investment"
            value={formatCurrency(summary.totalInvestment)}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />

          <StatsCard
            title="Total Items"
            value={summary.expenseCount.toString()}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />

          <StatsCard
            title="Yearly Impact"
            value={formatCurrency(summary.totalMonthlyExpense * 12)}
            color="orange"
            subtitle="Annual projection"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Form & Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Breakdown */}
            <CategoryBreakdown
              categoryBreakdown={summary.categoryBreakdown}
              totalMonthly={summary.totalMonthlyExpense}
              selectedCategory={filterCategory as ExpenseCategory | 'All'}
              onSelectCategory={handleCategoryQuickFilter}
            />
          </div>

          {/* Right Column - Expense List */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Expenses</h2>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      className="input-field text-sm py-2 pl-10 transition-shadow duration-200 focus-visible:shadow-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <select
                      className="input-field text-sm py-2 pr-10 transition-shadow duration-200 focus-visible:shadow-lg"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      className="input-field text-sm py-2 pr-10 transition-shadow duration-200 focus-visible:shadow-lg"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No expenses found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {expenses.length === 0
                      ? 'Start tracking your expenses by adding your first item.'
                      : 'Try adjusting your search or filter criteria.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedExpenses.map(expense => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      onEdit={handleEditExpense}
                      onDelete={handleDeleteExpense}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal
          open={isModalOpen}
          onClose={handleCancelEdit}
          title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
          description="Categorize purchases and see their monthly impact instantly."
        >
          <ExpenseForm
            onSubmit={handleAddExpense}
            initialData={editingExpense || undefined}
            onCancel={handleCancelEdit}
          />
        </Modal>

        {/* Footer */}
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-12">
          <p>Built with Next.js, React, and Tailwind CSS</p>
          <p className="mt-1">Track smarter, spend wiser 💰</p>
        </div>
      </div>
    </div>
  );
}
