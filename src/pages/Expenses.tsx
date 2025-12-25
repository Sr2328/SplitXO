import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import VerseLoading from "@/components/ui/Verselaoding";
import {
  Plus,
  Receipt,
  Search,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Users,
  Wallet,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { SettleModal } from "@/components/balances/SettleModal";
import { useGroups } from "@/hooks/useGroups";
import { useExpenses, Expense, ExpenseSplit, ExpenseCategory } from "@/hooks/useExpenses";
import { useBalances, Balance } from "@/hooks/useBalances";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const categoryEmoji: Record<ExpenseCategory, string> = {
  food: "🍔",
  transport: "🚗",
  entertainment: "🎬",
  shopping: "🛍️",
  utilities: "💡",
  rent: "🏠",
  travel: "✈️",
  healthcare: "🏥",
  other: "📦",
};

const categoryColors: Record<ExpenseCategory, string> = {
  food: "bg-orange-500/10 text-orange-600",
  transport: "bg-blue-500/10 text-blue-600",
  entertainment: "bg-purple-500/10 text-purple-600",
  shopping: "bg-pink-500/10 text-pink-600",
  utilities: "bg-yellow-500/10 text-yellow-600",
  rent: "bg-emerald-500/10 text-emerald-600",
  travel: "bg-cyan-500/10 text-cyan-600",
  healthcare: "bg-red-500/10 text-red-600",
  other: "bg-muted text-muted-foreground",
};

export default function Expenses() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | "all">("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const [expenseSplits, setExpenseSplits] = useState<Record<string, ExpenseSplit[]>>({});

  const { groups, createGroup, getGroupMembers } = useGroups();
  const { expenses, createExpense, deleteExpense, getExpenseSplits } = useExpenses();
  const { balances, totalOwed, totalOwe, settlements, createSettlement, calculateBalances } = useBalances();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleExpandExpense = async (expenseId: string) => {
    if (expandedExpenseId === expenseId) {
      setExpandedExpenseId(null);
      return;
    }

    setExpandedExpenseId(expenseId);

    if (!expenseSplits[expenseId]) {
      const splits = await getExpenseSplits(expenseId);
      setExpenseSplits((prev) => ({ ...prev, [expenseId]: splits }));
    }
  };

  const handleSettle = (balance: Balance) => {
    setSelectedBalance(balance);
    setSettleOpen(true);
  };

  const handleSettleSubmit = async (groupId: string, paidTo: string, amount: number, notes?: string) => {
    await createSettlement(groupId, paidTo, amount, notes);
    await calculateBalances();
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.group?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
    const matchesGroup = selectedGroupId === "all" || expense.group_id === selectedGroupId;

    return matchesSearch && matchesCategory && matchesGroup;
  });

  const netBalance = totalOwed - totalOwe;

 if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <VerseLoading />
      </div>
    );
  }


  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 pb-8">
        {/* Enhanced Responsive Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                Expenses
              </h1>
              <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm font-medium">
                Track and manage all your shared expenses
              </p>
            </div>
            <Button 
              onClick={() => setAddExpenseOpen(true)}
              className="rounded-xl shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Summary Cards - Fully Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          <div className="bg-card rounded-xl border border-border/50 shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={cn("p-2 sm:p-2.5 rounded-xl", netBalance >= 0 ? "bg-teal-500/10" : "bg-destructive/10")}>
                <Wallet className={cn("h-4 w-4 sm:h-5 sm:w-5", netBalance >= 0 ? "text-teal-600" : "text-destructive")} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Net Balance
              </span>
            </div>
            <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", netBalance >= 0 ? "text-teal-600" : "text-destructive")}>
              {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 font-medium">
              {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border/50 shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-destructive/10">
                <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                You Owe
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              ₹{totalOwe.toFixed(2)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 font-medium">
              To {balances.filter((b) => b.amount < 0).length} people
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border/50 shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10">
                <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                You're Owed
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              ₹{totalOwed.toFixed(2)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 font-medium">
              From {balances.filter((b) => b.amount > 0).length} people
            </p>
          </div>
        </motion.div>

        {/* Enhanced Balances Section */}
        {balances.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-xl border border-border/50 shadow-lg p-4 sm:p-5 lg:p-7"
          >
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Settle Up</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Clear your balances with friends</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {balances.map((balance) => (
                <div
                  key={balance.userId}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-br from-teal-500/5 to-emerald-500/5 hover:from-teal-500/10 hover:to-emerald-500/10 transition-colors border border-teal-500/10"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md flex-shrink-0">
                      {balance.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-xs sm:text-sm truncate">
                        {balance.userName}
                      </p>
                      <p className={cn("text-[10px] sm:text-xs font-semibold truncate", balance.amount > 0 ? "text-emerald-600" : "text-destructive")}>
                        {balance.amount > 0 ? `Owes you ₹${balance.amount.toFixed(2)}` : `You owe ₹${Math.abs(balance.amount).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  {balance.amount < 0 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSettle(balance)} 
                      className="rounded-xl ml-2 flex-shrink-0 text-xs border-teal-500/20 hover:bg-teal-500/10 hover:border-teal-500/30"
                    >
                      Settle
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Responsive Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600/60" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-11 h-11 sm:h-12 rounded-xl border-teal-500/20 focus:border-teal-500/50 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | "all")}
                className="appearance-none w-full rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 px-3 sm:px-4 py-2.5 sm:py-3 pr-9 sm:pr-10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 cursor-pointer hover:from-teal-500/10 hover:to-emerald-500/10 transition-colors"
              >
                <option value="all">All Categories</option>
                {Object.keys(categoryEmoji).map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryEmoji[cat as ExpenseCategory]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600/60 pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="appearance-none w-full rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 px-3 sm:px-4 py-2.5 sm:py-3 pr-9 sm:pr-10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 cursor-pointer hover:from-teal-500/10 hover:to-emerald-500/10 transition-colors"
              >
                <option value="all">All Groups</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600/60 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Enhanced Responsive Expenses List */}
        {filteredExpenses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-xl border border-border/50 shadow-lg p-8 sm:p-12 lg:p-16 text-center"
          >
            <div className="p-4 sm:p-5 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 inline-block mb-4 sm:mb-6">
              <IndianRupee className="h-8 w-8 sm:h-10 sm:w-10 text-teal-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2 sm:mb-3 text-lg sm:text-xl">
              {searchQuery || selectedCategory !== "all" || selectedGroupId !== "all"
                ? "No expenses found"
                : "No expenses yet"}
            </h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm max-w-[300px] mx-auto">
              {searchQuery || selectedCategory !== "all" || selectedGroupId !== "all"
                ? "Try different filters"
                : "Start tracking by adding your first expense"}
            </p>
            {!searchQuery && selectedCategory === "all" && selectedGroupId === "all" && (
              <Button 
                onClick={() => setAddExpenseOpen(true)} 
                className="rounded-xl shadow-sm bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card rounded-xl border border-border/50 shadow-md hover:shadow-lg overflow-hidden transition-all"
                >
                  <div
                    className="p-3 sm:p-4 lg:p-5 cursor-pointer hover:bg-gradient-to-br hover:from-teal-500/5 hover:to-emerald-500/5 transition-colors"
                    onClick={() => handleExpandExpense(expense.id)}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                      {/* Enhanced Category Icon */}
                      <div className={cn("h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0", categoryColors[expense.category])}>
                        {categoryEmoji[expense.category]}
                      </div>

                      {/* Enhanced Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-foreground text-sm sm:text-base lg:text-lg truncate">
                              {expense.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5">
                              <span className="flex items-center gap-1 sm:gap-1.5 font-medium">
                                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                <span className="truncate max-w-[100px] sm:max-w-none">{expense.group?.name || "Unknown"}</span>
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1 sm:gap-1.5">
                                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                                <span className="whitespace-nowrap">{format(new Date(expense.expense_date), "MMM d, yyyy")}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground tracking-tight whitespace-nowrap">
                              ₹{Number(expense.amount).toFixed(2)}
                            </p>
                            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-medium mt-0.5 whitespace-nowrap">
                              {expense.paid_by === user.id ? "You paid" : "Paid"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform flex-shrink-0",
                          expandedExpenseId === expense.id && "rotate-180"
                        )}
                      />
                    </div>
                  </div>

                  {/* Enhanced Expanded Split Details */}
                  <AnimatePresence>
                    {expandedExpenseId === expense.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/50 overflow-hidden"
                      >
                        <div className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground mb-3 sm:mb-4">Split Breakdown</h4>
                          {expenseSplits[expense.id]?.length ? (
                            <div className="space-y-2 sm:space-y-2.5">
                              {expenseSplits[expense.id].map((split) => (
                                <div
                                  key={split.id}
                                  className="flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-background shadow-sm"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-600 text-xs sm:text-sm font-bold flex-shrink-0">
                                      {(split.profile?.full_name || split.profile?.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                                      {split.user_id === user.id
                                        ? "You"
                                        : split.profile?.full_name || split.profile?.email || "Unknown"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                    <span className="text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">
                                      ₹{Number(split.amount).toFixed(2)}
                                    </span>
                                    {split.is_settled && (
                                      <span className="text-[9px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold whitespace-nowrap">
                                        Settled
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground">Loading splits...</p>
                          )}
                          {expense.notes && (
                            <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/50">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                <span className="font-semibold">Notes:</span> {expense.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Enhanced Recent Settlements */}
        {settlements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border/50 shadow-lg p-4 sm:p-5 lg:p-7"
          >
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Recent Settlements</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Payment history</p>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {settlements.slice(0, 5).map((settlement) => (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10 transition-colors border border-emerald-500/10"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name || "Someone"} paid{" "}
                        {settlement.paid_to === user.id ? "you" : settlement.receiver?.full_name || "someone"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                        {format(new Date(settlement.settled_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 flex-shrink-0 whitespace-nowrap">
                    ₹{Number(settlement.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
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
        onSuccess={async () => {
          await calculateBalances();
        }}
      />
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={createGroup}
      />
      <SettleModal
        isOpen={settleOpen}
        onClose={() => setSettleOpen(false)}
        balance={selectedBalance}
        groups={groups}
        onSubmit={handleSettleSubmit}
      />
    </DashboardLayout>
  );
}