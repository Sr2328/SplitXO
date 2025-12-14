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

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====


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

//   const calculateBalances = useCallback(async () => {
//     try {
//       console.log("🔄 Starting balance calculation...");
      
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
      
//       if (userError) {
//         console.error("❌ Auth error:", userError);
//         toast.error("Authentication error: " + userError.message);
//         setLoading(false);
//         return;
//       }
      
//       if (!user) {
//         console.log("⚠️ No user logged in");
//         setLoading(false);
//         return;
//       }

//       console.log("👤 User ID:", user.id);

//       // Step 1: Get all expense splits
//       console.log("📊 Fetching all expense splits...");
//       const { data: allSplits, error: splitsError } = await supabase
//         .from("expense_splits")
//         .select("id, expense_id, user_id, amount, is_settled")
//         .eq("is_settled", false);

//       if (splitsError) {
//         console.error("❌ Error fetching splits:", splitsError);
//         toast.error("Failed to fetch splits: " + splitsError.message);
//         throw splitsError;
//       }

//       console.log("✅ Fetched splits:", allSplits?.length || 0);

//       // Step 2: Get all expenses
//       console.log("💰 Fetching all expenses...");
//       const expenseIds = [...new Set((allSplits || []).map(s => s.expense_id))];
      
//       let allExpenses: any[] = [];
//       if (expenseIds.length > 0) {
//         const { data: expenses, error: expensesError } = await supabase
//           .from("expenses")
//           .select("id, paid_by, amount, title, group_id")
//           .in("id", expenseIds);

//         if (expensesError) {
//           console.error("❌ Error fetching expenses:", expensesError);
//           toast.error("Failed to fetch expenses: " + expensesError.message);
//           throw expensesError;
//         }

//         allExpenses = expenses || [];
//         console.log("✅ Fetched expenses:", allExpenses.length);
//       }

//       // Step 3: Get settlements
//       console.log("🤝 Fetching settlements...");
//       const { data: settlementsData, error: settlementsError } = await supabase
//         .from("settlements")
//         .select("id, group_id, paid_by, paid_to, amount, notes, receipt_url, settled_at")
//         .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
//         .order("settled_at", { ascending: false });

//       if (settlementsError) {
//         console.error("❌ Error fetching settlements:", settlementsError);
//         // Don't throw, just log - settlements are optional
//         console.log("⚠️ Continuing without settlements");
//       }

//       console.log("✅ Fetched settlements:", settlementsData?.length || 0);

//       // Calculate balances
//       const balanceMap = new Map<string, { amount: number; name: string; email: string }>();
//       const expenseMap = new Map();
      
//       allExpenses.forEach(exp => {
//         expenseMap.set(exp.id, exp);
//       });

//       console.log("🧮 Processing splits...");
//       let processedCount = 0;

//       // Process all splits
//       (allSplits || []).forEach((split: any) => {
//         const expense = expenseMap.get(split.expense_id);
//         if (!expense) {
//           console.log("⚠️ Expense not found for split:", split.expense_id);
//           return;
//         }

//         const paidBy = expense.paid_by;
//         const splitUser = split.user_id;
//         const splitAmount = Number(split.amount);

//         if (paidBy === user.id && splitUser !== user.id) {
//           // Current user paid, someone else owes them
//           const existing = balanceMap.get(splitUser) || { amount: 0, name: "", email: "" };
//           existing.amount += splitAmount;
//           balanceMap.set(splitUser, existing);
//           console.log(`➕ ${splitUser.substring(0, 8)}... owes you ₹${splitAmount}`);
//           processedCount++;
//         } else if (splitUser === user.id && paidBy !== user.id) {
//           // Someone else paid, current user owes them
//           const existing = balanceMap.get(paidBy) || { amount: 0, name: "", email: "" };
//           existing.amount -= splitAmount;
//           balanceMap.set(paidBy, existing);
//           console.log(`➖ You owe ${paidBy.substring(0, 8)}... ₹${splitAmount}`);
//           processedCount++;
//         }
//       });

//       console.log(`✅ Processed ${processedCount} relevant splits`);

//       // Apply settlements
//       if (settlementsData && settlementsData.length > 0) {
//         console.log("🧮 Applying settlements...");
//         (settlementsData || []).forEach((settlement: any) => {
//           const amount = Number(settlement.amount);
          
//           if (settlement.paid_by === user.id) {
//             const existing = balanceMap.get(settlement.paid_to) || { amount: 0, name: "", email: "" };
//             existing.amount += amount;
//             balanceMap.set(settlement.paid_to, existing);
//             console.log(`🔄 Applied settlement: +₹${amount} from ${settlement.paid_to.substring(0, 8)}...`);
//           } else if (settlement.paid_to === user.id) {
//             const existing = balanceMap.get(settlement.paid_by) || { amount: 0, name: "", email: "" };
//             existing.amount -= amount;
//             balanceMap.set(settlement.paid_by, existing);
//             console.log(`🔄 Applied settlement: -₹${amount} to ${settlement.paid_by.substring(0, 8)}...`);
//           }
//         });
//       }

//       // Get profile information
//       const userIds = Array.from(balanceMap.keys());
//       console.log("👥 Fetching profiles for", userIds.length, "users");
      
//       if (userIds.length > 0) {
//         const { data: profiles, error: profilesError } = await supabase
//           .from("profiles")
//           .select("user_id, full_name, email")
//           .in("user_id", userIds);

//         if (profilesError) {
//           console.error("❌ Error fetching profiles:", profilesError);
//           // Don't throw - we can continue with user IDs
//         } else {
//           console.log("✅ Fetched profiles:", profiles?.length || 0);
//           (profiles || []).forEach((profile) => {
//             const existing = balanceMap.get(profile.user_id);
//             if (existing) {
//               existing.name = profile.full_name || "";
//               existing.email = profile.email || "";
//             }
//           });
//         }
//       }

//       // Convert to array
//       const balanceArray: Balance[] = Array.from(balanceMap.entries())
//         .filter(([_, data]) => Math.abs(data.amount) > 0.01)
//         .map(([userId, data]) => ({
//           userId,
//           userName: data.name || data.email || "Unknown User",
//           userEmail: data.email || "",
//           amount: Math.round(data.amount * 100) / 100,
//         }));

//       console.log("💰 Final balances:", balanceArray);

//       // Calculate totals
//       let owed = 0;
//       let owe = 0;
//       balanceArray.forEach((b) => {
//         if (b.amount > 0) {
//           owed += b.amount;
//         } else {
//           owe += Math.abs(b.amount);
//         }
//       });

//       setBalances(balanceArray);
//       setTotalOwed(Math.round(owed * 100) / 100);
//       setTotalOwe(Math.round(owe * 100) / 100);
      
//       // Format settlements with profile data
//       const formattedSettlements = await Promise.all(
//         (settlementsData || []).map(async (s: any) => {
//           const { data: payerProfile } = await supabase
//             .from("profiles")
//             .select("full_name, email")
//             .eq("user_id", s.paid_by)
//             .single();
          
//           const { data: receiverProfile } = await supabase
//             .from("profiles")
//             .select("full_name, email")
//             .eq("user_id", s.paid_to)
//             .single();

//           return {
//             ...s,
//             payer: payerProfile,
//             receiver: receiverProfile,
//           };
//         })
//       );

//       setSettlements(formattedSettlements);

//       console.log("✅ Balance calculation complete");
//       console.log("📈 Total owed to you: ₹" + owed);
//       console.log("📉 Total you owe: ₹" + owe);
      
//     } catch (error: any) {
//       console.error("❌ CRITICAL ERROR in calculateBalances:", error);
//       console.error("Error details:", {
//         message: error.message,
//         code: error.code,
//         details: error.details,
//         hint: error.hint
//       });
//       toast.error("Failed to calculate balances: " + (error.message || "Unknown error"));
//     } finally {
//       setLoading(false);
//     }
//   }, []);

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

//     // Real-time subscription for auto-updates
//     const channel = supabase
//       .channel('balances-realtime')
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'settlements' },
//         () => {
//           console.log("🔔 Settlement changed, recalculating...");
//           calculateBalances();
//         }
//       )
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'expenses' },
//         () => {
//           console.log("🔔 Expense changed, recalculating...");
//           calculateBalances();
//         }
//       )
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'expense_splits' },
//         () => {
//           console.log("🔔 Split changed, recalculating...");
//           calculateBalances();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [calculateBalances]);

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




// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++====



import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Balance {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
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

      console.log("🤝 Fetching settlements...");
      const { data: settlementsData, error: settlementsError } = await supabase
        .from("settlements")
        .select("id, group_id, paid_by, paid_to, amount, notes, receipt_url, settled_at")
        .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
        .order("settled_at", { ascending: false });

      if (settlementsError) {
        console.error("❌ Error fetching settlements:", settlementsError);
        console.log("⚠️ Continuing without settlements");
      }

      console.log("✅ Fetched settlements:", settlementsData?.length || 0);

      const balanceMap = new Map<string, { amount: number; name: string; email: string }>();
      const expenseMap = new Map();
      
      allExpenses.forEach(exp => {
        expenseMap.set(exp.id, exp);
      });

      console.log("🧮 Processing splits...");
      let processedCount = 0;

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
          const existing = balanceMap.get(splitUser) || { amount: 0, name: "", email: "" };
          existing.amount += splitAmount;
          balanceMap.set(splitUser, existing);
          console.log(`➕ ${splitUser.substring(0, 8)}... owes you ₹${splitAmount}`);
          processedCount++;
        } else if (splitUser === user.id && paidBy !== user.id) {
          const existing = balanceMap.get(paidBy) || { amount: 0, name: "", email: "" };
          existing.amount -= splitAmount;
          balanceMap.set(paidBy, existing);
          console.log(`➖ You owe ${paidBy.substring(0, 8)}... ₹${splitAmount}`);
          processedCount++;
        }
      });

      console.log(`✅ Processed ${processedCount} relevant splits`);

      if (settlementsData && settlementsData.length > 0) {
        console.log("🧮 Applying settlements...");
        console.log("Current user perspective: Building map from MY viewpoint");
        
        (settlementsData || []).forEach((settlement: any) => {
          const amount = Number(settlement.amount);
          const payer = settlement.paid_by;
          const receiver = settlement.paid_to;
          
          console.log(`\n💰 Settlement: ${payer.substring(0,8)}... paid ${receiver.substring(0,8)}... ₹${amount}`);
          
          if (payer === user.id) {
  const existing = balanceMap.get(receiver) || { amount: 0, name: "", email: "" };
  const before = existing.amount;
  existing.amount = existing.amount + amount; // ✅ CHANGE - to +
  balanceMap.set(receiver, existing);
  console.log(`   📤 YOU paid ${receiver.substring(0,8)}: balance ${before} -> ${existing.amount}`);
}

          else if (receiver === user.id) {
            const existing = balanceMap.get(payer) || { amount: 0, name: "", email: "" };
            const before = existing.amount;
            existing.amount = existing.amount - amount;
            balanceMap.set(payer, existing);
            console.log(`   📥 YOU received from ${payer.substring(0,8)}: balance ${before} -> ${existing.amount}`);
          }
        });
        
        console.log("\n✅ All settlements applied");
      }

      const userIds = Array.from(balanceMap.keys());
      console.log("👥 Fetching profiles for", userIds.length, "users");
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        if (profilesError) {
          console.error("❌ Error fetching profiles:", profilesError);
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

      const balanceArray: Balance[] = Array.from(balanceMap.entries())
        .filter(([_, data]) => Math.abs(data.amount) > 0.01)
        .map(([userId, data]) => ({
          userId,
          userName: data.name || data.email || "Unknown User",
          userEmail: data.email || "",
          amount: Math.round(data.amount * 100) / 100,
        }));

      console.log("\n💰 Final balances:");
      balanceArray.forEach(b => {
        console.log(`   ${b.userName}: ${b.amount > 0 ? 'owes you' : 'you owe'} ₹${Math.abs(b.amount)}`);
      });

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

      console.log("\n✅ Balance calculation complete");
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
      console.log("💳 Creating settlement...");
      console.log("Group:", groupId);
      console.log("Paid to:", paidTo);
      console.log("Amount:", amount);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: settlementError } = await supabase.from("settlements").insert({
        group_id: groupId,
        paid_by: user.id,
        paid_to: paidTo,
        amount,
        notes,
      });

      if (settlementError) throw settlementError;

      console.log("✅ Settlement record created");

      console.log("🔍 Finding splits to mark as settled...");

      const { data: expensesToSettle, error: expensesError } = await supabase
        .from("expenses")
        .select("id")
        .eq("group_id", groupId)
        .eq("paid_by", paidTo);

      if (expensesError) {
        console.error("⚠️ Error fetching expenses:", expensesError);
      } else if (expensesToSettle && expensesToSettle.length > 0) {
        const expenseIds = expensesToSettle.map(e => e.id);
        
        const { data: splitsToSettle, error: splitsError } = await supabase
          .from("expense_splits")
          .select("id, amount")
          .in("expense_id", expenseIds)
          .eq("user_id", user.id)
          .eq("is_settled", false);

        if (splitsError) {
          console.error("⚠️ Error fetching splits:", splitsError);
        } else if (splitsToSettle && splitsToSettle.length > 0) {
          console.log(`Found ${splitsToSettle.length} splits to potentially settle`);

          let remainingAmount = amount;
          const splitsToUpdate: string[] = [];

          splitsToSettle.sort((a, b) => a.amount - b.amount);

          for (const split of splitsToSettle) {
            if (remainingAmount >= split.amount) {
              splitsToUpdate.push(split.id);
              remainingAmount = remainingAmount - split.amount;
              console.log(`✓ Marking split ${split.id} as settled (₹${split.amount})`);
            } else if (remainingAmount > 0) {
              console.log(`⚠️ Partial payment remaining: ₹${remainingAmount}`);
              break;
            }
          }

          if (splitsToUpdate.length > 0) {
            const { error: updateError } = await supabase
              .from("expense_splits")
              .update({ is_settled: true })
              .in("id", splitsToUpdate);

            if (updateError) {
              console.error("⚠️ Error updating splits:", updateError);
            } else {
              console.log(`✅ Marked ${splitsToUpdate.length} splits as settled`);
            }
          }
        }
      }

      await calculateBalances();
      toast.success("Settlement recorded!");
    } catch (error: any) {
      console.error("❌ Error creating settlement:", error);
      toast.error(error.message || "Failed to record settlement");
      throw error;
    }
  };

  useEffect(() => {
    calculateBalances();

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






// ++++++++++++++++++++++++++++++
// ==============================

// New Fixed UseBalances.ts 

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

//   const calculateBalances = useCallback(async () => {
//     try {
//       console.log("🔄 Starting balance calculation...");
      
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
      
//       if (userError) {
//         console.error("❌ Auth error:", userError);
//         setLoading(false);
//         return;
//       }
      
//       if (!user) {
//         console.log("⚠️ No user logged in");
//         setLoading(false);
//         return;
//       }

//       console.log("👤 Current User ID:", user.id);

//       // ============================================================================
//       // STEP 1: Get ALL unsettled expense splits (across all groups)
//       // ============================================================================
//       console.log("📊 Fetching unsettled expense splits...");
      
//       const { data: allSplits, error: splitsError } = await supabase
//         .from("expense_splits")
//         .select("id, expense_id, user_id, amount")
//         .eq("is_settled", false); // CRITICAL: Only get unsettled splits!

//       if (splitsError) {
//         console.error("❌ Error fetching splits:", splitsError);
//         throw splitsError;
//       }

//       console.log(`✅ Found ${allSplits?.length || 0} unsettled splits`);

//       if (!allSplits || allSplits.length === 0) {
//         console.log("ℹ️ No unsettled splits found");
//         setBalances([]);
//         setTotalOwed(0);
//         setTotalOwe(0);
//         setLoading(false);
//         return;
//       }

//       // ============================================================================
//       // STEP 2: Get the expenses for these splits
//       // ============================================================================
//       console.log("💰 Fetching expenses...");
      
//       const expenseIds = [...new Set(allSplits.map(s => s.expense_id))];
      
//       const { data: expenses, error: expensesError } = await supabase
//         .from("expenses")
//         .select("id, paid_by, title, group_id")
//         .in("id", expenseIds);

//       if (expensesError) {
//         console.error("❌ Error fetching expenses:", expensesError);
//         throw expensesError;
//       }

//       console.log(`✅ Found ${expenses?.length || 0} expenses`);

//       // ============================================================================
//       // STEP 3: Build balance map
//       // ============================================================================
//       console.log("🧮 Calculating balances...");
      
//       const balanceMap = new Map<string, { amount: number; name: string; email: string }>();
//       const expenseMap = new Map();
      
//       (expenses || []).forEach(exp => {
//         expenseMap.set(exp.id, exp);
//       });

//       let processedCount = 0;

//       // Process each split
//       allSplits.forEach((split) => {
//         const expense = expenseMap.get(split.expense_id);
        
//         if (!expense) {
//           console.warn(`⚠️ Expense ${split.expense_id} not found for split ${split.id}`);
//           return;
//         }

//         const paidBy = expense.paid_by;
//         const splitUser = split.user_id;
//         const splitAmount = Number(split.amount);

//         // Skip if payer and split user are the same (self-payment)
//         if (paidBy === splitUser) {
//           return;
//         }

//         // Case 1: Current user PAID the expense, someone else owes them
//         if (paidBy === user.id && splitUser !== user.id) {
//           const existing = balanceMap.get(splitUser) || { amount: 0, name: "", email: "" };
//           existing.amount += splitAmount; // They owe you MORE
//           balanceMap.set(splitUser, existing);
//           console.log(`  ➕ ${splitUser.substring(0, 8)}... owes you ₹${splitAmount}`);
//           processedCount++;
//         }
        
//         // Case 2: Someone else PAID the expense, current user owes them
//         else if (splitUser === user.id && paidBy !== user.id) {
//           const existing = balanceMap.get(paidBy) || { amount: 0, name: "", email: "" };
//           existing.amount -= splitAmount; // You owe them MORE
//           balanceMap.set(paidBy, existing);
//           console.log(`  ➖ You owe ${paidBy.substring(0, 8)}... ₹${splitAmount}`);
//           processedCount++;
//         }
//       });

//       console.log(`✅ Processed ${processedCount} relevant splits`);

//       // ============================================================================
//       // STEP 4: Get profile information for users in the balance map
//       // ============================================================================
//       const userIds = Array.from(balanceMap.keys());
//       console.log(`👥 Fetching profiles for ${userIds.length} users...`);
      
//       if (userIds.length > 0) {
//         const { data: profiles, error: profilesError } = await supabase
//           .from("profiles")
//           .select("user_id, full_name, email")
//           .in("user_id", userIds);

//         if (profilesError) {
//           console.error("⚠️ Error fetching profiles:", profilesError);
//           // Continue without profile names
//         } else {
//           console.log(`✅ Fetched ${profiles?.length || 0} profiles`);
          
//           (profiles || []).forEach((profile) => {
//             const existing = balanceMap.get(profile.user_id);
//             if (existing) {
//               existing.name = profile.full_name || "";
//               existing.email = profile.email || "";
//             }
//           });
//         }
//       }

//       // ============================================================================
//       // STEP 5: Convert to array and filter out near-zero balances
//       // ============================================================================
//       const balanceArray: Balance[] = Array.from(balanceMap.entries())
//         .filter(([_, data]) => Math.abs(data.amount) > 0.01) // Ignore tiny amounts
//         .map(([userId, data]) => ({
//           userId,
//           userName: data.name || data.email || "Unknown User",
//           userEmail: data.email || "",
//           amount: Math.round(data.amount * 100) / 100, // Round to 2 decimals
//         }));

//       console.log("\n💰 Final Balances:");
//       balanceArray.forEach(b => {
//         if (b.amount > 0) {
//           console.log(`  ✅ ${b.userName} owes you ₹${b.amount.toFixed(2)}`);
//         } else {
//           console.log(`  ❌ You owe ${b.userName} ₹${Math.abs(b.amount).toFixed(2)}`);
//         }
//       });

//       // ============================================================================
//       // STEP 6: Calculate totals
//       // ============================================================================
//       let owed = 0;
//       let owe = 0;
      
//       balanceArray.forEach((b) => {
//         if (b.amount > 0) {
//           owed += b.amount; // Money owed TO you
//         } else {
//           owe += Math.abs(b.amount); // Money you OWE to others
//         }
//       });

//       setBalances(balanceArray);
//       setTotalOwed(Math.round(owed * 100) / 100);
//       setTotalOwe(Math.round(owe * 100) / 100);

//       console.log("\n📊 Summary:");
//       console.log(`  📈 Total owed to you: ₹${owed.toFixed(2)}`);
//       console.log(`  📉 Total you owe: ₹${owe.toFixed(2)}`);
//       console.log(`  💵 Net balance: ₹${(owed - owe).toFixed(2)}`);

//       // ============================================================================
//       // STEP 7: Load settlement history (optional, for display purposes)
//       // ============================================================================
//       console.log("\n🤝 Loading settlement history...");
      
//       try {
//         const { data: settlementsData, error: settlementsError } = await supabase
//           .from("settlements")
//           .select("*")
//           .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
//           .order("settled_at", { ascending: false })
//           .limit(50);

//         if (settlementsError) {
//           console.error("⚠️ Error fetching settlements:", settlementsError);
//           // Don't throw - settlements are optional for balance calculation
//           setSettlements([]);
//         } else {
//           console.log(`✅ Loaded ${settlementsData?.length || 0} settlement records`);
          
//           // Fetch profile data for settlements
//           if (settlementsData && settlementsData.length > 0) {
//             const formattedSettlements = await Promise.all(
//               settlementsData.map(async (s: any) => {
//                 try {
//                   const [payerResult, receiverResult] = await Promise.all([
//                     supabase
//                       .from("profiles")
//                       .select("full_name, email")
//                       .eq("user_id", s.paid_by)
//                       .single(),
//                     supabase
//                       .from("profiles")
//                       .select("full_name, email")
//                       .eq("user_id", s.paid_to)
//                       .single()
//                   ]);

//                   return {
//                     ...s,
//                     payer: payerResult.data,
//                     receiver: receiverResult.data,
//                   };
//                 } catch (error) {
//                   console.warn("⚠️ Error fetching profile for settlement:", error);
//                   return {
//                     ...s,
//                     payer: null,
//                     receiver: null,
//                   };
//                 }
//               })
//             );

//             setSettlements(formattedSettlements);
//           } else {
//             setSettlements([]);
//           }
//         }
//       } catch (error) {
//         console.error("⚠️ Settlements table query failed:", error);
//         setSettlements([]);
//         // Continue - this is non-critical
//       }

//       console.log("✅ Balance calculation complete!\n");
      
//     } catch (error: any) {
//       console.error("❌ CRITICAL ERROR in calculateBalances:", error);
//       toast.error("Failed to calculate balances");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   /**
//    * Creates a settlement by marking expense splits as settled
//    * 
//    * FIXED VERSION: Correctly identifies splits where current user owes paidTo
//    */
//   const createSettlement = async (
//     groupId: string,
//     paidTo: string,
//     amount: number,
//     notes?: string
//   ) => {
//     try {
//       console.log("\n💳 Creating settlement...");
//       console.log(`  Group: ${groupId}`);
//       console.log(`  Paying to: ${paidTo}`);
//       console.log(`  Amount: ₹${amount}`);
      
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       // ========================================================================
//       // STEP 1: Find ALL expenses where paidTo was the payer
//       // ========================================================================
//       console.log("\n🔍 Finding expenses where recipient paid...");
      
//       const { data: expensesWhereRecipientPaid, error: expensesError } = await supabase
//         .from("expenses")
//         .select("id, title, amount, group_id, paid_by")
//         .eq("paid_by", paidTo); // Find expenses paid by the person you're settling with

//       if (expensesError) throw expensesError;

//       if (!expensesWhereRecipientPaid || expensesWhereRecipientPaid.length === 0) {
//         throw new Error("No expenses found where this person paid. Nothing to settle.");
//       }

//       console.log(`  ✅ Found ${expensesWhereRecipientPaid.length} expenses paid by recipient`);

//       // Filter to only expenses in the selected group
//       const expensesInGroup = expensesWhereRecipientPaid.filter(e => e.group_id === groupId);
      
//       if (expensesInGroup.length === 0) {
//         throw new Error(`No expenses found in the selected group where ${paidTo.substring(0, 8)}... paid.`);
//       }

//       console.log(`  ✅ ${expensesInGroup.length} of those are in the selected group`);

//       const expenseIds = expensesInGroup.map(e => e.id);

//       // ========================================================================
//       // STEP 2: Find YOUR unsettled splits in those expenses
//       // ========================================================================
//       console.log("\n📋 Finding YOUR unsettled splits in those expenses...");
      
//       const { data: yourSplitsToSettle, error: splitsError } = await supabase
//         .from("expense_splits")
//         .select("id, expense_id, amount, user_id")
//         .in("expense_id", expenseIds)
//         .eq("user_id", user.id) // YOUR splits
//         .eq("is_settled", false) // Only unsettled
//         .order("amount", { ascending: true }); // Settle smallest amounts first

//       if (splitsError) throw splitsError;

//       if (!yourSplitsToSettle || yourSplitsToSettle.length === 0) {
//         throw new Error("No unsettled payments found. You may have already settled all expenses with this person in this group.");
//       }

//       console.log(`  ✅ Found ${yourSplitsToSettle.length} unsettled splits where you owe them`);
      
//       // Log each split for debugging
//       yourSplitsToSettle.forEach((split, idx) => {
//         console.log(`    Split ${idx + 1}: ₹${Number(split.amount).toFixed(2)}`);
//       });

//       // ========================================================================
//       // STEP 3: Determine which splits to settle with the given amount
//       // ========================================================================
//       console.log("\n🧮 Calculating which splits to settle...");
      
//       let remainingAmount = amount;
//       const splitIdsToSettle: string[] = [];
//       let totalSettledAmount = 0;

//       for (const split of yourSplitsToSettle) {
//         const splitAmount = Number(split.amount);
        
//         if (remainingAmount >= splitAmount) {
//           // Can fully settle this split
//           splitIdsToSettle.push(split.id);
//           totalSettledAmount += splitAmount;
//           remainingAmount -= splitAmount;
//           console.log(`  ✓ Will fully settle split of ₹${splitAmount.toFixed(2)} (remaining: ₹${remainingAmount.toFixed(2)})`);
//         } else if (remainingAmount > 0.01) {
//           // Remaining amount is less than this split, but more than negligible
//           console.log(`  ⚠️ Partial amount remaining: ₹${remainingAmount.toFixed(2)} (not enough to settle next split of ₹${splitAmount.toFixed(2)})`);
//           break;
//         } else {
//           // No more amount to settle
//           break;
//         }
//       }

//       if (splitIdsToSettle.length === 0) {
//         throw new Error(`Amount (₹${amount.toFixed(2)}) is too small to settle any complete payments. The smallest unsettled amount is ₹${Number(yourSplitsToSettle[0].amount).toFixed(2)}.`);
//       }

//       console.log(`\n  📊 Will settle ${splitIdsToSettle.length} split(s) totaling ₹${totalSettledAmount.toFixed(2)}`);
//       if (remainingAmount > 0.01) {
//         console.log(`  💡 Remaining amount: ₹${remainingAmount.toFixed(2)} (not enough for next split)`);
//       }

//       // ========================================================================
//       // STEP 4: Mark the splits as settled (THE CRITICAL PART!)
//       // ========================================================================
//       console.log("\n✍️ Marking splits as settled in database...");
      
//       const { data: updateData, error: updateError } = await supabase
//         .from("expense_splits")
//         .update({ is_settled: true })
//         .in("id", splitIdsToSettle)
//         .select(); // Get back the updated rows for verification

//       if (updateError) {
//         console.error("❌ Error updating splits:", updateError);
//         throw new Error(`Failed to mark splits as settled: ${updateError.message}`);
//       }

//       console.log(`  ✅ Successfully marked ${updateData?.length || 0} splits as settled`);

//       // ========================================================================
//       // STEP 5: Record the settlement in settlements table (for history)
//       // ========================================================================
//       console.log("\n📝 Recording settlement in history table...");
      
//       try {
//         const { data: settlementData, error: settlementError } = await supabase
//           .from("settlements")
//           .insert({
//             group_id: groupId,
//             paid_by: user.id, // YOU paid
//             paid_to: paidTo, // To this person
//             amount: totalSettledAmount, // The actual amount settled
//             notes: notes || null,
//           })
//           .select()
//           .single();

//         if (settlementError) {
//           console.warn("⚠️ Error recording settlement history:", settlementError);
//           // Don't throw - the splits are already marked as settled (most important part)
//           toast.warning("Splits marked as settled, but history record failed.");
//         } else {
//           console.log("  ✅ Settlement recorded in history with ID:", settlementData?.id);
//         }
//       } catch (error) {
//         console.warn("⚠️ Settlements table not accessible:", error);
//         toast.warning("Splits marked as settled, but history record failed.");
//         // Continue - the important part (marking splits as settled) is done
//       }

//       // ========================================================================
//       // STEP 6: Refresh balances
//       // ========================================================================
//       console.log("\n🔄 Refreshing balances...");
//       await calculateBalances();

//       // Show success message
//       let message = `Settlement recorded! Marked ${splitIdsToSettle.length} payment(s) as settled (₹${totalSettledAmount.toFixed(2)}).`;
      
//       if (remainingAmount > 0.01) {
//         message += ` ₹${remainingAmount.toFixed(2)} remaining (not enough for next split).`;
//       }
      
//       toast.success(message);
      
//       console.log("✅ Settlement complete!\n");
      
//     } catch (error: any) {
//       console.error("❌ Settlement failed:", error);
//       toast.error(error.message || "Failed to record settlement");
//       throw error;
//     }
//   };

//   // ============================================================================
//   // Real-time subscriptions and initial load
//   // ============================================================================
//   useEffect(() => {
//     calculateBalances();

//     // Subscribe to changes in expense_splits table
//     const channel = supabase
//       .channel('balances-realtime')
//       .on(
//         'postgres_changes',
//         { 
//           event: '*', 
//           schema: 'public', 
//           table: 'expense_splits' 
//         },
//         (payload) => {
//           console.log("🔔 Expense split changed:", payload.eventType);
//           calculateBalances();
//         }
//       )
//       .on(
//         'postgres_changes',
//         { 
//           event: '*', 
//           schema: 'public', 
//           table: 'expenses' 
//         },
//         (payload) => {
//           console.log("🔔 Expense changed:", payload.eventType);
//           calculateBalances();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [calculateBalances]);

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