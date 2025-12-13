import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Plus, Wallet, Calendar, TrendingUp, Trash2, ArrowLeft, IndianRupee, Edit2, BarChart3, Receipt, TrendingDown } from "lucide-react";
import { ExpenseCharts } from "@/components/charts/ExpenseCharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface PersonalExpense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  "food",
  "transport",
  "entertainment",
  "shopping",
  "utilities",
  "rent",
  "travel",
  "healthcare",
  "education",
  "personal",
  "other"
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    food: "bg-orange-500/20 text-orange-400",
    transport: "bg-blue-500/20 text-blue-400",
    entertainment: "bg-purple-500/20 text-purple-400",
    shopping: "bg-pink-500/20 text-pink-400",
    utilities: "bg-yellow-500/20 text-yellow-400",
    rent: "bg-red-500/20 text-red-400",
    travel: "bg-cyan-500/20 text-cyan-400",
    healthcare: "bg-green-500/20 text-green-400",
    education: "bg-indigo-500/20 text-indigo-400",
    personal: "bg-teal-500/20 text-teal-400",
    other: "bg-gray-500/20 text-gray-400",
  };
  return colors[category] || colors.other;
};

export default function PersonalExpenses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));
  
  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [expenseDate, setExpenseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
    fetchExpenses();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
    } catch (error: any) {
      console.error("Error checking user:", error);
      navigate("/auth");
    }
  };

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("personal_expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("other");
    setExpenseDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingExpense) {
        const { error } = await supabase
          .from("personal_expenses")
          .update({
            title: title.trim(),
            amount: parseFloat(amount),
            category,
            expense_date: expenseDate,
            notes: notes.trim() || null,
          })
          .eq("id", editingExpense.id);

        if (error) throw error;
        toast({ title: "Expense updated successfully" });
      } else {
        const { error } = await supabase
          .from("personal_expenses")
          .insert({
            user_id: user.id,
            title: title.trim(),
            amount: parseFloat(amount),
            category,
            expense_date: expenseDate,
            notes: notes.trim() || null,
          });

        if (error) throw error;
        toast({ title: "Expense added successfully" });
      }

      resetForm();
      setIsAddModalOpen(false);
      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personal_expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Expense deleted" });
      fetchExpenses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (expense: PersonalExpense) => {
    setEditingExpense(expense);
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setExpenseDate(expense.expense_date);
    setNotes(expense.notes || "");
    setIsAddModalOpen(true);
  };

  // Calculate totals
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // Monthly expenses for selected month
  const monthlyExpenses = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    return expenses.filter((exp) => {
      const expDate = parseISO(exp.expense_date);
      return isWithinInterval(expDate, { start: monthStart, end: monthEnd });
    });
  }, [expenses, selectedMonth]);

  const monthlyTotal = useMemo(() => {
    return monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [monthlyExpenses]);

  // Category breakdown for selected month
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    monthlyExpenses.forEach((exp) => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyExpenses]);

  // Generate available months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const now = new Date();
    // Add current month and past 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.add(format(date, "yyyy-MM"));
    }
    // Add months from expenses
    expenses.forEach((exp) => {
      months.add(format(parseISO(exp.expense_date), "yyyy-MM"));
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header with Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-emerald-100 text-sm uppercase tracking-wide mb-2">BALANCE AMOUNT</p>
              <div className="flex items-baseline gap-2">
                <IndianRupee className="h-8 w-8 md:h-10 md:w-10" />
                <h1 className="text-4xl md:text-5xl font-bold">{monthlyTotal.toFixed(2)}</h1>
              </div>
              <div className="mt-3 inline-block bg-emerald-400/30 px-3 py-1 rounded-full">
                <p className="text-xs text-white">You've spent this month</p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="icon"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-xl h-12 w-12"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden group hover:-translate-y-1">
  <CardContent className="p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
        <TrendingUp className="h-6 w-6 text-white" />
      </div>
    </div>
    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Total Expenses</p>
    <div className="flex items-baseline gap-1">
      <IndianRupee className="h-5 w-5 text-gray-700" />
      <p className="text-2xl font-bold text-gray-900">{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
    </div>
    <p className="text-xs text-gray-400 mt-2">All time</p>
  </CardContent>
</Card>

      {/* THIS MONTH */}
<Card className="bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden group hover:-translate-y-1">
  <CardContent className="p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
        <Receipt className="h-6 w-6 text-white" />
      </div>
    </div>

    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
      This Month
    </p>

    <div className="flex items-baseline gap-1">
      <IndianRupee className="h-5 w-5 text-gray-700" />
      <p className="text-2xl font-bold text-gray-900">
        {monthlyTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>
    </div>

    <p className="text-xs text-gray-400 mt-2">
      {format(parseISO(`${selectedMonth}-01`), "MMMM yyyy")}
    </p>
  </CardContent>
</Card>

{/* TRANSACTIONS */}
<Card className="bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden group hover:-translate-y-1">
  <CardContent className="p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
        <BarChart3 className="h-6 w-6 text-white" />
      </div>
    </div>

    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
      Transactions
    </p>

    <p className="text-2xl font-bold text-gray-900">
      {monthlyExpenses.length}
    </p>

    <p className="text-xs text-gray-400 mt-2">
      This month
    </p>
  </CardContent>
</Card>

{/* AVG PER DAY */}
<Card className="bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl overflow-hidden group hover:-translate-y-1">
  <CardContent className="p-5">
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
        <TrendingDown className="h-6 w-6 text-white" />
      </div>
    </div>

    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
      Avg per day
    </p>

    <div className="flex items-baseline gap-1">
      <IndianRupee className="h-5 w-5 text-gray-700" />
      <p className="text-2xl font-bold text-gray-900">
        {monthlyExpenses.length > 0
          ? (
              monthlyTotal /
              new Date(
                parseISO(`${selectedMonth}-01`).getFullYear(),
                parseISO(`${selectedMonth}-01`).getMonth() + 1,
                0
              ).getDate()
            ).toLocaleString("en-IN", { minimumFractionDigits: 2 })
          : "0.00"}
      </p>
    </div>

    <p className="text-xs text-gray-400 mt-2">
      Daily average
    </p>
  </CardContent>
</Card>

        </div>

        {/* Charts Section */}
        <ExpenseCharts expenses={expenses} selectedMonth={selectedMonth} />

        {/* Monthly Report Section */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Monthly Report</CardTitle>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {format(parseISO(`${month}-01`), "MMMM yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {categoryBreakdown.map(({ category, amount }) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)}`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(amount / monthlyTotal) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-24 text-right flex items-center justify-end">
                        <IndianRupee className="h-3 w-3" />
                        {amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-bold text-foreground flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {monthlyTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No expenses for this month</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses Section */}
        <Card className="bg-card border-border shadow-sm">
          <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Expenses</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Last transactions</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-primary hover:text-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <CardContent className="p-0">
            {monthlyExpenses.length > 0 ? (
              <div className="divide-y divide-border">
                {monthlyExpenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleEdit(expense)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {expense.category.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base">{expense.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {expense.notes && `${expense.notes} • `}
                          {format(parseISO(expense.expense_date), "dd MMM yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 text-lg flex items-center">
                          -<IndianRupee className="h-4 w-4" />
                          {expense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(parseISO(expense.expense_date), "dd MMM, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Receipt className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No expenses recorded</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Click the + button to add your first expense</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingExpense ? "Edit Expense" : "Add Personal Expense"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Dinner at restaurant"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                {editingExpense && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      handleDelete(editingExpense.id);
                      setIsAddModalOpen(false);
                    }}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                )}
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {submitting ? "Saving..." : editingExpense ? "Update" : "Add Expense"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}