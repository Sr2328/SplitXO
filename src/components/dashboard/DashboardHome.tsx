import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Receipt,
  Plus,
  Calendar,
  IndianRupee,
  Wallet,
  Send,
  CreditCard,
  Eye,
  Download,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGroups } from "@/hooks/useGroups";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalances, Balance } from "@/hooks/useBalances";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
import { SettleModal } from "@/components/balances/SettleModal";
import { GroupCard } from "@/components/groups/GroupCard";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { Group } from "@/hooks/useGroups";

interface DashboardHomeProps {
  user: User;
}

type StatColor = "rose" | "emerald" | "blue";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color?: StatColor;
  iconBg?: string;
  delay: number;
}

export function DashboardHome({ user = { user_metadata: { full_name: "User" }, id: "default", email: "user@example.com" } as unknown as User }: DashboardHomeProps) {
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "User";
  const initials = user?.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  const { groups, createGroup, deleteGroup, getGroupMembers, addMemberByEmail, removeMember } =
    useGroups();
  const { expenses, createExpense, deleteExpense } = useExpenses();
  const { balances, totalOwed, totalOwe, createSettlement, calculateBalances } =
    useBalances();

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [walletFlipped, setWalletFlipped] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchMonthlyExpenses();
  }, [expenses]);

  const fetchMonthlyExpenses = async () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyData = Array(6).fill(0);

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.expense_date);
      const monthDiff = (currentYear - expenseDate.getFullYear()) * 12 + 
                        (currentMonth - expenseDate.getMonth());
      
      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyData[5 - monthDiff] += expense.amount;
      }
    });

    setMonthlyExpenses(monthlyData);
  };

  const handleManageMembers = (group: Group) => {
    setSelectedGroup(group);
    setManageMembersOpen(true);
  };

  const handleSettle = (balance: Balance) => {
    setSelectedBalance(balance);
    setSettleOpen(true);
  };

  const handleSettleSubmit = async (
    groupId: string,
    paidTo: string,
    amount: number,
    notes?: string
  ) => {
    await createSettlement(groupId, paidTo, amount, notes);
    await calculateBalances();
  };

  const refreshMembers = async () => {
    if (selectedGroup) {
      const members = await getGroupMembers(selectedGroup.id);
      setGroupMembers(members);
    }
  };

  const toggleFlip = (balanceId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(balanceId)) {
      newFlipped.delete(balanceId);
    } else {
      newFlipped.add(balanceId);
    }
    setFlippedCards(newFlipped);
  };

  const maxExpense = monthlyExpenses.length > 0 ? Math.max(...monthlyExpenses) : 1;
  const activeGroups = groups.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Welcome back, <span className="text-teal-600 font-extrabold">{userName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">Track expenses and settle balances effortlessly</p>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Goal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

            <div className="relative z-10 flex items-start justify-between mb-12">
              <div>
                <p className="text-emerald-50/70 text-xs font-semibold tracking-widest mb-1">
                  YOUR NET BALANCE
                </p>
                <h2 className="text-2xl font-bold">Balance Overview</h2>
              </div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer"
              >
                <Wallet className="h-6 w-6" />
              </motion.div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-emerald-50/60 text-xs font-semibold tracking-widest mb-2">
                  NET BALANCE
                </p>
                <p className="text-5xl font-bold tracking-tight">
                  ₹{(totalOwed - totalOwe).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    (totalOwed - totalOwe) >= 0 ? "bg-green-300" : "bg-yellow-300"
                  )}
                />
                <p className="text-emerald-50/80 text-sm font-medium">
                  {(totalOwed - totalOwe) >= 0 ? "You're owed overall" : "You owe overall"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="border border-white/30 text-white hover:bg-white/10 rounded-lg font-semibold"
                  onClick={() => setAddExpenseOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="You Owe"
              value={`₹${totalOwe.toFixed(2)}`}
              subtitle={`${balances.filter((b) => b.amount < 0).length} people`}
              icon={ArrowDownRight}
              color="rose"
              iconBg="bg-gradient-to-r from-[#ef473a] to-[#cb2d3e]"
              delay={0.2}
            />

            <StatCard
              title="Expenses"
              value={String(expenses.length)}
              subtitle="This month"
              icon={IndianRupee}
              color="emerald"
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
              delay={0.4}
            />
          </div>

          {/* Monthly Chart & Expense Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart Section - 60% */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Monthly Expenses</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Last 6 months trend</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs rounded-lg hover:bg-gray-100">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>

              {/* Dynamic Chart Container with proper height */}
              <div className="flex items-end justify-between gap-2 h-64 bg-gray-50 rounded-xl p-6">
                {monthlyExpenses.map((amount, i) => {
                  const height = maxExpense > 0 ? (amount / maxExpense) * 100 : 0;
                  const months = ["6M", "5M", "4M", "3M", "2M", "1M"];
                  const isLastBar = i === monthlyExpenses.length - 1;
                  const isHovered = hoveredIndex === i;

                  return (
                    <div 
                      key={i} 
                      className="flex-1 flex flex-col items-center justify-end h-full gap-2"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Show amount on hover */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-bold text-teal-600"
                        >
                          ₹{amount.toFixed(0)}
                        </motion.div>
                      )}

                      {/* Bar */}
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

                      {/* Month Label */}
                      <span className="text-xs text-gray-500 font-medium">
                        {months[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Expense Stats Card - 40% */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-1"
            >
              <div className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                {/* Emerald Container - Main Section */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 md:px-6 py-6 md:py-8 text-white rounded-2xl m-1">
                  <div className="space-y-3">
                    {/* Header */}
                    <div>
                      <p className="text-emerald-100 text-[8px] md:text-[9px] font-semibold tracking-wider mb-0.5">
                        EXPENSE SUMMARY
                      </p>
                      <h3 className="text-lg md:text-xl font-bold text-white">This Month</h3>
                    </div>

                    {/* Total Expense - Dynamic */}
                    <div className="space-y-1.5">
                      <p className="text-emerald-100 text-[8px] md:text-[9px] font-semibold tracking-wider">
                        TOTAL EXPENSES
                      </p>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          ₹{(monthlyExpenses[monthlyExpenses.length - 1] || 0).toFixed(2)}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-emerald-100/80">
                          {expenses.length} txn
                        </p>
                      </div>
                    </div>

                    {/* Settled Amount - Dynamic */}
                    <div className="space-y-1.5">
                      <p className="text-emerald-100 text-[8px] md:text-[9px] font-semibold tracking-wider">
                        SETTLED AMOUNT
                      </p>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xl md:text-2xl font-bold text-white">
                          ₹{totalOwe.toFixed(2)}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-emerald-100/80">
                          This month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - White Background */}
                <div className="p-4 md:p-5 space-y-2.5 bg-white">
                  {/* Personal Breakdown - Dynamic Calculation */}
                  <div className="space-y-2">
                    <p className="text-gray-700 text-[8px] md:text-[9px] font-bold tracking-wider uppercase">
                      Personal Breakdown
                    </p>
                    
                    {/* Calculate user's personal expense percentage */}
                    {(() => {
                      const currentMonthTotal = monthlyExpenses[monthlyExpenses.length - 1] || 0;
                      const userExpenses = expenses
                        .filter(exp => {
                          const expDate = new Date(exp.expense_date);
                          const now = new Date();
                          return expDate.getMonth() === now.getMonth() && 
                                 expDate.getFullYear() === now.getFullYear();
                        })
                        .reduce((sum, exp) => sum + exp.amount, 0);
                      
                      const percentage = currentMonthTotal > 0 
                        ? (userExpenses / currentMonthTotal) * 100 
                        : 0;

                      return (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs md:text-sm text-gray-700 font-medium">Your Expenses</p>
                            <p className="text-sm md:text-base font-bold text-emerald-600">
                              ₹{userExpenses.toFixed(2)}
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: 0.6, duration: 0.8 }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                          <p className="text-[10px] text-gray-500">{percentage.toFixed(1)}% of total</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Expenses
                </h3>
                <p className="text-xs text-gray-500 mt-1">Last transactions</p>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAddExpenseOpen(true)}
                  className="h-10 w-10 p-0 rounded-lg hover:bg-gray-100"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>

            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 mb-3"
                >
                  <IndianRupee className="h-8 w-8 text-gray-400" />
                </motion.div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  No expenses yet
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Start tracking by adding your first expense
                </p>
                <Button
                  size="sm"
                  onClick={() => setAddExpenseOpen(true)}
                  className="rounded-lg bg-teal-500 hover:bg-teal-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.slice(0, 4).map((expense, i) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    currentUserId={user?.id || "default"}
                    onDelete={(id) => deleteExpense(id)}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            )}

            {expenses.length > 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center pt-4 mt-2 border-t border-gray-100"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs font-medium gap-1 hover:bg-gray-50"
                >
                  View All Expenses
                  <ArrowDownRight className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Your Wallet */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Your Wallet</h3>
              <p className="text-xs text-gray-500 mt-1">Click to flip and see details</p>
            </div>

            <motion.div 
              onClick={() => setWalletFlipped(!walletFlipped)}
              animate={{ rotateY: walletFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              className={walletFlipped 
                  ? "p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl mb-5 cursor-pointer min-h-[220px] flex flex-col justify-between relative bg-gradient-to-r from-[#ef473a] to-[#cb2d3e] border border-red-400/30 transition-all"
                  : "p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl mb-5 cursor-pointer min-h-[220px] flex flex-col justify-between relative bg-gradient-to-br from-teal-500 to-emerald-600 border border-emerald-400/30 transition-all"
              }
              whileHover={{ scale: 1.05 }}
            >
              {!walletFlipped ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-70 tracking-widest mb-1">RECEIVABLE</p>
                      <p className="text-sm opacity-70">Amount Owed to You</p>
                    </div>
                    <CreditCard className="h-5 w-5 opacity-60" />
                  </div>

                  <div className="mt-auto">
                    <p className="text-4xl font-bold tracking-tight">
                      ₹{totalOwed.toFixed(2)}
                    </p>
                    <p className="text-xs opacity-70 mt-3">
                      {balances.filter((b) => b.amount > 0).length} people owe you
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-6 pt-4 border-t border-white/20">
                    <span className="text-xs font-semibold opacity-70">SPLITXO</span>
                    <span className="text-xs opacity-60">Click to flip</span>
                  </div>
                </>
              ) : (
                <div 
                  style={{ transform: "rotateY(180deg)" }}
                  className="flex flex-col justify-between h-full"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-70 tracking-widest mb-1">PAYABLE</p>
                      <p className="text-sm opacity-70">Amount You Owe</p>
                    </div>
                    <CreditCard className="h-5 w-5 opacity-60" />
                  </div>

                  <div className="mt-auto">
                    <p className="text-4xl font-bold tracking-tight">
                      ₹{totalOwe.toFixed(2)}
                    </p>
                    <p className="text-xs opacity-70 mt-3">
                      {balances.filter((b) => b.amount < 0).length} people waiting
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-6 pt-4 border-t border-white/20">
                    <span className="text-xs font-semibold opacity-70">SPLITXO</span>
                    <span className="text-xs opacity-60">Click to flip</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Dynamic Buttons Based on Flip State */}
            {!walletFlipped ? (
              <div className="space-y-2">
                {/* Receivable Side - Green Buttons */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAddExpenseOpen(true)}
                  style={{ 
                    background: "linear-gradient(to bottom right, rgb(16, 185, 129), rgb(5, 150, 105))"
                  }}
                  className="w-full rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all py-2.5 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Expense
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCreateGroupOpen(true)}
                  style={{ 
                    background: "linear-gradient(to bottom right, rgb(16, 185, 129), rgb(20, 184, 166))"
                  }}
                  className="w-full rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all py-2.5 flex items-center justify-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Create Group
                </motion.button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Payable Side - Red Buttons */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const negativeBalance = balances.find((b) => b.amount < 0);
                    if (negativeBalance) {
                      handleSettle(negativeBalance);
                    }
                  }}
                  style={{ 
                    background: "linear-gradient(to right, rgb(239, 68, 68), rgb(220, 38, 38))"
                  }}
                  className="w-full rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all py-2.5 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Settle Payment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAddExpenseOpen(true)}
                  style={{ 
                    background: "linear-gradient(to right, rgb(239, 68, 68), rgb(220, 38, 38))"
                  }}
                  className="w-full rounded-lg text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all py-2.5 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Expense
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Your Balances - Flip Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Balances</h3>
              <span className="text-xs text-gray-500">
                {balances.length} {balances.length === 1 ? "person" : "people"}
              </span>
            </div>

            {balances.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No balances yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {balances.slice(0, 4).map((balance, i) => {
                  const isFlipped = flippedCards.has(balance.userId);
                  return (
                    <motion.div
                      key={balance.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => toggleFlip(balance.userId)}
                      className="cursor-pointer"
                      style={{ perspective: "1000px" }}
                    >
                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ transformStyle: "preserve-3d" }}
                        className={cn(
                          "p-4 rounded-xl transition-all border-2 min-h-[110px] flex items-center justify-between shadow-md hover:shadow-lg",
                          balance.amount < 0
                            ? "bg-rose-50 border-rose-200 hover:border-rose-300"
                            : "bg-teal-50 border-teal-200 hover:border-teal-300"
                        )}
                      >
                        {!isFlipped ? (
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {balance.userName}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {balance.userEmail}
                            </p>
                            <div className="flex items-center gap-0.5 mt-1">
                              <p
                                className={cn(
                                  "text-xs font-medium",
                                  balance.amount > 0 ? "text-teal-600" : "text-rose-600"
                                )}
                              >
                                {balance.amount > 0 ? "Owed" : "Owes"}
                              </p>
                              <IndianRupee className="h-3 w-3" />
                              <p
                                className={cn(
                                  "text-xs font-semibold",
                                  balance.amount > 0 ? "text-teal-600" : "text-rose-600"
                                )}
                              >
                                {Math.abs(balance.amount).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div 
                            style={{ transform: "rotateY(180deg)" }}
                            className="w-full text-center"
                          >
                            <p className="text-xs text-gray-500 mb-1">
                              {balance.amount < 0 ? "You owe" : "They owe you"}
                            </p>
                            <p className={cn(
                              "text-2xl font-bold",
                              balance.amount > 0 ? "text-teal-600" : "text-rose-600"
                            )}>
                              ₹{Math.abs(balance.amount).toFixed(2)}
                            </p>
                          </div>
                        )}

                        {balance.amount < 0 && !isFlipped && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSettle(balance);
                            }}
                            className="rounded-lg bg-gradient-to-r from-[#ef473a] to-[#cb2d3e] text-white text-xs"
                          >
                            Pay
                          </Button>
                        )}

                        {balance.amount > 0 && !isFlipped && (
                          <ArrowDownRight className="h-4 w-4 text-teal-600" />
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Groups Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-lg font-bold text-gray-900">Active Groups</p>
                <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {activeGroups}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Total amount owed to you</p>
              <p className="text-4xl font-bold text-gray-900">
                ₹{totalOwed.toFixed(2)}
              </p>
            </div>

            <div className="border-t border-gray-100 my-6" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">All Groups</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your groups</p>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCreateGroupOpen(true)}
                    className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-3">No groups yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg w-full"
                    onClick={() => setCreateGroupOpen(true)}
                  >
                    Create Group
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0">
                    {groups.slice(0, 4).map((group, idx) => (
                      <motion.div
                        key={`${group.id}-avatar`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{ marginLeft: idx > 0 ? "-12px" : "0" }}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md cursor-pointer hover:shadow-lg transition-shadow hover:z-10 hover:scale-110"
                        title={group.name}
                        onClick={() => handleManageMembers(group)}
                        whileHover={{ scale: 1.15 }}
                      >
                        {group.name.substring(0, 2).toUpperCase()}
                      </motion.div>
                    ))}
                    {groups.length > 4 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ marginLeft: "-12px" }}
                        className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-bold border-2 border-white shadow-md cursor-pointer hover:shadow-lg transition-all hover:scale-110"
                        onClick={() => window.location.href = "/groups"}
                        whileHover={{ scale: 1.15 }}
                      >
                        +{groups.length - 4}
                      </motion.div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      window.location.href = "/groups";
                    }}
                    className="h-10 w-10 rounded-full bg-teal-500 hover:bg-teal-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={createGroup}
      />
      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        groups={groups}
        onSubmit={createExpense}
        getGroupMembers={getGroupMembers}
        currentUserId={user.id}
        onCreateGroup={() => {
          setAddExpenseOpen(false);
          setCreateGroupOpen(true);
        }}
      />
      <ManageMembersModal
        isOpen={manageMembersOpen}
        onClose={() => setManageMembersOpen(false)}
        group={selectedGroup}
        members={groupMembers}
        onAddMember={(email) => addMemberByEmail(selectedGroup!.id, email)}
        onRemoveMember={(userId) => removeMember(selectedGroup!.id, userId)}
        onRefresh={refreshMembers}
        currentUserId={user?.id || "default"}
      />
      <SettleModal
        isOpen={settleOpen}
        onClose={() => setSettleOpen(false)}
        balance={selectedBalance}
        groups={groups}
        onSubmit={handleSettleSubmit}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "emerald",
  iconBg,
  delay,
}: StatCardProps) {
  const colorStyles: Record<StatColor, string> = {
    rose: `
      bg-white border-gray-200
      hover:bg-rose-50/60
      hover:border-rose-300
    `,
    emerald: `
      bg-white border-gray-200
      hover:bg-emerald-50/60
      hover:border-emerald-300
    `,
    blue: `
      bg-white border-gray-200
      hover:bg-blue-50/60
      hover:border-blue-300
    `,
  };

  const iconFallbackStyles: Record<StatColor, string> = {
    rose: "bg-rose-100 text-rose-600",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "rounded-2xl border p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]",
        colorStyles[color]
      )}
    >
      <div
        className={cn(
          "p-2.5 rounded-lg w-fit mb-3 text-white",
          iconBg ?? iconFallbackStyles[color]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
        {title}
      </p>

      <p className="text-2xl font-bold text-gray-900">{value}</p>

      <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
    </motion.div>
  );
}




//  NEW DASHBOARD CODE COMPONENT


// import { useState } from "react";
// import { motion } from "framer-motion";
// import { User } from "@supabase/supabase-js";
// import {
//   TrendingUp,
//   ArrowUpRight,
//   ArrowDownRight,
//   Users,
//   Receipt,
//   Plus,
//   Calendar,
//   DollarSign,
//   IndianRupee,
//   Clock,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { useGroups, GroupMember } from "@/hooks/useGroups";
// import { useExpenses } from "@/hooks/useExpenses";
// import { useBalances, Balance } from "@/hooks/useBalances";
// import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
// import { GroupCard } from "@/components/groups/GroupCard";
// import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
// import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
// import { ExpenseCard } from "@/components/expenses/ExpenseCard";
// import { BalanceCard } from "@/components/balances/BalanceCard";
// import { SettleModal } from "@/components/balances/SettleModal";
// import { Group } from "@/hooks/useGroups";

// interface DashboardHomeProps {
//   user: User;
// }

// export function DashboardHome({ user }: DashboardHomeProps) {
//   const userName = user.user_metadata?.full_name?.split(" ")[0] || "there";
  
//   const { groups, createGroup, updateGroup, deleteGroup, getGroupMembers, addMemberByEmail, removeMember } = useGroups();
//   const { expenses, createExpense, deleteExpense } = useExpenses();
//   const { balances, totalOwed, totalOwe, createSettlement, calculateBalances } = useBalances();

//   const [createGroupOpen, setCreateGroupOpen] = useState(false);
//   const [addExpenseOpen, setAddExpenseOpen] = useState(false);
//   const [manageMembersOpen, setManageMembersOpen] = useState(false);
//   const [settleOpen, setSettleOpen] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//   const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
//   const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

//   const handleManageMembers = (group: Group) => {
//     setSelectedGroup(group);
//     setManageMembersOpen(true);
//   };

//   const refreshMembers = async () => {
//     if (selectedGroup) {
//       const members = await getGroupMembers(selectedGroup.id);
//       setGroupMembers(members);
//     }
//   };

//   const handleSettle = (balance: Balance) => {
//     setSelectedBalance(balance);
//     setSettleOpen(true);
//   };

//   const handleSettleSubmit = async (groupId: string, paidTo: string, amount: number, notes?: string) => {
//     await createSettlement(groupId, paidTo, amount, notes);
//     await calculateBalances();
//   };

//   const netBalance = totalOwed - totalOwe;
//   const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
//       {/* Left Main Content Area */}
//       <div className="flex-1 space-y-6">
//         {/* Welcome Header */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5 }}
//         >
//           <div className="flex items-center justify-between mb-2">
//             <h1 className="text-3xl md:text-4xl font-bold text-foreground">Hello, {userName}!</h1>
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Calendar className="h-4 w-4" />
//               <span className="hidden sm:inline">{currentDate}</span>
//             </div>
//           </div>
//           <p className="text-muted-foreground">Have a great day managing your expenses!</p>
//         </motion.div>

//         {/* Stats Cards Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <StatCard 
//             title="You Owe" 
//             value={totalOwe.toFixed(0)}
//             subtitle={`${balances.filter(b => b.amount < 0).length} people`} 
//             icon={ArrowUpRight} 
//             color="purple"
//             delay={0} 
//           />
//           <StatCard 
//             title="You're Owed" 
//             value={totalOwed.toFixed(0)}
//             subtitle={`${balances.filter(b => b.amount > 0).length} people`} 
//             icon={ArrowDownRight} 
//             color="green"
//             delay={0.1} 
//           />
//           <StatCard 
//             title="Finance" 
//             value={(totalOwed - totalOwe).toFixed(0)}
//             subtitle="Net Balance" 
//             icon={DollarSign} 
//             color="orange"
//             change="5.5% vs last month"
//             delay={0.2} 
//           />
//         </div>

//         {/* Recent Activity Section */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5, delay: 0.25 }} 
//           className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100"
//         >
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-foreground">Recent Goods Sales</h3>
//             <span className="text-xs text-muted-foreground">10 Dec</span>
//           </div>
//           <p className="text-sm text-muted-foreground mb-4">
//             You have sold <span className="font-semibold text-emerald-600">{expenses.length} products</span> this month.
//           </p>
//           <div className="h-32 flex items-end justify-between gap-2">
//             {/* Simple bar chart visualization */}
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '40%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '60%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '50%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '80%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '70%' }}></div>
//             <div className="flex-1 bg-emerald-500 rounded-t-lg relative" style={{ height: '100%' }}>
//               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-white text-xs px-2 py-1 rounded">
//                 32
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Quick Actions Grid */}
//         <div className="grid grid-cols-2 gap-4">
//           <ActionCard 
//             title="Create Appointment" 
//             icon={Calendar}
//             onClick={() => setAddExpenseOpen(true)}
//             delay={0.3}
//           />
//           <ActionCard 
//             title="Create Counter Sale" 
//             icon={Receipt}
//             onClick={() => setAddExpenseOpen(true)}
//             delay={0.35}
//           />
//           <ActionCard 
//             title="Create New Patient" 
//             icon={Users}
//             onClick={() => setCreateGroupOpen(true)}
//             delay={0.4}
//           />
//           <ActionCard 
//             title="Generate Monthly Report" 
//             icon={TrendingUp}
//             onClick={() => {}}
//             delay={0.45}
//           />
//         </div>

//         {/* Your Balances */}
//         {balances.length > 0 && (
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             transition={{ duration: 0.5, delay: 0.5 }} 
//             className="bg-white rounded-2xl border border-border/50 shadow-sm p-6"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-foreground">Your Balances</h2>
//               <Button variant="ghost" size="sm" className="text-xs">View All</Button>
//             </div>
//             <div className="space-y-3">
//               {balances.slice(0, 4).map((balance, i) => (
//                 <BalanceCard 
//                   key={balance.userId} 
//                   balance={balance} 
//                   onSettle={handleSettle} 
//                   delay={i * 0.05} 
//                 />
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </div>

//       {/* Right Sidebar - Schedule/Timeline */}
//       <div className="lg:w-[380px] space-y-6">
//         {/* Date Header */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex items-center justify-between"
//         >
//           <h2 className="text-lg font-semibold text-foreground">Today, 12 Dec.</h2>
//           <div className="text-xs text-muted-foreground">8:00 am</div>
//         </motion.div>

//         {/* Timeline of Expenses */}
//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="space-y-3"
//         >
//           {expenses.length === 0 ? (
//             <div className="bg-white rounded-2xl border border-border/50 p-8 text-center">
//               <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
//               <h3 className="font-semibold text-foreground mb-2">No expenses yet</h3>
//               <p className="text-sm text-muted-foreground mb-4">Start by adding your first expense</p>
//               <Button size="sm" onClick={() => setAddExpenseOpen(true)} className="rounded-xl">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Expense
//               </Button>
//             </div>
//           ) : (
//             expenses.slice(0, 6).map((expense, i) => (
//               <TimelineExpenseCard 
//                 key={expense.id} 
//                 expense={expense} 
//                 currentUserId={user.id}
//                 onDelete={(id) => deleteExpense(id)}
//                 delay={i * 0.05} 
//               />
//             ))
//           )}
//         </motion.div>

//         {/* Groups Section */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="bg-white rounded-2xl border border-border/50 shadow-sm p-5"
//         >
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-foreground">Your Groups</h3>
//             <Button 
//               variant="ghost" 
//               size="icon"
//               className="h-8 w-8 rounded-full"
//               onClick={() => setCreateGroupOpen(true)}
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//           {groups.length === 0 ? (
//             <div className="text-center py-6">
//               <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
//               <p className="text-sm text-muted-foreground mb-3">No groups yet</p>
//               <Button size="sm" variant="outline" onClick={() => setCreateGroupOpen(true)} className="rounded-xl">
//                 Create Group
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {groups.slice(0, 4).map((group, i) => (
//                 <CompactGroupCard 
//                   key={group.id} 
//                   group={group}
//                   onManageMembers={handleManageMembers}
//                   delay={i * 0.05}
//                 />
//               ))}
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Modals */}
//       <CreateGroupModal 
//         isOpen={createGroupOpen} 
//         onClose={() => setCreateGroupOpen(false)} 
//         onSubmit={createGroup} 
//       />
//       <AddExpenseModal 
//         isOpen={addExpenseOpen} 
//         onClose={() => setAddExpenseOpen(false)} 
//         groups={groups} 
//         onSubmit={createExpense} 
//         getGroupMembers={getGroupMembers} 
//         currentUserId={user.id} 
//         onCreateGroup={() => { 
//           setAddExpenseOpen(false); 
//           setCreateGroupOpen(true); 
//         }} 
//       />
//       <ManageMembersModal 
//         isOpen={manageMembersOpen} 
//         onClose={() => setManageMembersOpen(false)} 
//         group={selectedGroup} 
//         members={groupMembers} 
//         onAddMember={(email) => addMemberByEmail(selectedGroup!.id, email)} 
//         onRemoveMember={(userId) => removeMember(selectedGroup!.id, userId)} 
//         onRefresh={refreshMembers} 
//         currentUserId={user.id} 
//       />
//       <SettleModal 
//         isOpen={settleOpen} 
//         onClose={() => setSettleOpen(false)} 
//         balance={selectedBalance} 
//         groups={groups} 
//         onSubmit={handleSettleSubmit} 
//       />
//     </div>
//   );
// }

// function StatCard({ 
//   title, 
//   value, 
//   subtitle, 
//   icon: Icon, 
//   color,
//   change,
//   delay 
// }: { 
//   title: string; 
//   value: string; 
//   subtitle: string; 
//   icon: React.ElementType; 
//   color: "purple" | "green" | "orange";
//   change?: string;
//   delay: number; 
// }) {
//   const colorStyles = {
//     purple: "bg-purple-50 border-purple-100",
//     green: "bg-emerald-50 border-emerald-100",
//     orange: "bg-orange-50 border-orange-100"
//   };

//   const iconStyles = {
//     purple: "text-purple-600",
//     green: "text-emerald-600",
//     orange: "text-orange-600"
//   };

//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }} 
//       animate={{ opacity: 1, y: 0 }} 
//       transition={{ duration: 0.5, delay }} 
//       className={cn("rounded-2xl border p-5", colorStyles[color])}
//     >
//       <div className="flex items-start justify-between mb-3">
//         <Icon className={cn("h-5 w-5", iconStyles[color])} />
//       </div>
//       <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
//       <p className="text-3xl font-bold text-foreground mb-1">
//         {value}
//         <span className="text-lg ml-1">₹</span>
//       </p>
//       <p className="text-xs text-muted-foreground">{subtitle}</p>
//       {change && (
//         <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
//           <TrendingUp className="h-3 w-3" />
//           {change}
//         </p>
//       )}
//     </motion.div>
//   );
// }

// function ActionCard({ 
//   title, 
//   icon: Icon, 
//   onClick,
//   delay 
// }: { 
//   title: string; 
//   icon: React.ElementType; 
//   onClick: () => void;
//   delay: number;
// }) {
//   return (
//     <motion.button
//       initial={{ opacity: 0, scale: 0.9 }} 
//       animate={{ opacity: 1, scale: 1 }} 
//       transition={{ duration: 0.5, delay }}
//       onClick={onClick}
//       className="bg-teal-500 hover:bg-teal-600 text-white rounded-2xl p-6 text-left transition-all hover:scale-105 hover:shadow-lg group"
//     >
//       <div className="bg-white/20 rounded-xl p-3 w-fit mb-4 group-hover:bg-white/30 transition-colors">
//         <Icon className="h-6 w-6" />
//       </div>
//       <h3 className="font-semibold text-sm leading-tight">{title}</h3>
//     </motion.button>
//   );
// }

// function TimelineExpenseCard({ 
//   expense, 
//   currentUserId,
//   onDelete,
//   delay 
// }: { 
//   expense: any; 
//   currentUserId: string;
//   onDelete: (id: string) => void;
//   delay: number;
// }) {
//   const colors = ["rose", "emerald", "blue", "purple", "orange"];
//   const color = colors[Math.floor(Math.random() * colors.length)];
  
//   const bgColors = {
//     rose: "bg-rose-50 border-rose-100",
//     emerald: "bg-emerald-50 border-emerald-100",
//     blue: "bg-blue-50 border-blue-100",
//     purple: "bg-purple-50 border-purple-100",
//     orange: "bg-orange-50 border-orange-100"
//   };

//   const iconColors = {
//     rose: "bg-rose-500",
//     emerald: "bg-emerald-500",
//     blue: "bg-blue-500",
//     purple: "bg-purple-500",
//     orange: "bg-orange-500"
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.3, delay }}
//       className={cn("rounded-2xl border p-4", bgColors[color as keyof typeof bgColors])}
//     >
//       <div className="flex items-start gap-3">
//         <div className={cn("p-2 rounded-xl", iconColors[color as keyof typeof iconColors])}>
//           <Receipt className="h-4 w-4 text-white" />
//         </div>
//         <div className="flex-1 min-w-0">
//           <h4 className="font-semibold text-sm text-foreground truncate">{expense.description || "Expense"}</h4>
//           <p className="text-xs text-muted-foreground mt-0.5">₹{expense.amount?.toFixed(2) || "0.00"}</p>
//         </div>
//       </div>
//       <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
//         <span>{new Date(expense.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
//         <span className="truncate ml-2">{expense.paidBy || "Unknown"}</span>
//       </div>
//     </motion.div>
//   );
// }

// function CompactGroupCard({ 
//   group, 
//   onManageMembers,
//   delay 
// }: { 
//   group: any;
//   onManageMembers: (group: any) => void;
//   delay: number;
// }) {
//   return (
//     <motion.button
//       initial={{ opacity: 0, x: 10 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.3, delay }}
//       onClick={() => onManageMembers(group)}
//       className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left"
//     >
//       <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
//         {group.name?.[0]?.toUpperCase() || "G"}
//       </div>
//       <div className="flex-1 min-w-0">
//         <h4 className="font-semibold text-sm text-foreground truncate">{group.name}</h4>
//         <p className="text-xs text-muted-foreground">View details</p>
//       </div>
//     </motion.button>
//   );
// }