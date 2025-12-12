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
import { Plus, Wallet, Calendar, TrendingUp, Trash2, ArrowLeft, IndianRupee, Edit2, BarChart3 } from "lucide-react";
import { ExpenseCharts } from "@/components/charts/ExpenseCharts";
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
    fetchExpenses();
  }, []);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Personal Expenses</h1>
              <p className="text-muted-foreground text-sm">Track your personal spending</p>
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Edit Expense" : "Add Personal Expense"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Expense title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : editingExpense ? "Update Expense" : "Add Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-xl font-bold text-foreground flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Calendar className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-xl font-bold text-foreground flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {monthlyTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold text-foreground">{expenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Charts */}
        <ExpenseCharts expenses={expenses} selectedMonth={selectedMonth} />

        {/* Monthly Report Section */}
        <Card className="bg-card border-border mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Monthly Report</CardTitle>
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

        {/* Expenses List */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Expenses in {format(parseISO(`${selectedMonth}-01`), "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyExpenses.length > 0 ? (
              <div className="space-y-3">
                {monthlyExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{expense.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(expense.expense_date), "dd MMM yyyy")}
                        {expense.notes && ` • ${expense.notes}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {expense.amount.toLocaleString("en-IN")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No expenses recorded for this month. Click "Add Expense" to start tracking.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
