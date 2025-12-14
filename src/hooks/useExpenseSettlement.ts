// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";

// export interface ExpenseSettlementStatus {
//   expenseId: string;
//   totalSplits: number;
//   settledSplits: number;
//   isFullySettled: boolean;
// }

// export function useExpenseSettlement() {
//   // Mark a single split as settled
//   const markSplitAsSettled = async (splitId: string) => {
//     try {
//       const { error } = await supabase
//         .from("expense_splits")
//         .update({ is_settled: true })
//         .eq("id", splitId);

//       if (error) throw error;
//       toast.success("Split marked as settled");
//       return true;
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update split");
//       return false;
//     }
//   };

//   // Mark a single split as unsettled
//   const markSplitAsUnsettled = async (splitId: string) => {
//     try {
//       const { error } = await supabase
//         .from("expense_splits")
//         .update({ is_settled: false })
//         .eq("id", splitId);

//       if (error) throw error;
//       toast.success("Split marked as unsettled");
//       return true;
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update split");
//       return false;
//     }
//   };

//   // Get settlement status for an expense
//   const getExpenseSettlementStatus = async (expenseId: string): Promise<ExpenseSettlementStatus | null> => {
//     try {
//       const { data, error } = await supabase
//         .from("expense_splits")
//         .select("id, is_settled")
//         .eq("expense_id", expenseId);

//       if (error) throw error;

//       const splits = data || [];
//       const settledCount = splits.filter(s => s.is_settled).length;

//       return {
//         expenseId,
//         totalSplits: splits.length,
//         settledSplits: settledCount,
//         isFullySettled: splits.length > 0 && settledCount === splits.length,
//       };
//     } catch (error) {
//       console.error("Error getting settlement status:", error);
//       return null;
//     }
//   };

//   // Mark all splits for an expense as settled
//   const markExpenseAsFullySettled = async (expenseId: string) => {
//     try {
//       const { error } = await supabase
//         .from("expense_splits")
//         .update({ is_settled: true })
//         .eq("expense_id", expenseId);

//       if (error) throw error;
//       toast.success("Expense marked as fully settled");
//       return true;
//     } catch (error: any) {
//       toast.error(error.message || "Failed to settle expense");
//       return false;
//     }
//   };

//   return {
//     markSplitAsSettled,
//     markSplitAsUnsettled,
//     getExpenseSettlementStatus,
//     markExpenseAsFullySettled,
//   };
// }





import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExpenseSettlementStatus {
  expenseId: string;
  totalSplits: number;
  settledSplits: number;
  isFullySettled: boolean;
  unsettledAmount: number;
  settledAmount: number;
}

export interface ExpenseSplitWithUser {
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

export function useExpenseSettlement() {
  // Mark a single split as settled
  const markSplitAsSettled = async (splitId: string) => {
    try {
      console.log("🔄 Marking split as settled:", splitId);
      
      const { data, error } = await supabase
        .from("expense_splits")
        .update({ is_settled: true })
        .eq("id", splitId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error marking split as settled:", error);
        throw error;
      }

      console.log("✅ Split marked as settled:", data);
      toast.success("Payment marked as settled");
      return true;
    } catch (error: any) {
      console.error("❌ markSplitAsSettled failed:", error);
      toast.error(error.message || "Failed to update settlement status");
      return false;
    }
  };

  // Mark a single split as unsettled
  const markSplitAsUnsettled = async (splitId: string) => {
    try {
      console.log("🔄 Marking split as unsettled:", splitId);
      
      const { data, error } = await supabase
        .from("expense_splits")
        .update({ is_settled: false })
        .eq("id", splitId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error marking split as unsettled:", error);
        throw error;
      }

      console.log("✅ Split marked as unsettled:", data);
      toast.success("Payment marked as unsettled");
      return true;
    } catch (error: any) {
      console.error("❌ markSplitAsUnsettled failed:", error);
      toast.error(error.message || "Failed to update settlement status");
      return false;
    }
  };

  // Toggle settlement status
  const toggleSplitSettlement = async (splitId: string, currentStatus: boolean) => {
    if (currentStatus) {
      return await markSplitAsUnsettled(splitId);
    } else {
      return await markSplitAsSettled(splitId);
    }
  };

  // Get settlement status for an expense with detailed information
  const getExpenseSettlementStatus = async (
    expenseId: string
  ): Promise<ExpenseSettlementStatus | null> => {
    try {
      console.log("🔍 Getting settlement status for expense:", expenseId);
      
      const { data, error } = await supabase
        .from("expense_splits")
        .select("id, is_settled, amount")
        .eq("expense_id", expenseId);

      if (error) {
        console.error("❌ Error getting settlement status:", error);
        throw error;
      }

      const splits = data || [];
      const settledSplits = splits.filter((s) => s.is_settled);
      const unsettledSplits = splits.filter((s) => !s.is_settled);

      const settledAmount = settledSplits.reduce((sum, s) => sum + s.amount, 0);
      const unsettledAmount = unsettledSplits.reduce((sum, s) => sum + s.amount, 0);

      const status: ExpenseSettlementStatus = {
        expenseId,
        totalSplits: splits.length,
        settledSplits: settledSplits.length,
        isFullySettled: splits.length > 0 && settledSplits.length === splits.length,
        settledAmount,
        unsettledAmount,
      };

      console.log("✅ Settlement status:", status);
      return status;
    } catch (error) {
      console.error("❌ getExpenseSettlementStatus failed:", error);
      return null;
    }
  };

  // Get detailed splits with user information
  const getExpenseSplitsWithUsers = async (
    expenseId: string
  ): Promise<ExpenseSplitWithUser[]> => {
    try {
      console.log("🔍 Getting expense splits with user info:", expenseId);
      
      const { data, error } = await supabase
        .from("expense_splits")
        .select(`
          *,
          profile:profiles!expense_splits_user_id_fkey(full_name, email)
        `)
        .eq("expense_id", expenseId);

      if (error) {
        console.error("❌ Error getting splits with users:", error);
        throw error;
      }

      // Flatten the profile array if needed
      const formattedSplits = (data || []).map((split) => ({
        ...split,
        profile: Array.isArray(split.profile) ? split.profile[0] : split.profile,
      }));

      console.log("✅ Fetched splits with users:", formattedSplits.length);
      return formattedSplits;
    } catch (error) {
      console.error("❌ getExpenseSplitsWithUsers failed:", error);
      return [];
    }
  };

  // Mark all splits for an expense as settled
  const markExpenseAsFullySettled = async (expenseId: string) => {
    try {
      console.log("🔄 Marking all splits as settled for expense:", expenseId);
      
      const { data, error } = await supabase
        .from("expense_splits")
        .update({ is_settled: true })
        .eq("expense_id", expenseId)
        .select();

      if (error) {
        console.error("❌ Error settling all splits:", error);
        throw error;
      }

      console.log("✅ All splits settled:", data?.length || 0);
      toast.success("All payments marked as settled");
      return true;
    } catch (error: any) {
      console.error("❌ markExpenseAsFullySettled failed:", error);
      toast.error(error.message || "Failed to settle all payments");
      return false;
    }
  };

  // Mark all splits for an expense as unsettled
  const markExpenseAsFullyUnsettled = async (expenseId: string) => {
    try {
      console.log("🔄 Marking all splits as unsettled for expense:", expenseId);
      
      const { data, error } = await supabase
        .from("expense_splits")
        .update({ is_settled: false })
        .eq("expense_id", expenseId)
        .select();

      if (error) {
        console.error("❌ Error unsettling all splits:", error);
        throw error;
      }

      console.log("✅ All splits unsettled:", data?.length || 0);
      toast.success("All payments marked as unsettled");
      return true;
    } catch (error: any) {
      console.error("❌ markExpenseAsFullyUnsettled failed:", error);
      toast.error(error.message || "Failed to unsettle payments");
      return false;
    }
  };

  // Mark specific user's split as settled
  const markUserSplitAsSettled = async (expenseId: string, userId: string) => {
    try {
      console.log("🔄 Marking user split as settled:", { expenseId, userId });
      
      const { data, error } = await supabase
        .from("expense_splits")
        .update({ is_settled: true })
        .eq("expense_id", expenseId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error marking user split as settled:", error);
        throw error;
      }

      console.log("✅ User split marked as settled:", data);
      toast.success("Payment marked as settled");
      return true;
    } catch (error: any) {
      console.error("❌ markUserSplitAsSettled failed:", error);
      toast.error(error.message || "Failed to settle payment");
      return false;
    }
  };

  // Batch update multiple splits
  const batchUpdateSplits = async (
    splitIds: string[],
    isSettled: boolean
  ) => {
    try {
      console.log("🔄 Batch updating splits:", { splitIds, isSettled });
      
      const { data, error } = await supabase
        .from("expense_splits")
        .update({ is_settled: isSettled })
        .in("id", splitIds)
        .select();

      if (error) {
        console.error("❌ Error batch updating splits:", error);
        throw error;
      }

      console.log("✅ Batch update successful:", data?.length || 0);
      toast.success(
        `${data?.length || 0} payment${data?.length !== 1 ? "s" : ""} updated`
      );
      return true;
    } catch (error: any) {
      console.error("❌ batchUpdateSplits failed:", error);
      toast.error(error.message || "Failed to update payments");
      return false;
    }
  };

  return {
    markSplitAsSettled,
    markSplitAsUnsettled,
    toggleSplitSettlement,
    getExpenseSettlementStatus,
    getExpenseSplitsWithUsers,
    markExpenseAsFullySettled,
    markExpenseAsFullyUnsettled,
    markUserSplitAsSettled,
    batchUpdateSplits,
  };
}