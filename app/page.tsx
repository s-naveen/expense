'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Expense, ExpenseCategory } from '@/types/expense';
import { supabaseStorageService } from '@/lib/supabase-storage';
import { calculateExpenseSummary, formatCurrency } from '@/lib/utils';
import StatsCard from '@/components/StatsCard';
import MobileStatsSummary from '@/components/MobileStatsSummary';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseItem from '@/components/ExpenseItem';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import CategoryChips from '@/components/CategoryChips';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/lib/hooks/useAuth';
import Modal from '@/components/Modal';
import { LogOut, Plus, Search, Wallet, TrendingUp, Package, Calendar } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'amountHigh' | 'amountLow' | 'name';

export const dynamic = 'force-dynamic';

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

  const handleCategoryQuickFilter = (category: ExpenseCategory | 'All') => {
    setFilterCategory(category);
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              ExpenseTracker
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {user.user_metadata?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.name || 'User'}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full ring-2 ring-background"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        {/* Hero Section - Compact on mobile */}
        <div className="mb-4 sm:mb-8 sm:flex sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              Dashboard
            </h2>
            {/* Description hidden on mobile */}
            <p className="mt-1 text-sm text-muted-foreground hidden sm:block sm:text-base sm:mt-2">
              Track your monthly expenses and manage your budget efficiently.
            </p>
          </div>
          {/* Desktop Add Button */}
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="btn-primary hidden sm:inline-flex shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </button>
        </div>

        {/* Mobile: Compact Stats Summary */}
        <div className="mb-4 sm:hidden">
          <MobileStatsSummary
            monthlyExpense={summary.totalMonthlyExpense}
            totalInvestment={summary.totalInvestment}
            itemCount={summary.expenseCount}
            yearlyProjection={summary.totalMonthlyExpense * 12}
          />
        </div>

        {/* Desktop: Full Stats Grid */}
        <div className="mb-8 hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Monthly Expense"
            value={formatCurrency(summary.totalMonthlyExpense)}
            color="blue"
            icon={<Wallet />}
          />
          <StatsCard
            title="Total Investment"
            value={formatCurrency(summary.totalInvestment)}
            color="green"
            icon={<TrendingUp />}
          />
          <StatsCard
            title="Total Items"
            value={summary.expenseCount.toString()}
            color="purple"
            icon={<Package />}
          />
          <StatsCard
            title="Yearly Projection"
            value={formatCurrency(summary.totalMonthlyExpense * 12)}
            color="orange"
            subtitle="Estimated annual cost"
            icon={<Calendar />}
          />
        </div>

        {/* Mobile: Horizontal Category Chips */}
        <div className="mb-4 lg:hidden">
          <CategoryChips
            categoryBreakdown={summary.categoryBreakdown}
            selectedCategory={filterCategory as ExpenseCategory | 'All'}
            onSelectCategory={handleCategoryQuickFilter}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Breakdown (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <CategoryBreakdown
              categoryBreakdown={summary.categoryBreakdown}
              totalMonthly={summary.totalMonthlyExpense}
              selectedCategory={filterCategory as ExpenseCategory | 'All'}
              onSelectCategory={handleCategoryQuickFilter}
            />
          </div>

          {/* Right Column - Expenses List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-foreground">Recent Expenses</h3>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="input-field pl-9 w-full sm:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  {/* Category dropdown - only on desktop since mobile has chips */}
                  <select
                    className="input-field w-full sm:w-[140px] hidden lg:block"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    className="input-field flex-1 sm:w-[140px]"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading your expenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">No expenses found</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  {expenses.length === 0
                    ? "You haven't added any expenses yet. Start by adding your first item."
                    : "No expenses match your search criteria. Try adjusting your filters."}
                </p>
                {expenses.length === 0 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary mt-6"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Expense
                  </button>
                )}
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
      </main>

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

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => {
          setEditingExpense(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 sm:hidden flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Add Expense"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
