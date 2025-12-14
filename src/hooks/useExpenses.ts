// import { useState, useEffect, ReactNode } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";

// export type ExpenseCategory =
//   | "food"
//   | "transport"
//   | "entertainment"
//   | "shopping"
//   | "utilities"
//   | "rent"
//   | "travel"
//   | "healthcare"
//   | "other";

// export interface Expense {
//   description: ReactNode;
//   date: string | number | Date;
//   id: string;
//   group_id: string;
//   title: string;
//   amount: number;
//   currency: string;
//   category: ExpenseCategory;
//   paid_by: string;
//   receipt_url: string | null;
//   notes: string | null;
//   expense_date: string;
//   created_by: string | null;
//   created_at: string;
//   group?: {
//     name: string;
//   };
//   payer?: {
//     full_name: string | null;
//     email: string | null;
//   };
//   splits?: ExpenseSplit[];
// }

// export interface ExpenseSplit {
//   id: string;
//   expense_id: string;
//   user_id: string;
//   amount: number;
//   is_settled: boolean;
//   profile?: {
//     full_name: string | null;
//     email: string | null;
//   };
// }

// export interface SplitInput {
//   user_id: string;
//   amount: number;
// }

// export function useExpenses(groupId?: string) {
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchExpenses = async () => {
//     try {
//       console.log("🔍 Fetching expenses...");
      
//       let query = supabase
//         .from("expenses")
//         .select(`
//           *,
//           group:groups(name),
//           payer:profiles!expenses_paid_by_fkey(full_name, email)
//         `)
//         .order("expense_date", { ascending: false });

//       if (groupId) {
//         query = query.eq("group_id", groupId);
//       }

//       const { data, error } = await query;
      
//       if (error) {
//         console.error("❌ Error fetching expenses:", error);
//         throw error;
//       }

//       console.log("✅ Fetched expenses:", data?.length || 0);

//       // Flatten nested arrays
//       const formattedExpenses = (data || []).map(exp => ({
//         ...exp,
//         group: Array.isArray(exp.group) ? exp.group[0] : exp.group,
//         payer: Array.isArray(exp.payer) ? exp.payer[0] : exp.payer,
//       }));

//       setExpenses(formattedExpenses);
//       return formattedExpenses;
//     } catch (error: any) {
//       toast.error("Failed to load expenses");
//       console.error(error);
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createExpense = async (
//     expense: {
//       group_id: string;
//       title: string;
//       amount: number;
//       category: ExpenseCategory;
//       paid_by: string;
//       expense_date: string;
//       notes?: string;
//       receipt_url?: string;
//     },
//     splits: SplitInput[]
//   ) => {
//     try {
//       console.log("💰 Creating expense:", expense);
//       console.log("📊 Splits:", splits);

//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       // Create the expense
//       const { data: expenseData, error: expenseError } = await supabase
//         .from("expenses")
//         .insert({
//           group_id: expense.group_id,
//           title: expense.title,
//           amount: expense.amount,
//           category: expense.category,
//           paid_by: expense.paid_by,
//           expense_date: expense.expense_date,
//           notes: expense.notes || null,
//           receipt_url: expense.receipt_url || null,
//           created_by: user.id,
//           currency: "INR", // Default currency
//         })
//         .select()
//         .single();

//       if (expenseError) {
//         console.error("❌ Error creating expense:", expenseError);
//         throw expenseError;
//       }

//       console.log("✅ Expense created:", expenseData);

//       // Create splits
//       if (splits.length > 0) {
//         const splitsToInsert = splits.map((s) => ({
//           expense_id: expenseData.id,
//           user_id: s.user_id,
//           amount: s.amount,
//           is_settled: false,
//         }));

//         console.log("📝 Inserting splits:", splitsToInsert);

//         const { error: splitsError } = await supabase
//           .from("expense_splits")
//           .insert(splitsToInsert);

//         if (splitsError) {
//           console.error("❌ Error creating splits:", splitsError);
//           throw splitsError;
//         }

//         console.log("✅ Splits created successfully");
//       }

//       // Refresh expenses list
//       await fetchExpenses();
//       toast.success("Expense added successfully!");
//       return expenseData;
//     } catch (error: any) {
//       console.error("❌ createExpense failed:", error);
//       toast.error(error.message || "Failed to create expense");
//       throw error;
//     }
//   };

//   const updateExpense = async (
//     id: string,
//     expense: {
//       title: string;
//       amount: number;
//       category: ExpenseCategory;
//       paid_by: string;
//       expense_date: string;
//       notes?: string;
//     },
//     splits?: SplitInput[]
//   ) => {
//     try {
//       const { error: expenseError } = await supabase
//         .from("expenses")
//         .update(expense)
//         .eq("id", id);

//       if (expenseError) throw expenseError;

//       // Update splits if provided
//       if (splits) {
//         await supabase.from("expense_splits").delete().eq("expense_id", id);

//         if (splits.length > 0) {
//           const splitsToInsert = splits.map((s) => ({
//             expense_id: id,
//             user_id: s.user_id,
//             amount: s.amount,
//             is_settled: false,
//           }));

//           const { error: splitsError } = await supabase
//             .from("expense_splits")
//             .insert(splitsToInsert);

//           if (splitsError) throw splitsError;
//         }
//       }

//       await fetchExpenses();
//       toast.success("Expense updated successfully!");
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update expense");
//       throw error;
//     }
//   };

//   const deleteExpense = async (id: string) => {
//     try {
//       const { error } = await supabase.from("expenses").delete().eq("id", id);
//       if (error) throw error;

//       setExpenses((prev) => prev.filter((e) => e.id !== id));
//       toast.success("Expense deleted");
//     } catch (error: any) {
//       toast.error(error.message || "Failed to delete expense");
//     }
//   };

//   const getExpenseSplits = async (expenseId: string): Promise<ExpenseSplit[]> => {
//     try {
//       console.log("🔍 Fetching splits for expense:", expenseId);
      
//       const { data, error } = await supabase
//         .from("expense_splits")
//         .select(`
//           *,
//           profile:profiles!expense_splits_user_id_fkey(full_name, email)
//         `)
//         .eq("expense_id", expenseId);

//       if (error) {
//         console.error("❌ Error fetching splits:", error);
//         throw error;
//       }

//       console.log("✅ Fetched splits:", data?.length || 0);

//       const formattedSplits = (data || []).map(split => ({
//         ...split,
//         profile: Array.isArray(split.profile) ? split.profile[0] : split.profile,
//       }));

//       return formattedSplits;
//     } catch (error) {
//       console.error("❌ getExpenseSplits failed:", error);
//       return [];
//     }
//   };

//   useEffect(() => {
//     fetchExpenses();

//     // Set up realtime subscription for expenses
//     // const channel = supabase
//     //   .channel('expenses-changes')
//     //   .on(
//     //     'postgres_changes',
//     //     {
//     //       event: '*',
//     //       schema: 'public',
//     //       table: 'expenses',
//     //     },
//     //     (payload) => {
//     //       console.log('📡 Realtime expense change:', payload);
//     //       fetchExpenses();
//     //     }
//     //   )
//     //   .subscribe();

//     // return () => {
//     //   supabase.removeChannel(channel);
//     // };
//     const channel = supabase
//       .channel('expenses-realtime')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'expenses',
//         },
//         async (payload) => {
//           // Fetch the new expense with its relations
//           const { data } = await supabase
//             .from("expenses")
//             .select(`
//               *,
//               group:groups(name),
//               payer:profiles!expenses_paid_by_fkey(full_name, email)
//             `)
//             .eq("id", payload.new.id)
//             .single();

//           if (data) {
//             const formattedExpense = {
//               ...data,
//               group: Array.isArray(data.group) ? data.group[0] : data.group,
//               payer: Array.isArray(data.payer) ? data.payer[0] : data.payer,
//             } as unknown as Expense;
            
//             // Only add if it matches the groupId filter (if any)
//             if (!groupId || formattedExpense.group_id === groupId) {
//               setExpenses(prev => [formattedExpense, ...prev]);
//             }
//           }
//         }
//       )
//       .on(
//         'postgres_changes',
//         {
//           event: 'DELETE',
//           schema: 'public',
//           table: 'expenses',
//         },
//         (payload) => {
//           setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
//         }
//       )
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'expenses',
//         },
//         () => {
//           // Refetch on update to get latest data with relations
//           fetchExpenses();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [groupId]);

//   return {
//     expenses,
//     loading,
//     fetchExpenses,
//     createExpense,
//     updateExpense,
//     deleteExpense,
//     getExpenseSplits,
//   };
// }









// New Expense ts code 

import { useState, useEffect, ReactNode } from "react";
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
  description: ReactNode;
  date: string | number | Date;
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

// Valid notification types
type NotificationType = "payment_received" | "payment_sent" | "expense_added" | "expense_updated";

// Helper function to create notifications - ONLY for expense operations
async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: any
) {
  try {
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || null,
        is_read: false,
      });

    if (error) {
      console.error("❌ Error creating notification:", error);
      return false;
    }

    console.log("✅ Notification created for user:", userId);
    return true;
  } catch (error) {
    console.error("❌ createNotification failed:", error);
    return false;
  }
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
          groups!inner(name),
          profiles!expenses_paid_by_fkey(full_name, email)
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

      // Flatten nested arrays and rename for consistency
      const formattedExpenses = (data || []).map(exp => ({
        ...exp,
        group: Array.isArray(exp.groups) ? exp.groups[0] : exp.groups,
        payer: Array.isArray(exp.profiles) ? exp.profiles[0] : exp.profiles,
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

      // Create splits and collect split user IDs
      const splitUserIds = new Set<string>();
      if (splits.length > 0) {
        const splitsToInsert = splits.map((s) => {
          splitUserIds.add(s.user_id);
          return {
            expense_id: expenseData.id,
            user_id: s.user_id,
            amount: s.amount,
            is_settled: false,
          };
        });

        console.log("📝 Inserting splits:", splitsToInsert);

        const { error: splitsError } = await supabase
          .from("expense_splits")
          .insert(splitsToInsert);

        if (splitsError) {
          console.error("❌ Error creating splits:", splitsError);
          throw splitsError;
        }

        console.log("✅ Splits created successfully");

        // Send notifications to all split users
        const payer = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", expense.paid_by)
          .single();

        const payerName = payer.data?.full_name || "Someone";

        for (const splitUserId of splitUserIds) {
          // Notify split users about their payment obligation
          if (splitUserId !== expense.paid_by) {
            await createNotification(
              splitUserId,
              "payment_sent",
              "New Expense Split Created",
              `${payerName} has added you to an expense "${expenseData.title}" of ₹${expenseData.amount}. You owe ₹${splits.find(s => s.user_id === splitUserId)?.amount}.`,
              {
                expense_id: expenseData.id,
                group_id: expense.group_id,
                type: "expense_added"
              }
            );
          }
        }

        // Notify payer that expense was created
        await createNotification(
          expense.paid_by,
          "expense_added",
          "Expense Created",
          `You have created an expense "${expenseData.title}" of ₹${expenseData.amount} shared among ${splits.length} people.`,
          {
            expense_id: expenseData.id,
            group_id: expense.group_id,
            type: "expense_added"
          }
        );
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
      // Get original expense for notification data
      const { data: originalExpense } = await supabase
        .from("expenses")
        .select("paid_by, group_id, title")
        .eq("id", id)
        .single();

      const { error: expenseError } = await supabase
        .from("expenses")
        .update(expense)
        .eq("id", id);

      if (expenseError) throw expenseError;

      // Update splits if provided
      if (splits !== undefined) {
        await supabase.from("expense_splits").delete().eq("expense_id", id);

        const splitUserIds = new Set<string>();

        if (splits.length > 0) {
          const splitsToInsert = splits.map((s) => {
            splitUserIds.add(s.user_id);
            return {
              expense_id: id,
              user_id: s.user_id,
              amount: s.amount,
              is_settled: false,
            };
          });

          const { error: splitsError } = await supabase
            .from("expense_splits")
            .insert(splitsToInsert);

          if (splitsError) throw splitsError;

          // Notify split users about the update
          const payer = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", expense.paid_by)
            .single();

          const payerName = payer.data?.full_name || "Someone";

          for (const splitUserId of splitUserIds) {
            if (splitUserId !== expense.paid_by) {
              await createNotification(
                splitUserId,
                "expense_updated",
                "Expense Updated",
                `${payerName} has updated the expense "${expense.title}". Your share is now ₹${splits.find(s => s.user_id === splitUserId)?.amount}.`,
                {
                  expense_id: id,
                  group_id: originalExpense?.group_id,
                  type: "expense_updated"
                }
              );
            }
          }
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
      // Get expense details for notification
      const { data: expenseData } = await supabase
        .from("expenses")
        .select("title, paid_by")
        .eq("id", id)
        .single();

      // Get all splits to notify users
      const { data: splits } = await supabase
        .from("expense_splits")
        .select("user_id")
        .eq("expense_id", id);

      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;

      // Notify all affected users
      const payer = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", expenseData?.paid_by)
        .single();

      const payerName = payer.data?.full_name || "Someone";

      if (splits) {
        for (const split of splits) {
          await createNotification(
            split.user_id,
            "expense_updated",
            "Expense Deleted",
            `${payerName} has deleted the expense "${expenseData?.title}".`,
            { expense_id: id, type: "expense_updated" }
          );
        }
      }

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
          profiles!expense_splits_user_id_fkey(full_name, email)
        `)
        .eq("expense_id", expenseId);

      if (error) {
        console.error("❌ Error fetching splits:", error);
        throw error;
      }

      console.log("✅ Fetched splits:", data?.length || 0);

      const formattedSplits = (data || []).map(split => ({
        ...split,
        profile: Array.isArray(split.profiles) ? split.profiles[0] : split.profiles,
      }));

      return formattedSplits;
    } catch (error) {
      console.error("❌ getExpenseSplits failed:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchExpenses();

    const channel = supabase
      .channel('expenses-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'expenses',
        },
        async (payload) => {
          // Fetch the new expense with its relations
          const { data } = await supabase
            .from("expenses")
            .select(`
              *,
              groups!inner(name),
              profiles!expenses_paid_by_fkey(full_name, email)
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const formattedExpense = {
              ...data,
              group: Array.isArray(data.groups) ? data.groups[0] : data.groups,
              payer: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
            } as unknown as Expense;

            // Only add if it matches the groupId filter (if any)
            if (!groupId || formattedExpense.group_id === groupId) {
              setExpenses(prev => [formattedExpense, ...prev]);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'expenses',
        },
        (payload) => {
          setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'expenses',
        },
        () => {
          // Refetch on update to get latest data with relations
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