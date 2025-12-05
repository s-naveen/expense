export const EXPENSE_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Technology & Electronics',
  'Health & Fitness',
  'Education',
  'Personal Care',
  'Pets',
  'Travel',
  'Financial',
  'Insurance',
  'Gifts & Donations',
  'Kids & Family',
  'Business Expenses',
  'Subscriptions',
  'Utilities & Bills',
  'Savings & Investments',
  'Miscellaneous',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const CATEGORY_SUBCATEGORIES: Record<ExpenseCategory, string[]> = {
  'Housing': [
    'Rent/Mortgage',
    'Property Tax',
    'Home Insurance',
    'Utilities',
    'Internet & Cable',
    'Home Maintenance',
    'Furniture',
    'Home Improvement',
  ],
  'Transportation': [
    'Vehicle Purchase',
    'Fuel/Gas',
    'Car Insurance',
    'Car Maintenance',
    'Public Transit',
    'Parking',
    'Ride Share',
    'Vehicle Registration',
  ],
  'Food & Dining': [
    'Groceries',
    'Restaurants',
    'Fast Food',
    'Coffee Shops',
    'Food Delivery',
    'Alcohol & Bars',
  ],
  'Shopping': [
    'Clothing',
    'Shoes',
    'Accessories',
    'Personal Items',
    'Household Supplies',
    'Online Shopping',
  ],
  'Entertainment': [
    'Streaming Services',
    'Movies & Theater',
    'Concerts & Events',
    'Gaming',
    'Hobbies',
    'Books & Magazines',
    'Sports & Recreation',
  ],
  'Technology & Electronics': [
    'Computers & Laptops',
    'Phones & Tablets',
    'Smart Home Devices',
    'Gadgets',
    'Software & Apps',
    'Electronics Accessories',
  ],
  'Health & Fitness': [
    'Doctor Visits',
    'Medications',
    'Health Insurance',
    'Gym Membership',
    'Fitness Equipment',
    'Supplements',
    'Mental Health',
  ],
  'Education': [
    'Tuition & Fees',
    'Books & Supplies',
    'Online Courses',
    'Workshops & Training',
    'Student Loans',
  ],
  'Personal Care': [
    'Hair Care',
    'Skincare',
    'Cosmetics',
    'Spa & Salon',
    'Grooming',
  ],
  'Pets': [
    'Pet Food',
    'Veterinary',
    'Pet Insurance',
    'Pet Supplies',
    'Pet Grooming',
  ],
  'Travel': [
    'Flights',
    'Hotels',
    'Vacation Rentals',
    'Travel Insurance',
    'Activities & Tours',
    'Souvenirs',
  ],
  'Financial': [
    'Bank Fees',
    'Investment Fees',
    'Credit Card Fees',
    'ATM Fees',
    'Tax Preparation',
    'Financial Advice',
  ],
  'Insurance': [
    'Life Insurance',
    'Health Insurance',
    'Car Insurance',
    'Home Insurance',
    'Other Insurance',
  ],
  'Gifts & Donations': [
    'Gifts',
    'Charity',
    'Religious Donations',
    'Crowdfunding',
  ],
  'Kids & Family': [
    'Childcare',
    'Toys',
    'School Supplies',
    'Allowance',
    'Kids Activities',
    'Diapers & Baby Supplies',
  ],
  'Business Expenses': [
    'Office Supplies',
    'Business Travel',
    'Professional Services',
    'Marketing',
    'Equipment',
    'Licenses & Permits',
  ],
  'Subscriptions': [
    'Video Streaming',
    'Music Streaming',
    'Software Subscriptions',
    'News & Media',
    'Cloud Storage',
    'Other Subscriptions',
  ],
  'Utilities & Bills': [
    'Electric',
    'Water',
    'Gas',
    'Internet',
    'Phone',
    'Trash/Recycling',
  ],
  'Savings & Investments': [
    'Emergency Fund',
    'Retirement',
    'Stocks & Bonds',
    'Real Estate',
    'Cryptocurrency',
  ],
  'Miscellaneous': [
    'Other',
  ],
};

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  subcategory?: string;
  totalCost: number;
  usageMonths: number;
  monthlyCost: number;
  brandColor?: string;
  brandAccentColor?: string;
  brandLogoUrl?: string;
  imageUrl?: string;
  purchaseDate: string;
  notes?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  name: string;
  category: ExpenseCategory;
  subcategory?: string;
  totalCost: number;
  usageMonths: number;
  brandColor?: string;
  brandAccentColor?: string;
  brandLogoUrl?: string;
  imageUrl?: string;
  purchaseDate: string;
  notes?: string;
  groupId?: string;
}

export interface ExpenseSummary {
  totalMonthlyExpense: number;
  totalInvestment: number;
  expenseCount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
}
