import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

interface PersonalExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface ExpenseChartsProps {
  expenses: PersonalExpense[];
  selectedMonth: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f97316",
  transport: "#3b82f6",
  entertainment: "#a855f7",
  shopping: "#ec4899",
  utilities: "#eab308",
  rent: "#ef4444",
  travel: "#06b6d4",
  healthcare: "#22c55e",
  education: "#6366f1",
  personal: "#14b8a6",
  other: "#6b7280",
};

export function ExpenseCharts({ expenses, selectedMonth }: ExpenseChartsProps) {
  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const monthlyExpenses = expenses.filter((exp) => {
      const expDate = parseISO(exp.expense_date);
      return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
    });

    const breakdown: Record<string, number> = {};
    monthlyExpenses.forEach((exp) => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });

    return Object.entries(breakdown)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value * 100) / 100,
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS.other,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, selectedMonth]);

  // Monthly trend data (last 6 months)
  const trendData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthlyTotal = expenses
        .filter((exp) => {
          const expDate = parseISO(exp.expense_date);
          return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      months.push({
        month: format(monthDate, "MMM"),
        amount: Math.round(monthlyTotal * 100) / 100,
      });
    }
    
    return months;
  }, [expenses]);

  // Daily spending for the selected month
  const dailyData = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const dailySpending: Record<string, number> = {};
    
    expenses
      .filter((exp) => {
        const expDate = parseISO(exp.expense_date);
        return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
      })
      .forEach((exp) => {
        const day = format(parseISO(exp.expense_date), "d");
        dailySpending[day] = (dailySpending[day] || 0) + exp.amount;
      });

    return Object.entries(dailySpending)
      .map(([day, amount]) => ({
        day: parseInt(day),
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => a.day - b.day);
  }, [expenses, selectedMonth]);

  const totalMonthly = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Category Pie Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {categoryData.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No expenses this month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">6-Month Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Spent"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}