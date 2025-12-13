import { useMemo, useState } from "react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";

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

// Helper functions for date manipulation
const parseDate = (dateStr: string) => new Date(dateStr);
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
const subMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() - months, date.getDate());
const formatMonth = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const isWithinInterval = (date: Date, interval: { start: Date; end: Date }) => 
  date >= interval.start && date <= interval.end;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3">
        <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          ₹{payload[0].value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

// Custom brush overlay inspired by MUI
const BrushOverlay = ({ 
  chartData, 
  brushStart, 
  brushEnd,
  chartWidth,
  chartHeight,
  margin
}: any) => {
  if (brushStart === null || brushEnd === null) return null;

  const startIdx = Math.min(brushStart, brushEnd);
  const endIdx = Math.max(brushStart, brushEnd);
  const startValue = chartData[startIdx]?.amount || 0;
  const endValue = chartData[endIdx]?.amount || 0;
  const difference = endValue - startValue;
  const percentChange = startValue !== 0 ? ((difference / startValue) * 100).toFixed(2) : '0.00';

  const dataLength = chartData.length;
  const pointWidth = (chartWidth - margin.left - margin.right) / (dataLength - 1);
  
  const startX = margin.left + (startIdx * pointWidth);
  const endX = margin.left + (endIdx * pointWidth);
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const rectWidth = maxX - minX;

  return (
    <g>
      {/* Selection rectangle */}
      <rect
        x={minX}
        y={margin.top}
        width={rectWidth}
        height={chartHeight - margin.top - margin.bottom}
        fill="#22c55e"
        fillOpacity={0.1}
        pointerEvents="none"
      />

      {/* Start vertical line */}
      <line
        x1={startX}
        y1={margin.top}
        x2={startX}
        y2={chartHeight - margin.bottom}
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="5,5"
        pointerEvents="none"
      />

      {/* End vertical line */}
      <line
        x1={endX}
        y1={margin.top}
        x2={endX}
        y2={chartHeight - margin.bottom}
        stroke="#22c55e"
        strokeWidth={2}
        strokeDasharray="5,5"
        pointerEvents="none"
      />

      {/* Start label */}
      <g transform={`translate(${startX}, ${margin.top + 15})`}>
        <rect x={-35} y={0} width={70} height={45} fill="#22c55e" rx={6} />
        <text x={0} y={18} textAnchor="middle" fill="white" fontSize={11} fontWeight="normal">
          {chartData[startIdx]?.month}
        </text>
        <text x={0} y={35} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
          ₹{startValue.toFixed(0)}
        </text>
      </g>

      {/* End label */}
      {startIdx !== endIdx && (
        <g transform={`translate(${endX}, ${margin.top + 15})`}>
          <rect x={-35} y={0} width={70} height={45} fill="#22c55e" rx={6} />
          <text x={0} y={18} textAnchor="middle" fill="white" fontSize={11} fontWeight="normal">
            {chartData[endIdx]?.month}
          </text>
          <text x={0} y={35} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
            ₹{endValue.toFixed(0)}
          </text>
        </g>
      )}

      {/* Difference label in the middle */}
      {startIdx !== endIdx && (
        <g transform={`translate(${(minX + maxX) / 2}, ${chartHeight - margin.bottom - 35})`}>
          <rect
            x={-60}
            y={0}
            width={120}
            height={30}
            fill={difference >= 0 ? "#22c55e" : "#ef4444"}
            rx={6}
          />
          <text
            x={0}
            y={20}
            textAnchor="middle"
            fill="white"
            fontSize={13}
            fontWeight="bold"
          >
            {difference >= 0 ? '+' : ''}₹{difference.toFixed(0)} ({percentChange}%)
          </text>
        </g>
      )}
    </g>
  );
};

export function ExpenseCharts({ expenses, selectedMonth }: ExpenseChartsProps) {
  const [brushStart, setBrushStart] = useState<number | null>(null);
  const [brushEnd, setBrushEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const monthlyExpenses = expenses.filter((exp) => {
      const expDate = parseDate(exp.expense_date);
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

  // Daily trend data (last 50 days)
  const trendData = useMemo(() => {
    const days = [];
    const now = new Date();
    
    for (let i = 49; i >= 0; i--) {
      const dayDate = new Date(now);
      dayDate.setDate(dayDate.getDate() - i);
      
      const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));
      
      const dailyTotal = expenses
        .filter((exp) => {
          const expDate = parseDate(exp.expense_date);
          return isWithinInterval(expDate, { start: dayStart, end: dayEnd });
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      days.push({
        month: formatMonth(dayDate),
        amount: Math.round(dailyTotal * 100) / 100,
      });
    }
    
    return days;
  }, [expenses]);

  const totalMonthly = categoryData.reduce((sum, item) => sum + item.value, 0);
  const hasData = categoryData.length > 0;

  if (expenses.length === 0) {
    return null;
  }

  const chartMargin = { top: 60, right: 30, left: 50, bottom: 60 };
  const chartWidth = 1000;
  const chartHeight = 400;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Interactive Line Chart with MUI-style Brush */}
      <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Custom brush overlay showing the values at start and end positions, and the difference between them.
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6 pt-4">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart
              data={trendData}
              margin={chartMargin}
              onMouseDown={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setBrushStart(e.activeTooltipIndex);
                  setBrushEnd(e.activeTooltipIndex);
                  setIsSelecting(true);
                }
              }}
              onMouseMove={(e) => {
                if (isSelecting && e && e.activeTooltipIndex !== undefined) {
                  setBrushEnd(e.activeTooltipIndex);
                }
              }}
              onMouseUp={() => setIsSelecting(false)}
              onMouseLeave={() => setIsSelecting(false)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return `₹${value}`;
                }}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
                itemStyle={{ color: '#22c55e' }}
              />
              
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 0 }}
              />

              <BrushOverlay 
                chartData={trendData}
                brushStart={brushStart}
                brushEnd={brushEnd}
                chartWidth={chartWidth}
                chartHeight={chartHeight}
                margin={chartMargin}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-br from-purple-50 to-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">Spending by Category</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">Monthly breakdown</p>
                </div>
              </div>
              {hasData && (
                <div className="text-right bg-purple-50 px-3 py-2 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">This Month</p>
                  <p className="text-sm font-bold text-purple-700">
                    ₹{totalMonthly.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-6 pt-4">
            {hasData ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {categoryData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600 truncate text-xs">{item.name}</span>
                      <span className="text-gray-900 font-semibold ml-auto text-xs">
                        ₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <p className="text-gray-400 text-sm">No expenses this month</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Bar Chart */}
        <Card className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-br from-green-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Daily Spending Pattern</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Last 30 days trend</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6 pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData.slice(-30)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                    return `₹${value}`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Bar
                  dataKey="amount"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg">
                <span className="text-sm text-green-700 font-medium">Last 30 days total</span>
                <span className="text-green-900 font-bold text-lg">
                  ₹{trendData.slice(-30).reduce((sum, d) => sum + d.amount, 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}