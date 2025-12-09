import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Expenses</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">Track and manage all your shared expenses</p>
          </div>
          <Button 
            onClick={() => setAddExpenseOpen(true)}
            className="rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </motion.div>

        {/* Enhanced Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-card rounded-2xl border border-border/50 shadow-md p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-2.5 rounded-xl", netBalance >= 0 ? "bg-success/10" : "bg-destructive/10")}>
                <Wallet className={cn("h-5 w-5", netBalance >= 0 ? "text-success" : "text-destructive")} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Net Balance</span>
            </div>
            <p className={cn("text-3xl font-bold tracking-tight", netBalance >= 0 ? "text-success" : "text-destructive")}>
              {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-md p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <ArrowUpRight className="h-5 w-5 text-destructive" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">You Owe</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">₹{totalOwe.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              To {balances.filter((b) => b.amount < 0).length} people
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-md p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-success/10">
                <ArrowDownRight className="h-5 w-5 text-success" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">You're Owed</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">₹{totalOwed.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
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
            className="bg-card rounded-[2rem] border border-border/50 shadow-lg p-6 md:p-7"
          >
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Settle Up</h2>
              <p className="text-xs text-muted-foreground mt-1">Clear your balances with friends</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {balances.map((balance) => (
                <div
                  key={balance.userId}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {balance.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{balance.userName}</p>
                      <p className={cn("text-xs font-semibold", balance.amount > 0 ? "text-success" : "text-destructive")}>
                        {balance.amount > 0 ? `Owes you ₹${balance.amount.toFixed(2)}` : `You owe ₹${Math.abs(balance.amount).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  {balance.amount < 0 && (
                    <Button size="sm" variant="outline" onClick={() => handleSettle(balance)} className="rounded-xl">
                      Settle
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | "all")}
                className="appearance-none rounded-xl border border-border/50 bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <option value="all">All Categories</option>
                {Object.keys(categoryEmoji).map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryEmoji[cat as ExpenseCategory]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="appearance-none rounded-xl border border-border/50 bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <option value="all">All Groups</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Enhanced Expenses List */}
        {filteredExpenses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-[2rem] border border-border/50 shadow-lg p-16 text-center"
          >
            <div className="p-5 rounded-2xl bg-muted/50 inline-block mb-6">
              <Receipt className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-3 text-xl">
              {searchQuery || selectedCategory !== "all" || selectedGroupId !== "all"
                ? "No expenses found"
                : "No expenses yet"}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-[300px] mx-auto">
              {searchQuery || selectedCategory !== "all" || selectedGroupId !== "all"
                ? "Try different filters"
                : "Start tracking by adding your first expense"}
            </p>
            {!searchQuery && selectedCategory === "all" && selectedGroupId === "all" && (
              <Button onClick={() => setAddExpenseOpen(true)} className="rounded-xl shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-card rounded-2xl border border-border/50 shadow-md hover:shadow-lg overflow-hidden transition-all"
                >
                  <div
                    className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => handleExpandExpense(expense.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Enhanced Category Icon */}
                      <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center text-2xl shadow-sm", categoryColors[expense.category])}>
                        {categoryEmoji[expense.category]}
                      </div>

                      {/* Enhanced Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-foreground text-lg truncate">{expense.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Users className="h-3.5 w-3.5" />
                                {expense.group?.name || "Unknown"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(expense.expense_date), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-foreground tracking-tight">₹{Number(expense.amount).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                              paid by {expense.paid_by === user.id ? "You" : expense.payer?.full_name || expense.payer?.email || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
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
                        <div className="p-5 bg-secondary/20">
                          <h4 className="text-sm font-bold text-foreground mb-4">Split Breakdown</h4>
                          {expenseSplits[expense.id]?.length ? (
                            <div className="space-y-2.5">
                              {expenseSplits[expense.id].map((split) => (
                                <div
                                  key={split.id}
                                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-background shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                      {(split.profile?.full_name || split.profile?.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                      {split.user_id === user.id
                                        ? "You"
                                        : split.profile?.full_name || split.profile?.email || "Unknown"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-foreground">
                                      ₹{Number(split.amount).toFixed(2)}
                                    </span>
                                    {split.is_settled && (
                                      <span className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-semibold">
                                        Settled
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Loading splits...</p>
                          )}
                          {expense.notes && (
                            <div className="mt-5 pt-5 border-t border-border/50">
                              <p className="text-sm text-muted-foreground">
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
            className="bg-card rounded-[2rem] border border-border/50 shadow-lg p-6 md:p-7"
          >
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Recent Settlements</h2>
              <p className="text-xs text-muted-foreground mt-1">Payment history</p>
            </div>
            <div className="space-y-3">
              {settlements.slice(0, 5).map((settlement) => (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-success/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name || "Someone"} paid{" "}
                        {settlement.paid_to === user.id ? "you" : settlement.receiver?.full_name || "someone"}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {format(new Date(settlement.settled_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-success">₹{Number(settlement.amount).toFixed(2)}</span>
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