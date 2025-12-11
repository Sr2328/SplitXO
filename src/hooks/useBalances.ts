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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all expenses where current user paid
      const { data: paidExpenses } = await supabase
        .from("expenses")
        .select(`
          id,
          amount,
          paid_by,
          splits:expense_splits(user_id, amount, is_settled)
        `)
        .eq("paid_by", user.id);

      // Get all expense splits where current user owes
      const { data: owedSplits } = await supabase
        .from("expense_splits")
        .select(`
          amount,
          is_settled,
          expense:expenses!inner(
            id,
            paid_by,
            payer:profiles!expenses_paid_by_fkey(user_id, full_name, email)
          )
        `)
        .eq("user_id", user.id)
        .neq("expense.paid_by", user.id);

      // Get all settlements
      const { data: settlementsData } = await supabase
        .from("settlements")
        .select(`
          *,
          payer:profiles!settlements_paid_by_fkey(full_name, email),
          receiver:profiles!settlements_paid_to_fkey(full_name, email)
        `)
        .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`)
        .order("settled_at", { ascending: false });

      // Calculate who owes what to the current user
      const balanceMap = new Map<string, { amount: number; name: string; email: string }>();

      // Process expenses where user paid
      (paidExpenses || []).forEach((expense) => {
        const splits = expense.splits || [];
        splits.forEach((split: any) => {
          if (split.user_id !== user.id && !split.is_settled) {
            const existing = balanceMap.get(split.user_id) || { amount: 0, name: "", email: "" };
            existing.amount += Number(split.amount);
            balanceMap.set(split.user_id, existing);
          }
        });
      });

      // Process splits where user owes others
      (owedSplits || []).forEach((split: any) => {
        if (!split.is_settled && split.expense?.payer) {
          const payer = Array.isArray(split.expense.payer) 
            ? split.expense.payer[0] 
            : split.expense.payer;
          
          const payerId = payer?.user_id || split.expense.paid_by;
          const existing = balanceMap.get(payerId) || { 
            amount: 0, 
            name: payer?.full_name || "", 
            email: payer?.email || "" 
          };
          existing.amount -= Number(split.amount);
          existing.name = payer?.full_name || existing.name;
          existing.email = payer?.email || existing.email;
          balanceMap.set(payerId, existing);
        }
      });

      // Apply settlements
      (settlementsData || []).forEach((settlement: any) => {
        const payerProfile = Array.isArray(settlement.payer) ? settlement.payer[0] : settlement.payer;
        const receiverProfile = Array.isArray(settlement.receiver) ? settlement.receiver[0] : settlement.receiver;

        if (settlement.paid_by === user.id) {
          // User paid someone, so that person owes user less
          const existing = balanceMap.get(settlement.paid_to) || { 
            amount: 0, 
            name: receiverProfile?.full_name || "", 
            email: receiverProfile?.email || "" 
          };
          existing.amount += Number(settlement.amount);
          balanceMap.set(settlement.paid_to, existing);
        } else {
          // Someone paid user, so user owes them less
          const existing = balanceMap.get(settlement.paid_by) || { 
            amount: 0, 
            name: payerProfile?.full_name || "", 
            email: payerProfile?.email || "" 
          };
          existing.amount -= Number(settlement.amount);
          balanceMap.set(settlement.paid_by, existing);
        }
      });

      // Get profile names for users without them
      const userIds = Array.from(balanceMap.keys()).filter(
        (id) => !balanceMap.get(id)?.name
      );

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        (profiles || []).forEach((profile) => {
          const existing = balanceMap.get(profile.user_id);
          if (existing) {
            existing.name = profile.full_name || "";
            existing.email = profile.email || "";
          }
        });
      }

      // Convert to array and filter out zero balances
      const balanceArray: Balance[] = Array.from(balanceMap.entries())
        .filter(([_, data]) => Math.abs(data.amount) > 0.01)
        .map(([userId, data]) => ({
          userId,
          userName: data.name || "Unknown",
          userEmail: data.email || "",
          amount: Math.round(data.amount * 100) / 100,
        }));

      // Calculate totals
      let owed = 0;
      let owe = 0;
      balanceArray.forEach((b) => {
        if (b.amount > 0) owed += b.amount;
        else owe += Math.abs(b.amount);
      });

      setBalances(balanceArray);
      setTotalOwed(Math.round(owed * 100) / 100);
      setTotalOwe(Math.round(owe * 100) / 100);
      setSettlements(
        (settlementsData || []).map((s: any) => ({
          ...s,
          payer: Array.isArray(s.payer) ? s.payer[0] : s.payer,
          receiver: Array.isArray(s.receiver) ? s.receiver[0] : s.receiver,
        }))
      );
    } catch (error: any) {
      console.error("Error calculating balances:", error);
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
        () => calculateBalances()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => calculateBalances()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expense_splits' },
        () => calculateBalances()
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
