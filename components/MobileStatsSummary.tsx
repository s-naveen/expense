'use client';

import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, Package, Calendar } from 'lucide-react';

interface MobileStatsSummaryProps {
    monthlyExpense: number;
    totalInvestment: number;
    itemCount: number;
    yearlyProjection: number;
}

export default function MobileStatsSummary({
    monthlyExpense,
    totalInvestment,
    itemCount,
}: MobileStatsSummaryProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {/* Primary stat - Monthly Expense */}
            <div className="col-span-2 card p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Monthly</p>
                    <p className="text-lg font-bold text-foreground truncate">{formatCurrency(monthlyExpense)}</p>
                </div>
            </div>

            {/* Item count */}
            <div className="card p-3 flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-foreground">{itemCount}</p>
                <p className="text-[10px] text-muted-foreground">items</p>
            </div>

            {/* Secondary stats row */}
            <div className="card p-2.5 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground">Invested</p>
                    <p className="text-xs font-semibold text-foreground truncate">{formatCurrency(totalInvestment)}</p>
                </div>
            </div>

            <div className="col-span-2 card p-2.5 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                    <Calendar className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-muted-foreground">Yearly Projection</p>
                    <p className="text-xs font-semibold text-foreground">{formatCurrency(monthlyExpense * 12)}</p>
                </div>
            </div>
        </div>
    );
}
