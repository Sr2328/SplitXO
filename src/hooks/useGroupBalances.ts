import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GroupBalance {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
}

export function useGroupBalances(groupId?: string) {
  const [balances, setBalances] = useState<GroupBalance[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateBalances = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all expenses in this group where current user paid
      const { data: paidExpenses } = await supabase
        .from("expenses")
        .select(`
          id,
          amount,
          paid_by,
          splits:expense_splits(user_id, amount, is_settled)
        `)
        .eq("group_id", groupId)
        .eq("paid_by", user.id);

      // Get all expense splits in this group where current user owes
      const { data: owedSplits } = await supabase
        .from("expense_splits")
        .select(`
          amount,
          is_settled,
          expense:expenses!inner(
            id,
            group_id,
            paid_by,
            payer:profiles!expenses_paid_by_fkey(user_id, full_name, email)
          )
        `)
        .eq("user_id", user.id)
        .eq("expense.group_id", groupId)
        .neq("expense.paid_by", user.id);

      // Get settlements for this group
      const { data: settlementsData } = await supabase
        .from("settlements")
        .select(`
          *,
          payer:profiles!settlements_paid_by_fkey(full_name, email),
          receiver:profiles!settlements_paid_to_fkey(full_name, email)
        `)
        .eq("group_id", groupId)
        .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`);

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
          const existing = balanceMap.get(settlement.paid_to) || { 
            amount: 0, 
            name: receiverProfile?.full_name || "", 
            email: receiverProfile?.email || "" 
          };
          existing.amount += Number(settlement.amount);
          balanceMap.set(settlement.paid_to, existing);
        } else {
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
      const balanceArray: GroupBalance[] = Array.from(balanceMap.entries())
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
    } catch (error: any) {
      console.error("Error calculating group balances:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const createSettlement = async (
    paidTo: string,
    amount: number,
    notes?: string,
    receiptUrl?: string
  ) => {
    if (!groupId) throw new Error("No group selected");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("settlements").insert({
        group_id: groupId,
        paid_by: user.id,
        paid_to: paidTo,
        amount,
        notes,
        receipt_url: receiptUrl,
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
  }, [calculateBalances]);

  return {
    balances,
    totalOwed,
    totalOwe,
    loading,
    refreshBalances: calculateBalances,
    createSettlement,
  };
}
