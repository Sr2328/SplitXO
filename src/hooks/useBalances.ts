// import { useState, useEffect, useCallback } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";

// export interface Balance {
//   userId: string;
//   userName: string;
//   userEmail: string;
//   amount: number; // positive = they owe you, negative = you owe them
// }

// export interface Settlement {
//   id: string;
//   group_id: string;
//   paid_by: string;
//   paid_to: string;
//   amount: number;
//   notes: string | null;
//   receipt_url: string | null;
//   settled_at: string;
//   payer?: {
//     full_name: string | null;
//     email: string | null;
//   };
//   receiver?: {
//     full_name: string | null;
//     email: string | null;
//   };
// }

// export function useBalances() {
//   const [balances, setBalances] = useState<Balance[]>([]);
//   const [totalOwed, setTotalOwed] = useState(0);
//   const [totalOwe, setTotalOwe] = useState(0);
//   const [settlements, setSettlements] = useState<Settlement[]>([]);
//   const [loading, setLoading] = useState(true);

//   const calculateBalances = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;

//       // Get all expenses where current user paid
//       const { data: paidExpenses } = await supabase
//         .from("expenses")
//         .select(`
//           id,
//           amount,
//           paid_by,
//           splits:expense_splits(user_id, amount, is_settled)
//         `)
//         .eq("paid_by", user.id);

//       // Get all expense splits where current user owes
//       const { data: owedSplits } = await supabase
//         .from("expense_splits")
//         .select(`
//           amount,
//           is_settled,
//           expense:expenses!inner(
//             id,
//             paid_by,
//             payer:profiles!expenses_paid_by_fkey(user_id, full_name, email)
//           )
//         `)
//         .eq("user_id", user.id)
//         .neq("expense.paid_by", user.id);

//       // Get all settlements
//       const { data: settlementsData } = await supabase
//         .from("settlements")
//         .select(`
//           *,
//           payer:profiles!settlements_paid_by_fkey(full_name, email),
//           receiver:profiles!settlements_paid_to_fkey(full_name, email)
//         `)
//         .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
//         .order("settled_at", { ascending: false });

//       // Calculate who owes what to the current user
//       const balanceMap = new Map<string, { amount: number; name: string; email: string }>();

//       // Process expenses where user paid
//       (paidExpenses || []).forEach((expense) => {
//         const splits = expense.splits || [];
//         splits.forEach((split: any) => {
//           if (split.user_id !== user.id && !split.is_settled) {
//             const existing = balanceMap.get(split.user_id) || { amount: 0, name: "", email: "" };
//             existing.amount += Number(split.amount);
//             balanceMap.set(split.user_id, existing);
//           }
//         });
//       });

//       // Process splits where user owes others
//       (owedSplits || []).forEach((split: any) => {
//         if (!split.is_settled && split.expense?.payer) {
//           const payer = Array.isArray(split.expense.payer) 
//             ? split.expense.payer[0] 
//             : split.expense.payer;
          
//           const payerId = payer?.user_id || split.expense.paid_by;
//           const existing = balanceMap.get(payerId) || { 
//             amount: 0, 
//             name: payer?.full_name || "", 
//             email: payer?.email || "" 
//           };
//           existing.amount -= Number(split.amount);
//           existing.name = payer?.full_name || existing.name;
//           existing.email = payer?.email || existing.email;
//           balanceMap.set(payerId, existing);
//         }
//       });

//       // Apply settlements
//       (settlementsData || []).forEach((settlement: any) => {
//         const payerProfile = Array.isArray(settlement.payer) ? settlement.payer[0] : settlement.payer;
//         const receiverProfile = Array.isArray(settlement.receiver) ? settlement.receiver[0] : settlement.receiver;

//         if (settlement.paid_by === user.id) {
//           // User paid someone, so that person owes user less
//           const existing = balanceMap.get(settlement.paid_to) || { 
//             amount: 0, 
//             name: receiverProfile?.full_name || "", 
//             email: receiverProfile?.email || "" 
//           };
//           existing.amount += Number(settlement.amount);
//           balanceMap.set(settlement.paid_to, existing);
//         } else {
//           // Someone paid user, so user owes them less
//           const existing = balanceMap.get(settlement.paid_by) || { 
//             amount: 0, 
//             name: payerProfile?.full_name || "", 
//             email: payerProfile?.email || "" 
//           };
//           existing.amount -= Number(settlement.amount);
//           balanceMap.set(settlement.paid_by, existing);
//         }
//       });

//       // Get profile names for users without them
//       const userIds = Array.from(balanceMap.keys()).filter(
//         (id) => !balanceMap.get(id)?.name
//       );

//       if (userIds.length > 0) {
//         const { data: profiles } = await supabase
//           .from("profiles")
//           .select("user_id, full_name, email")
//           .in("user_id", userIds);

//         (profiles || []).forEach((profile) => {
//           const existing = balanceMap.get(profile.user_id);
//           if (existing) {
//             existing.name = profile.full_name || "";
//             existing.email = profile.email || "";
//           }
//         });
//       }

//       // Convert to array and filter out zero balances
//       const balanceArray: Balance[] = Array.from(balanceMap.entries())
//         .filter(([_, data]) => Math.abs(data.amount) > 0.01)
//         .map(([userId, data]) => ({
//           userId,
//           userName: data.name || "Unknown",
//           userEmail: data.email || "",
//           amount: Math.round(data.amount * 100) / 100,
//         }));

//       // Calculate totals
//       let owed = 0;
//       let owe = 0;
//       balanceArray.forEach((b) => {
//         if (b.amount > 0) owed += b.amount;
//         else owe += Math.abs(b.amount);
//       });

//       setBalances(balanceArray);
//       setTotalOwed(Math.round(owed * 100) / 100);
//       setTotalOwe(Math.round(owe * 100) / 100);
//       setSettlements(
//         (settlementsData || []).map((s: any) => ({
//           ...s,
//           payer: Array.isArray(s.payer) ? s.payer[0] : s.payer,
//           receiver: Array.isArray(s.receiver) ? s.receiver[0] : s.receiver,
//         }))
//       );
//     } catch (error: any) {
//       console.error("Error calculating balances:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createSettlement = async (
//     groupId: string,
//     paidTo: string,
//     amount: number,
//     notes?: string
//   ) => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const { error } = await supabase.from("settlements").insert({
//         group_id: groupId,
//         paid_by: user.id,
//         paid_to: paidTo,
//         amount,
//         notes,
//       });

//       if (error) throw error;

//       await calculateBalances();
//       toast.success("Settlement recorded!");
//     } catch (error: any) {
//       toast.error(error.message || "Failed to record settlement");
//       throw error;
//     }
//   };

//   useEffect(() => {
//     calculateBalances();
//   }, []);

//   return {
//     balances,
//     totalOwed,
//     totalOwe,
//     settlements,
//     loading,
//     calculateBalances,
//     createSettlement,
//   };
// }



import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Balance {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number; // positive = they owe you, negative = you owe them
}

export interface Settlement {
  id: string;
  group_id: string;
  paid_by: string;
  paid_to: string;
  amount: number;
  notes: string | null;
  receipt_url: string | null;
  settled_at: string;
  payer?: {
    full_name: string | null;
    email: string | null;
  };
  receiver?: {
    full_name: string | null;
    email: string | null;
  };
}

export function useBalances() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateBalances = useCallback(async () => {
    try {
      console.log("🔄 Starting balance calculation...");
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("❌ Auth error:", userError);
        toast.error("Authentication error: " + userError.message);
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.log("⚠️ No user logged in");
        setLoading(false);
        return;
      }

      console.log("👤 User ID:", user.id);

      // Step 1: Get all expense splits
      console.log("📊 Fetching all expense splits...");
      const { data: allSplits, error: splitsError } = await supabase
        .from("expense_splits")
        .select("id, expense_id, user_id, amount, is_settled")
        .eq("is_settled", false);

      if (splitsError) {
        console.error("❌ Error fetching splits:", splitsError);
        toast.error("Failed to fetch splits: " + splitsError.message);
        throw splitsError;
      }

      console.log("✅ Fetched splits:", allSplits?.length || 0);

      // Step 2: Get all expenses
      console.log("💰 Fetching all expenses...");
      const expenseIds = [...new Set((allSplits || []).map(s => s.expense_id))];
      
      let allExpenses: any[] = [];
      if (expenseIds.length > 0) {
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("id, paid_by, amount, title, group_id")
          .in("id", expenseIds);

        if (expensesError) {
          console.error("❌ Error fetching expenses:", expensesError);
          toast.error("Failed to fetch expenses: " + expensesError.message);
          throw expensesError;
        }

        allExpenses = expenses || [];
        console.log("✅ Fetched expenses:", allExpenses.length);
      }

      // Step 3: Get settlements
      console.log("🤝 Fetching settlements...");
      const { data: settlementsData, error: settlementsError } = await supabase
        .from("settlements")
        .select("id, group_id, paid_by, paid_to, amount, notes, receipt_url, settled_at")
        .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
        .order("settled_at", { ascending: false });

      if (settlementsError) {
        console.error("❌ Error fetching settlements:", settlementsError);
        // Don't throw, just log - settlements are optional
        console.log("⚠️ Continuing without settlements");
      }

      console.log("✅ Fetched settlements:", settlementsData?.length || 0);

      // Calculate balances
      const balanceMap = new Map<string, { amount: number; name: string; email: string }>();
      const expenseMap = new Map();
      
      allExpenses.forEach(exp => {
        expenseMap.set(exp.id, exp);
      });

      console.log("🧮 Processing splits...");
      let processedCount = 0;

      // Process all splits
      (allSplits || []).forEach((split: any) => {
        const expense = expenseMap.get(split.expense_id);
        if (!expense) {
          console.log("⚠️ Expense not found for split:", split.expense_id);
          return;
        }

        const paidBy = expense.paid_by;
        const splitUser = split.user_id;
        const splitAmount = Number(split.amount);

        if (paidBy === user.id && splitUser !== user.id) {
          // Current user paid, someone else owes them
          const existing = balanceMap.get(splitUser) || { amount: 0, name: "", email: "" };
          existing.amount += splitAmount;
          balanceMap.set(splitUser, existing);
          console.log(`➕ ${splitUser.substring(0, 8)}... owes you ₹${splitAmount}`);
          processedCount++;
        } else if (splitUser === user.id && paidBy !== user.id) {
          // Someone else paid, current user owes them
          const existing = balanceMap.get(paidBy) || { amount: 0, name: "", email: "" };
          existing.amount -= splitAmount;
          balanceMap.set(paidBy, existing);
          console.log(`➖ You owe ${paidBy.substring(0, 8)}... ₹${splitAmount}`);
          processedCount++;
        }
      });

      console.log(`✅ Processed ${processedCount} relevant splits`);

      // Apply settlements
      if (settlementsData && settlementsData.length > 0) {
        console.log("🧮 Applying settlements...");
        (settlementsData || []).forEach((settlement: any) => {
          const amount = Number(settlement.amount);
          
          if (settlement.paid_by === user.id) {
            const existing = balanceMap.get(settlement.paid_to) || { amount: 0, name: "", email: "" };
            existing.amount += amount;
            balanceMap.set(settlement.paid_to, existing);
            console.log(`🔄 Applied settlement: +₹${amount} from ${settlement.paid_to.substring(0, 8)}...`);
          } else if (settlement.paid_to === user.id) {
            const existing = balanceMap.get(settlement.paid_by) || { amount: 0, name: "", email: "" };
            existing.amount -= amount;
            balanceMap.set(settlement.paid_by, existing);
            console.log(`🔄 Applied settlement: -₹${amount} to ${settlement.paid_by.substring(0, 8)}...`);
          }
        });
      }

      // Get profile information
      const userIds = Array.from(balanceMap.keys());
      console.log("👥 Fetching profiles for", userIds.length, "users");
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        if (profilesError) {
          console.error("❌ Error fetching profiles:", profilesError);
          // Don't throw - we can continue with user IDs
        } else {
          console.log("✅ Fetched profiles:", profiles?.length || 0);
          (profiles || []).forEach((profile) => {
            const existing = balanceMap.get(profile.user_id);
            if (existing) {
              existing.name = profile.full_name || "";
              existing.email = profile.email || "";
            }
          });
        }
      }

      // Convert to array
      const balanceArray: Balance[] = Array.from(balanceMap.entries())
        .filter(([_, data]) => Math.abs(data.amount) > 0.01)
        .map(([userId, data]) => ({
          userId,
          userName: data.name || data.email || "Unknown User",
          userEmail: data.email || "",
          amount: Math.round(data.amount * 100) / 100,
        }));

      console.log("💰 Final balances:", balanceArray);

      // Calculate totals
      let owed = 0;
      let owe = 0;
      balanceArray.forEach((b) => {
        if (b.amount > 0) {
          owed += b.amount;
        } else {
          owe += Math.abs(b.amount);
        }
      });

      setBalances(balanceArray);
      setTotalOwed(Math.round(owed * 100) / 100);
      setTotalOwe(Math.round(owe * 100) / 100);
      
      // Format settlements with profile data
      const formattedSettlements = await Promise.all(
        (settlementsData || []).map(async (s: any) => {
          const { data: payerProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", s.paid_by)
            .single();
          
          const { data: receiverProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", s.paid_to)
            .single();

          return {
            ...s,
            payer: payerProfile,
            receiver: receiverProfile,
          };
        })
      );

      setSettlements(formattedSettlements);

      console.log("✅ Balance calculation complete");
      console.log("📈 Total owed to you: ₹" + owed);
      console.log("📉 Total you owe: ₹" + owe);
      
    } catch (error: any) {
      console.error("❌ CRITICAL ERROR in calculateBalances:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error("Failed to calculate balances: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  const createSettlement = async (
    groupId: string,
    paidTo: string,
    amount: number,
    notes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("settlements").insert({
        group_id: groupId,
        paid_by: user.id,
        paid_to: paidTo,
        amount,
        notes,
      });

      if (error) throw error;

      await calculateBalances();
      toast.success("Settlement recorded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to record settlement");
      throw error;
    }
  };

  useEffect(() => {
    calculateBalances();

    // Real-time subscription for auto-updates
    const channel = supabase
      .channel('balances-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settlements' },
        () => {
          console.log("🔔 Settlement changed, recalculating...");
          calculateBalances();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          console.log("🔔 Expense changed, recalculating...");
          calculateBalances();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expense_splits' },
        () => {
          console.log("🔔 Split changed, recalculating...");
          calculateBalances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [calculateBalances]);

  return {
    balances,
    totalOwed,
    totalOwe,
    settlements,
    loading,
    calculateBalances,
    createSettlement,
  };
}