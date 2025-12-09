import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ExpenseCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "utilities"
  | "rent"
  | "travel"
  | "healthcare"
  | "other";

export interface Expense {
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
  };
  payer?: {
    full_name: string | null;
    email: string | null;
  };
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  is_settled: boolean;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface SplitInput {
  user_id: string;
  amount: number;
}

export function useExpenses(groupId?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      console.log("🔍 Fetching expenses...");
      
      let query = supabase
        .from("expenses")
        .select(`
          *,
          group:groups(name),
          payer:profiles!expenses_paid_by_fkey(full_name, email)
        `)
        .order("expense_date", { ascending: false });

      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("❌ Error fetching expenses:", error);
        throw error;
      }

      console.log("✅ Fetched expenses:", data?.length || 0);

      // Flatten nested arrays
      const formattedExpenses = (data || []).map(exp => ({
        ...exp,
        group: Array.isArray(exp.group) ? exp.group[0] : exp.group,
        payer: Array.isArray(exp.payer) ? exp.payer[0] : exp.payer,
      }));

      setExpenses(formattedExpenses);
      return formattedExpenses;
    } catch (error: any) {
      toast.error("Failed to load expenses");
      console.error(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (
    expense: {
      group_id: string;
      title: string;
      amount: number;
      category: ExpenseCategory;
      paid_by: string;
      expense_date: string;
      notes?: string;
      receipt_url?: string;
    },
    splits: SplitInput[]
  ) => {
    try {
      console.log("💰 Creating expense:", expense);
      console.log("📊 Splits:", splits);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the expense
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          group_id: expense.group_id,
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          paid_by: expense.paid_by,
          expense_date: expense.expense_date,
          notes: expense.notes || null,
          receipt_url: expense.receipt_url || null,
          created_by: user.id,
          currency: "INR", // Default currency
        })
        .select()
        .single();

      if (expenseError) {
        console.error("❌ Error creating expense:", expenseError);
        throw expenseError;
      }

      console.log("✅ Expense created:", expenseData);

      // Create splits
      if (splits.length > 0) {
        const splitsToInsert = splits.map((s) => ({
          expense_id: expenseData.id,
          user_id: s.user_id,
          amount: s.amount,
          is_settled: false,
        }));

        console.log("📝 Inserting splits:", splitsToInsert);

        const { error: splitsError } = await supabase
          .from("expense_splits")
          .insert(splitsToInsert);

        if (splitsError) {
          console.error("❌ Error creating splits:", splitsError);
          throw splitsError;
        }

        console.log("✅ Splits created successfully");
      }

      // Refresh expenses list
      await fetchExpenses();
      toast.success("Expense added successfully!");
      return expenseData;
    } catch (error: any) {
      console.error("❌ createExpense failed:", error);
      toast.error(error.message || "Failed to create expense");
      throw error;
    }
  };

  const updateExpense = async (
    id: string,
    expense: {
      title: string;
      amount: number;
      category: ExpenseCategory;
      paid_by: string;
      expense_date: string;
      notes?: string;
    },
    splits?: SplitInput[]
  ) => {
    try {
      const { error: expenseError } = await supabase
        .from("expenses")
        .update(expense)
        .eq("id", id);

      if (expenseError) throw expenseError;

      // Update splits if provided
      if (splits) {
        await supabase.from("expense_splits").delete().eq("expense_id", id);

        if (splits.length > 0) {
          const splitsToInsert = splits.map((s) => ({
            expense_id: id,
            user_id: s.user_id,
            amount: s.amount,
            is_settled: false,
          }));

          const { error: splitsError } = await supabase
            .from("expense_splits")
            .insert(splitsToInsert);

          if (splitsError) throw splitsError;
        }
      }

      await fetchExpenses();
      toast.success("Expense updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update expense");
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;

      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Expense deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete expense");
    }
  };

  const getExpenseSplits = async (expenseId: string): Promise<ExpenseSplit[]> => {
    try {
      console.log("🔍 Fetching splits for expense:", expenseId);
      
      const { data, error } = await supabase
        .from("expense_splits")
        .select(`
          *,
          profile:profiles!expense_splits_user_id_fkey(full_name, email)
        `)
        .eq("expense_id", expenseId);

      if (error) {
        console.error("❌ Error fetching splits:", error);
        throw error;
      }

      console.log("✅ Fetched splits:", data?.length || 0);

      const formattedSplits = (data || []).map(split => ({
        ...split,
        profile: Array.isArray(split.profile) ? split.profile[0] : split.profile,
      }));

      return formattedSplits;
    } catch (error) {
      console.error("❌ getExpenseSplits failed:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchExpenses();

    // Set up realtime subscription for expenses
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        (payload) => {
          console.log('📡 Realtime expense change:', payload);
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return {
    expenses,
    loading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseSplits,
  };
}