# Expense Tracker

A modern, production-ready web application for tracking one-time purchases and converting them into monthly expenses. Perfect for managing housing, transportation, technology, education, and other major purchases with smart amortization.

![Expense Tracker Banner](public/banner.png)

## Features

- **Smart Amortization**: Convert one-time purchases into monthly costs based on expected usage lifetime
- **Category Management**: Organize expenses by categories (Housing, Transportation, Food & Dining, Technology & Electronics, etc.)
- **Real-time Statistics**: View total monthly expenses, total investment, and yearly projections
- **Category Breakdown**: Visual breakdown of expenses by category with percentage distribution
- **Search & Filter**: Easily find and filter expenses
- **Edit & Delete**: Full CRUD operations for managing your expenses
- **Persistent Storage**: All data saved locally in browser localStorage
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, sleek interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **State Management**: React hooks
- **Data Persistence**: localStorage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/naveen-5141/expense-tracker.git
cd expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding an Expense
1. Click "Add New Expense" button
2. Fill in the details:
   - **Item Name**: Name of the purchase (e.g., MacBook Pro)
   - **Category**: Select from predefined categories
   - **Total Cost**: The full purchase price in INR
   - **Expected Usage**: Number of months you'll use the item
   - **Notes**: Optional additional details
3. The monthly cost is automatically calculated
4. Click "Add Expense" to save


### Editing an Expense
1. Click the edit icon (pencil) on any expense card
2. Modify the details
3. Click "Update Expense" to save changes

### Deleting an Expense
1. Click the delete icon (trash) on any expense card
2. Confirm the deletion

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Deploy with one click

### Cloudflare Pages

1. Push your code to GitHub
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages**
3. Click **Create Application** > **Pages** > **Connect to Git**
4. Select your repository
5. Configure the build settings:
   - **Framework Preset**: Next.js (Static HTML Export) - *Note: We use `@cloudflare/next-on-pages` so select "None" if Next.js isn't working, but usually "Next.js" preset is fine if you override the command.*
   - **Build Command**: `npm run pages:build`
   - **Build Output Directory**: `.vercel/output/static`
   - **Node.js Version**: Set `NODE_VERSION` environment variable to `18` or higher (e.g., `20.10.0`)
6. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
7. Click **Save and Deploy**

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
