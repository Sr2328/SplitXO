import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Users,
  Receipt,
  StickyNote,
  User,
  Check,
  Clock,
  Share2,
  Trash2,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ShareReceiptModal } from "@/components/groups/ShareReceiptModal";
import { ExpenseCategory, ExpenseSplit } from "@/hooks/useExpenses";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface ExpenseWithDetails {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paid_by: string;
  receipt_url: string | null;
  notes: string | null;
  expense_date: string;
  created_by: string | null;
  created_at: string;
  group?: {
    name: string;
    description: string | null;
  };
  payer?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  creator?: {
    full_name: string | null;
    email: string | null;
  };
}

const categoryConfig: Record<ExpenseCategory, { emoji: string; label: string; color: string }> = {
  food: { emoji: "🍔", label: "Food & Dining", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  transport: { emoji: "🚗", label: "Transport", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  entertainment: { emoji: "🎬", label: "Entertainment", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  shopping: { emoji: "🛍️", label: "Shopping", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  utilities: { emoji: "💡", label: "Utilities", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  rent: { emoji: "🏠", label: "Rent & Housing", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  travel: { emoji: "✈️", label: "Travel", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  healthcare: { emoji: "🏥", label: "Healthcare", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  other: { emoji: "📦", label: "Other", color: "bg-muted text-muted-foreground border-border" },
};

export default function ExpenseDetail() {
  const navigate = useNavigate();
  const { expenseId } = useParams<{ expenseId: string }>();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState<ExpenseWithDetails | null>(null);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!expenseId || !user) return;

    const fetchExpenseDetails = async () => {
      try {
        // Fetch expense basic data first
        const { data: expenseData, error: expenseError } = await supabase
          .from("expenses")
          .select("*")
          .eq("id", expenseId)
          .maybeSingle();

        if (expenseError) throw expenseError;
        if (!expenseData) {
          toast.error("Expense not found");
          navigate("/expenses");
          return;
        }

        // Fetch related data separately
        const [groupResult, payerResult, creatorResult] = await Promise.all([
          supabase
            .from("groups")
            .select("name, description")
            .eq("id", expenseData.group_id)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("full_name, email, avatar_url")
            .eq("user_id", expenseData.paid_by)
            .maybeSingle(),
          expenseData.created_by
            ? supabase
                .from("profiles")
                .select("full_name, email")
                .eq("user_id", expenseData.created_by)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null })
        ]);

        const formattedExpense = {
          ...expenseData,
          group: groupResult.data || undefined,
          payer: payerResult.data || undefined,
          creator: creatorResult.data || undefined,
        };

        setExpense(formattedExpense);

        // Fetch expense splits
        const { data: splitsData, error: splitsError } = await supabase
          .from("expense_splits")
          .select("*")
          .eq("expense_id", expenseId);

        if (splitsError) throw splitsError;

        // Fetch profiles for splits
        if (splitsData && splitsData.length > 0) {
          const userIds = [...new Set(splitsData.map(s => s.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, full_name, email, avatar_url")
            .in("user_id", userIds);

          const profileMap = new Map(
            (profilesData || []).map(p => [p.user_id, p])
          );

          const formattedSplits = splitsData.map((split) => ({
            ...split,
            profile: profileMap.get(split.user_id),
          }));

          setSplits(formattedSplits);
        }

        // Fetch group members for share modal
        const { data: membersData } = await supabase
          .from("group_members")
          .select("user_id, role")
          .eq("group_id", expenseData.group_id);

        if (membersData && membersData.length > 0) {
          const memberIds = membersData.map(m => m.user_id);
          const { data: memberProfilesData } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", memberIds);

          const profileMap = new Map(
            (memberProfilesData || []).map(p => [p.user_id, p])
          );

          const formattedMembers = membersData.map((m) => ({
            user_id: m.user_id,
            role: m.role,
            profile: profileMap.get(m.user_id),
          }));
          
          setGroupMembers(formattedMembers);
        }
      } catch (error: any) {
        console.error("Error fetching expense:", error);
        toast.error("Failed to load expense details");
        navigate("/expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [expenseId, user, navigate]);

  const handleDelete = async () => {
    if (!expense) return;
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
      if (error) throw error;
      toast.success("Expense deleted");
      navigate("/expenses");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete expense");
    }
  };

  const totalSplitAmount = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  const settledCount = splits.filter((s) => s.is_settled).length;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!expense) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center py-20">
          <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Expense not found</h2>
          <Button onClick={() => navigate("/expenses")}>Back to Expenses</Button>
        </div>
      </DashboardLayout>
    );
  }

  const category = categoryConfig[expense.category] || categoryConfig.other;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Expense Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShareModalOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {(expense.created_by === user.id || expense.paid_by === user.id) && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </motion.div>

        {/* Main Expense Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
        >
          {/* Category Banner */}
          <div className={cn("px-6 py-4 border-b border-border", category.color)}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.emoji}</span>
              <div>
                <Badge variant="secondary" className="mb-1">
                  {category.label}
                </Badge>
                <h2 className="text-xl font-bold">{expense.title}</h2>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="px-6 py-8 text-center border-b border-border bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="text-4xl md:text-5xl font-bold text-foreground">
              ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{expense.currency}</p>
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid By */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid by</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {(expense.payer?.full_name || expense.payer?.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {expense.paid_by === user.id ? "You" : expense.payer?.full_name || expense.payer?.email || "Unknown"}
                    </p>
                    {expense.payer?.email && expense.paid_by !== user.id && (
                      <p className="text-xs text-muted-foreground">{expense.payer.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Group */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Group</p>
                <p className="font-medium text-foreground mt-1">{expense.group?.name || "Unknown"}</p>
                {expense.group?.description && (
                  <p className="text-xs text-muted-foreground">{expense.group.description}</p>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-foreground mt-1">
                  {format(new Date(expense.expense_date), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created {format(new Date(expense.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* Created By */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <StickyNote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created by</p>
                <p className="font-medium text-foreground mt-1">
                  {expense.created_by === user.id ? "You" : expense.creator?.full_name || expense.creator?.email || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="px-6 pb-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                <p className="text-foreground whitespace-pre-wrap">{expense.notes}</p>
              </div>
            </div>
          )}

          {/* Receipt */}
          {expense.receipt_url && (
            <div className="px-6 pb-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Receipt
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={expense.receipt_url} download>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
                <img
                  src={expense.receipt_url}
                  alt="Receipt"
                  className="w-full max-h-64 object-contain rounded-lg bg-background"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Splits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Split Details</h3>
              <p className="text-sm text-muted-foreground">
                {splits.length} {splits.length === 1 ? "person" : "people"} • {settledCount} settled
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Split</p>
              <p className="font-semibold text-foreground">₹{totalSplitAmount.toFixed(2)}</p>
            </div>
          </div>

          {splits.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No splits recorded for this expense</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {splits.map((split) => (
                <div key={split.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold",
                      split.is_settled ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                    )}>
                      {(split.profile?.full_name || split.profile?.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {split.user_id === user.id ? "You" : split.profile?.full_name || split.profile?.email || "Unknown"}
                      </p>
                      {split.profile?.email && split.user_id !== user.id && (
                        <p className="text-xs text-muted-foreground">{split.profile.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₹{Number(split.amount).toFixed(2)}</p>
                      <Badge variant={split.is_settled ? "default" : "secondary"} className="mt-1">
                        {split.is_settled ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Settled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Share Modal */}
        <ShareReceiptModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          expense={expense as any}
          members={groupMembers}
        />
      </div>
    </DashboardLayout>
  );
}