import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyChartProps {
  expenses: any[];
}

export function MonthlyExpensesChart({ expenses }: MonthlyChartProps) {
  const [monthlyExpenses, setMonthlyExpenses] = useState<number[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    calculateMonthlyExpenses();
  }, [expenses]);

  const calculateMonthlyExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyData = Array(6).fill(0);

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.expense_date);
      const monthDiff =
        (currentYear - expenseDate.getFullYear()) * 12 +
        (currentMonth - expenseDate.getMonth());

      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyData[5 - monthDiff] += expense.amount;
      }
    });

    setMonthlyExpenses(monthlyData);
  };

  const maxExpense = monthlyExpenses.length > 0 ? Math.max(...monthlyExpenses) : 1;
  const months = ["6M", "5M", "4M", "3M", "2M", "1M"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Monthly Expenses</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 6 months trend</p>
        </div>
        <button className="text-xs rounded-lg hover:bg-gray-100 p-2 transition-colors flex items-center gap-1 text-gray-600 font-medium">
          <Eye className="h-3 w-3" />
          View
        </button>
      </div>

      <div className="flex items-end justify-between gap-2 h-64 bg-gray-50 rounded-xl p-6">
        {monthlyExpenses.map((amount, i) => {
          const height = maxExpense > 0 ? (amount / maxExpense) * 100 : 0;
          const isLastBar = i === monthlyExpenses.length - 1;
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full gap-2 group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-teal-600"
                >
                  ₹{amount.toFixed(0)}
                </motion.div>
              )}

              <motion.div
                className={cn(
                  "w-full rounded-lg transition-all cursor-pointer",
                  isLastBar
                    ? "bg-gradient-to-t from-teal-500 to-teal-400 shadow-md"
                    : isHovered
                    ? "bg-gray-300"
                    : "bg-gray-200"
                )}
                style={{ height: `${Math.max(height, 8)}%` }}
                whileHover={{ y: -4 }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 8)}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />

              <span className="text-xs text-gray-500 font-medium">
                {months[i]}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default MonthlyExpensesChart;