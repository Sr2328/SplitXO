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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground mt-1">Track and manage all your shared expenses</p>
          </div>
          <Button onClick={() => setAddExpenseOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-xl", netBalance >= 0 ? "bg-success/10" : "bg-destructive/10")}>
                <Wallet className={cn("h-5 w-5", netBalance >= 0 ? "text-success" : "text-destructive")} />
              </div>
              <span className="text-sm text-muted-foreground">Net Balance</span>
            </div>
            <p className={cn("text-2xl font-bold", netBalance >= 0 ? "text-success" : "text-destructive")}>
              {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <ArrowUpRight className="h-5 w-5 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">You Owe</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalOwe.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              To {balances.filter((b) => b.amount < 0).length} people
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-success/10">
                <ArrowDownRight className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">You're Owed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalOwed.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              From {balances.filter((b) => b.amount > 0).length} people
            </p>
          </div>
        </motion.div>

        {/* Balances Section */}
        {balances.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl border border-border shadow-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Settle Up</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {balances.map((balance) => (
                <div
                  key={balance.userId}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {balance.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{balance.userName}</p>
                      <p className={cn("text-sm font-semibold", balance.amount > 0 ? "text-success" : "text-destructive")}>
                        {balance.amount > 0 ? `Owes you ₹${balance.amount.toFixed(2)}` : `You owe ₹${Math.abs(balance.amount).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  {balance.amount < 0 && (
                    <Button size="sm" variant="outline" onClick={() => handleSettle(balance)}>
                      Settle
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | "all")}
                className="appearance-none rounded-xl border border-input bg-background px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
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
                className="appearance-none rounded-xl border border-input bg-background px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
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

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border p-12 text-center"
          >
            <div className="p-4 rounded-full bg-muted inline-block mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {searchQuery || selectedCategory !== "all" || selectedGroupId !== "all"
                ? "No expenses found"
                : "No expenses yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all" || selectedGroupId !== "all"
                ? "Try different filters"
                : "Start tracking by adding your first expense"}
            </p>
            {!searchQuery && selectedCategory === "all" && selectedGroupId === "all" && (
              <Button onClick={() => setAddExpenseOpen(true)}>
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
                  className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => handleExpandExpense(expense.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Category Icon */}
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-xl", categoryColors[expense.category])}>
                        {categoryEmoji[expense.category]}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{expense.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {expense.group?.name || "Unknown"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(expense.expense_date), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">₹{Number(expense.amount).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              paid by {expense.paid_by === user.id ? "You" : expense.payer?.full_name || expense.payer?.email || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          expandedExpenseId === expense.id && "rotate-180"
                        )}
                      />
                    </div>
                  </div>

                  {/* Expanded Split Details */}
                  <AnimatePresence>
                    {expandedExpenseId === expense.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="p-4 bg-secondary/20">
                          <h4 className="text-sm font-medium text-foreground mb-3">Split Breakdown</h4>
                          {expenseSplits[expense.id]?.length ? (
                            <div className="space-y-2">
                              {expenseSplits[expense.id].map((split) => (
                                <div
                                  key={split.id}
                                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-background"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                      {(split.profile?.full_name || split.profile?.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-foreground">
                                      {split.user_id === user.id
                                        ? "You"
                                        : split.profile?.full_name || split.profile?.email || "Unknown"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                      ₹{Number(split.amount).toFixed(2)}
                                    </span>
                                    {split.is_settled && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
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
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Notes:</span> {expense.notes}
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

        {/* Recent Settlements */}
        {settlements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border shadow-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Settlements</h2>
            <div className="space-y-3">
              {settlements.slice(0, 5).map((settlement) => (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name || "Someone"} paid{" "}
                        {settlement.paid_to === user.id ? "you" : settlement.receiver?.full_name || "someone"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(settlement.settled_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-success">₹{Number(settlement.amount).toFixed(2)}</span>
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
    // Refresh expenses and balances after creating
    await calculateBalances();
    // The expenses should auto-refresh via Supabase realtime or you need to call a fetch function
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
