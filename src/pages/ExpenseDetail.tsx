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
  food: { emoji: "🍔", label: "Food & Dining", color: "bg-gradient-to-r from-orange-500/10 to-orange-400/10 text-orange-600 border border-orange-500/20" },
  transport: { emoji: "🚗", label: "Transport", color: "bg-gradient-to-r from-blue-500/10 to-blue-400/10 text-blue-600 border border-blue-500/20" },
  entertainment: { emoji: "🎬", label: "Entertainment", color: "bg-gradient-to-r from-purple-500/10 to-purple-400/10 text-purple-600 border border-purple-500/20" },
  shopping: { emoji: "🛍️", label: "Shopping", color: "bg-gradient-to-r from-pink-500/10 to-pink-400/10 text-pink-600 border border-pink-500/20" },
  utilities: { emoji: "💡", label: "Utilities", color: "bg-gradient-to-r from-yellow-500/10 to-yellow-400/10 text-yellow-600 border border-yellow-500/20" },
  rent: { emoji: "🏠", label: "Rent & Housing", color: "bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 text-emerald-600 border border-emerald-500/20" },
  travel: { emoji: "✈️", label: "Travel", color: "bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 text-cyan-600 border border-cyan-500/20" },
  healthcare: { emoji: "🏥", label: "Healthcare", color: "bg-gradient-to-r from-red-500/10 to-red-400/10 text-red-600 border border-red-500/20" },
  other: { emoji: "📦", label: "Other", color: "bg-gradient-to-r from-gray-500/10 to-gray-400/10 text-gray-600 border border-gray-500/20" },
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

        const { data: splitsData, error: splitsError } = await supabase
          .from("expense_splits")
          .select("*")
          .eq("expense_id", expenseId);

        if (splitsError) throw splitsError;

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-full h-10 w-10 border-3 border-teal-500/20 border-t-teal-600"
        />
      </div>
    );
  }

  if (!expense) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center py-20">
          <Receipt className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Expense not found</h2>
          <Button onClick={() => navigate("/expenses")} className="bg-teal-600 hover:bg-teal-700">
            Back to Expenses
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const category = categoryConfig[expense.category] || categoryConfig.other;

  return (
    <DashboardLayout user={user}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 -ml-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expense Details</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="flex-1 sm:flex-none text-teal-600 border-teal-300 hover:bg-teal-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            {(expense.created_by === user.id || expense.paid_by === user.id) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Main Expense Card - Fully Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Category Banner */}
          <div className={cn("px-4 sm:px-6 py-3 sm:py-4", category.color)}>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">{category.emoji}</span>
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="mb-1 inline-block text-xs sm:text-sm">
                  {category.label}
                </Badge>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {expense.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Amount Section - Responsive */}
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text">
              ₹{Number(expense.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">{expense.currency}</p>
          </div>

          {/* Details Grid - Responsive */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Paid By */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-4 p-3 sm:p-4 rounded-xl bg-emerald-50/60 border border-emerald-100/50 hover:border-emerald-200 transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-emerald-100 flex-shrink-0">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Paid by</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {(expense.payer?.full_name || expense.payer?.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {expense.paid_by === user.id ? "You" : expense.payer?.full_name || expense.payer?.email || "Unknown"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Group */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4 p-3 sm:p-4 rounded-xl bg-blue-50/60 border border-blue-100/50 hover:border-blue-200 transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-blue-100 flex-shrink-0 mt-0.5">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Group</p>
                <p className="font-semibold text-gray-900 mt-1.5 text-sm">
                  {expense.group?.name || "Unknown"}
                </p>
                {expense.group?.description && (
                  <p className="text-xs text-gray-600 mt-1">{expense.group.description}</p>
                )}
              </div>
            </motion.div>

            {/* Date */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-start gap-4 p-3 sm:p-4 rounded-xl bg-pink-50/60 border border-pink-100/50 hover:border-pink-200 transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-pink-100 flex-shrink-0 mt-0.5">
                <Calendar className="h-5 w-5 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Date</p>
                <p className="font-semibold text-gray-900 mt-1.5 text-sm">
                  {format(new Date(expense.expense_date), "MMM d, yyyy")}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Created {format(new Date(expense.created_at), "MMM d, h:mm a")}
                </p>
              </div>
            </motion.div>

            {/* Created By */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 p-3 sm:p-4 rounded-xl bg-yellow-50/60 border border-yellow-100/50 hover:border-yellow-200 transition-colors"
            >
              <div className="p-2.5 rounded-lg bg-yellow-100 flex-shrink-0">
                <StickyNote className="h-5 w-5 text-yellow-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Created by</p>
                <p className="font-semibold text-gray-900 mt-1.5 text-sm">
                  {expense.created_by === user.id ? "You" : expense.creator?.full_name || expense.creator?.email || "Unknown"}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="px-4 sm:px-6 pb-4 sm:pb-6"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">Notes</p>
                <p className="text-gray-900 text-sm whitespace-pre-wrap line-clamp-3 sm:line-clamp-none">
                  {expense.notes}
                </p>
              </div>
            </motion.div>
          )}

          {/* Receipt */}
          {expense.receipt_url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="px-4 sm:px-6 pb-4 sm:pb-6"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Receipt className="h-4 w-4 flex-shrink-0" />
                    Receipt
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs sm:text-sm"
                    >
                      <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs sm:text-sm"
                    >
                      <a href={expense.receipt_url} download>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
                <img
                  src={expense.receipt_url}
                  alt="Receipt"
                  className="w-full max-h-80 object-contain rounded-lg bg-white p-2"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Splits Section - Fully Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Split Details</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {splits.length} {splits.length === 1 ? "person" : "people"} • {settledCount} settled
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-600">Total Split</p>
              <p className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text">
                ₹{totalSplitAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {splits.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No splits recorded for this expense</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {splits.map((split, index) => (
                <motion.div
                  key={split.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0",
                        split.is_settled
                          ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                          : "bg-gradient-to-br from-teal-500 to-cyan-600 text-white"
                      )}
                    >
                      {(split.profile?.full_name || split.profile?.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {split.user_id === user.id ? "You" : split.profile?.full_name || split.profile?.email || "Unknown"}
                      </p>
                      {split.profile?.email && split.user_id !== user.id && (
                        <p className="text-xs text-gray-500 truncate">{split.profile.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="text-right flex-1 sm:flex-none">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        ₹{Number(split.amount).toFixed(2)}
                      </p>
                      <Badge
                        variant={split.is_settled ? "default" : "secondary"}
                        className={cn(
                          "mt-1 text-xs",
                          split.is_settled
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : "bg-yellow-100 text-yellow-700 border-yellow-300"
                        )}
                      >
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
                </motion.div>
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
          splits={splits} 
        />
      </div>
    </DashboardLayout>
  );
}