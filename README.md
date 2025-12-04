# Monthly Expense Tracker

A modern, production-ready web application for tracking one-time purchases and converting them into monthly expenses. Perfect for managing housing, transportation, technology, education, and other major purchases with smart amortization.

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

1. Navigate to the project directory:
```bash
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

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Deployment

This application can be deployed to any platform that supports Next.js:

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Deploy with one click

### Netlify

1. Build the application: `npm run build`
2. Deploy the `.next` folder to Netlify

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t expense-tracker .
docker run -p 3000:3000 expense-tracker
```

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

### Filtering Expenses

- Use the search box to find expenses by name or category
- Use the category dropdown to filter by specific category

## Project Structure

```
expense-tracker/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── CategoryBreakdown.tsx   # Category visualization
│   ├── ExpenseForm.tsx         # Add/Edit expense form
│   ├── ExpenseItem.tsx         # Individual expense card
│   └── StatsCard.tsx           # Statistics card component
├── lib/
│   ├── storage.ts          # localStorage utilities
│   └── utils.ts            # Helper functions
├── types/
│   └── expense.ts          # TypeScript type definitions
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Features in Detail

### Monthly Cost Calculation

The app automatically calculates monthly cost using the formula:
```
Monthly Cost = Total Cost / Usage Months
```

### Category System

20 predefined categories with unique icons and colors:
- 🏠 Housing (Amber)
- 🚗 Transportation (Blue)
- 🍽 Food & Dining (Rose)
- 🛍 Shopping (Fuchsia)
- 🎬 Entertainment (Indigo)
- 💻 Technology & Electronics (Sky)
- 🏋️ Health & Fitness (Emerald)
- 🎓 Education (Violet)
- 💅 Personal Care (Pink)
- 🐾 Pets (Orange)
- ✈️ Travel (Cyan)
- 💰 Financial (Slate)
- 🛡️ Insurance (Yellow)
- 🎁 Gifts & Donations (Red)
- 👪 Kids & Family (Lime)
- 💼 Business Expenses (Stone)
- 🔁 Subscriptions (Purple)
- 💡 Utilities & Bills (Teal)
- 📈 Savings & Investments (Green)
- 📦 Miscellaneous (Gray)

### Statistics Dashboard

- **Total Monthly Expense**: Sum of all monthly costs
- **Total Investment**: Sum of all purchase prices
- **Total Items**: Count of tracked expenses
- **Yearly Impact**: Annual projection (monthly × 12)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Data Privacy

All data is stored locally in your browser using localStorage. No data is sent to external servers.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using Next.js, React, and Tailwind CSS
