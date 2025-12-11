// import { useState, useEffect, useCallback } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { toast } from "sonner";

// export interface GroupBalance {
//   userId: string;
//   userName: string;
//   userEmail: string;
//   amount: number;
// }

// export function useGroupBalances(groupId?: string) {
//   const [balances, setBalances] = useState<GroupBalance[]>([]);
//   const [totalOwed, setTotalOwed] = useState(0);
//   const [totalOwe, setTotalOwe] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const calculateBalances = useCallback(async () => {
//     if (!groupId) {
//       console.log("⚠️ No group ID provided");
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log("🔄 Calculating group balances for:", groupId);
      
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

//       // Step 1: Get all expenses in this group
//       console.log("💰 Fetching group expenses...");
//       const { data: groupExpenses, error: expensesError } = await supabase
//         .from("expenses")
//         .select("id, paid_by, amount, title")
//         .eq("group_id", groupId);

//       if (expensesError) {
//         console.error("❌ Error fetching group expenses:", expensesError);
//         toast.error("Failed to fetch expenses: " + expensesError.message);
//         throw expensesError;
//       }

//       console.log("✅ Group expenses:", groupExpenses?.length || 0);

//       if (!groupExpenses || groupExpenses.length === 0) {
//         console.log("ℹ️ No expenses in this group yet");
//         setBalances([]);
//         setTotalOwed(0);
//         setTotalOwe(0);
//         setLoading(false);
//         return;
//       }

//       // Step 2: Get all splits for these expenses
//       const expenseIds = groupExpenses.map(e => e.id);
      
//       console.log("📊 Fetching splits for", expenseIds.length, "expenses...");
//       const { data: allSplits, error: splitsError } = await supabase
//         .from("expense_splits")
//         .select("*")
//         .in("expense_id", expenseIds)
//         .eq("is_settled", false);

//       if (splitsError) {
//         console.error("❌ Error fetching splits:", splitsError);
//         toast.error("Failed to fetch splits: " + splitsError.message);
//         throw splitsError;
//       }

//       console.log("✅ Group splits:", allSplits?.length || 0);

//       // Step 3: Get settlements for this group
//       console.log("🤝 Fetching settlements...");
//       const { data: settlementsData, error: settlementsError } = await supabase
//         .from("settlements")
//         .select("*")
//         .eq("group_id", groupId)
//         .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`);

//       if (settlementsError) {
//         console.error("❌ Error fetching settlements:", settlementsError);
//       }

//       console.log("✅ Settlements:", settlementsData?.length || 0);

//       // Calculate balances
//       const balanceMap = new Map<string, { amount: number; name: string; email: string }>();

//       // Create expense lookup
//       const expenseMap = new Map();
//       groupExpenses.forEach(exp => {
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
//           console.log(`➕ ${splitUser.substring(0, 8)}... owes you ₹${splitAmount} for "${expense.title}"`);
//           processedCount++;
//         } else if (splitUser === user.id && paidBy !== user.id) {
//           // Someone else paid, current user owes them
//           const existing = balanceMap.get(paidBy) || { amount: 0, name: "", email: "" };
//           existing.amount -= splitAmount;
//           balanceMap.set(paidBy, existing);
//           console.log(`➖ You owe ${paidBy.substring(0, 8)}... ₹${splitAmount} for "${expense.title}"`);
//           processedCount++;
//         }
//       });

//       console.log(`✅ Processed ${processedCount} relevant splits`);

//       // Apply settlements - FIXED LOGIC
//       if (settlementsData && settlementsData.length > 0) {
//         console.log("🧮 Applying settlements...");
//         (settlementsData || []).forEach((settlement: any) => {
//           const amount = Number(settlement.amount);
          
//           // When you pay someone, it REDUCES what you owe them (or reduces what they owe you)
//           if (settlement.paid_by === user.id) {
//             const existing = balanceMap.get(settlement.paid_to) || { amount: 0, name: "", email: "" };
//             existing.amount -= amount; // FIXED: subtract because you're reducing the debt
//             balanceMap.set(settlement.paid_to, existing);
//             console.log(`🔄 Settlement applied: You paid ₹${amount}`);
//           } 
//           // When someone pays you, it REDUCES what they owe you (or reduces what you owe them)
//           else if (settlement.paid_to === user.id) {
//             const existing = balanceMap.get(settlement.paid_by) || { amount: 0, name: "", email: "" };
//             existing.amount += amount; // FIXED: add because they're reducing their debt to you
//             balanceMap.set(settlement.paid_by, existing);
//             console.log(`🔄 Settlement applied: Received ₹${amount}`);
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
//       const balanceArray: GroupBalance[] = Array.from(balanceMap.entries())
//         .filter(([_, data]) => Math.abs(data.amount) > 0.01)
//         .map(([userId, data]) => ({
//           userId,
//           userName: data.name || data.email || "Unknown User",
//           userEmail: data.email || "",
//           amount: Math.round(data.amount * 100) / 100,
//         }));

//       console.log("💰 Final group balances:", balanceArray);

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

//       console.log("✅ Group balance calculation complete");
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
//   }, [groupId]);

//   const createSettlement = async (
//     paidTo: string,
//     amount: number,
//     notes?: string,
//     receiptUrl?: string
//   ) => {
//     if (!groupId) throw new Error("No group selected");

//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("Not authenticated");

//       const { error } = await supabase.from("settlements").insert({
//         group_id: groupId,
//         paid_by: user.id,
//         paid_to: paidTo,
//         amount,
//         notes,
//         receipt_url: receiptUrl,
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

//     // Real-time subscription for auto-updates within this group
//     if (groupId) {
//       const channel = supabase
//         .channel(`group-balances-${groupId}`)
//         .on(
//           'postgres_changes',
//           { event: '*', schema: 'public', table: 'settlements' },
//           () => {
//             console.log("🔔 Settlement changed in group, recalculating...");
//             calculateBalances();
//           }
//         )
//         .on(
//           'postgres_changes',
//           { event: '*', schema: 'public', table: 'expenses' },
//           () => {
//             console.log("🔔 Expense changed in group, recalculating...");
//             calculateBalances();
//           }
//         )
//         .on(
//           'postgres_changes',
//           { event: '*', schema: 'public', table: 'expense_splits' },
//           () => {
//             console.log("🔔 Split changed in group, recalculating...");
//             calculateBalances();
//           }
//         )
//         .subscribe();

//       return () => {
//         supabase.removeChannel(channel);
//       };
//     }
//   }, [calculateBalances, groupId]);

//   return {
//     balances,
//     totalOwed,
//     totalOwe,
//     loading,
//     refreshBalances: calculateBalances,
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
      console.log("⚠️ No group ID provided");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Calculating group balances for:", groupId);
      
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

      // Step 1: Get all expenses in this group
      console.log("💰 Fetching group expenses...");
      const { data: groupExpenses, error: expensesError } = await supabase
        .from("expenses")
        .select("id, paid_by, amount, title")
        .eq("group_id", groupId);

      if (expensesError) {
        console.error("❌ Error fetching group expenses:", expensesError);
        toast.error("Failed to fetch expenses: " + expensesError.message);
        throw expensesError;
      }

      console.log("✅ Group expenses:", groupExpenses?.length || 0);

      if (!groupExpenses || groupExpenses.length === 0) {
        console.log("ℹ️ No expenses in this group yet");
        setBalances([]);
        setTotalOwed(0);
        setTotalOwe(0);
        setLoading(false);
        return;
      }

      // Step 2: Get all splits for these expenses
      const expenseIds = groupExpenses.map(e => e.id);
      
      console.log("📊 Fetching splits for", expenseIds.length, "expenses...");
      const { data: allSplits, error: splitsError } = await supabase
        .from("expense_splits")
        .select("*")
        .in("expense_id", expenseIds)
        .eq("is_settled", false);

      if (splitsError) {
        console.error("❌ Error fetching splits:", splitsError);
        toast.error("Failed to fetch splits: " + splitsError.message);
        throw splitsError;
      }

      console.log("✅ Group splits:", allSplits?.length || 0);

      // Step 3: Get settlements for this group
      console.log("🤝 Fetching settlements...");
      const { data: settlementsData, error: settlementsError } = await supabase
        .from("settlements")
        .select("*")
        .eq("group_id", groupId)
        .or(`paid_by.eq.${user.id},paid_to.eq.${user.id}`);

      if (settlementsError) {
        console.error("❌ Error fetching settlements:", settlementsError);
      }

      console.log("✅ Settlements:", settlementsData?.length || 0);

      // Calculate balances
      const balanceMap = new Map<string, { amount: number; name: string; email: string }>();

      // Create expense lookup
      const expenseMap = new Map();
      groupExpenses.forEach(exp => {
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

        // IMPORTANT: Building from current user's perspective
        // Positive = they owe you, Negative = you owe them

        if (paidBy === user.id && splitUser !== user.id) {
          // Current user paid, someone else owes them
          const existing = balanceMap.get(splitUser) || { amount: 0, name: "", email: "" };
          existing.amount += splitAmount;
          balanceMap.set(splitUser, existing);
          console.log(`➕ ${splitUser.substring(0, 8)}... owes you ₹${splitAmount} for "${expense.title}"`);
          processedCount++;
        } else if (splitUser === user.id && paidBy !== user.id) {
          // Someone else paid, current user owes them
          const existing = balanceMap.get(paidBy) || { amount: 0, name: "", email: "" };
          existing.amount -= splitAmount;
          balanceMap.set(paidBy, existing);
          console.log(`➖ You owe ${paidBy.substring(0, 8)}... ₹${splitAmount} for "${expense.title}"`);
          processedCount++;
        }
      });

      console.log(`✅ Processed ${processedCount} relevant splits`);

      // Apply settlements - CRITICAL FIX
      // A settlement represents: Person A paid Person B an amount
      // From current user's perspective:
      // - If I paid someone -> reduce what I see for them (debt decreases)
      // - If someone paid me -> reduce what I see for them (debt decreases)
      // The key insight: BOTH cases subtract from the balance!
      
      if (settlementsData && settlementsData.length > 0) {
        console.log("🧮 Applying settlements...");
        console.log("Current user perspective: Building map from MY viewpoint");
        
        (settlementsData || []).forEach((settlement: any) => {
          const amount = Number(settlement.amount);
          const payer = settlement.paid_by;
          const receiver = settlement.paid_to;
          
          console.log(`\n💰 Settlement: ${payer.substring(0,8)}... paid ${receiver.substring(0,8)}... ₹${amount}`);
          
          // Case 1: Current user PAID someone (I am the payer)
          if (payer === user.id) {
            // I paid someone, so from MY perspective:
            // Their balance from my view decreases (I've reduced my debt or they owe me less)
            const existing = balanceMap.get(receiver) || { amount: 0, name: "", email: "" };
            const before = existing.amount;
            existing.amount -= amount;
            balanceMap.set(receiver, existing);
            console.log(`   📤 YOU paid ${receiver.substring(0,8)}: balance ${before} -> ${existing.amount}`);
          }
          
          // Case 2: Current user RECEIVED payment (I am the receiver)
          else if (receiver === user.id) {
            // Someone paid me, so from MY perspective:
            // Their balance from my view decreases (they've paid down their debt)
            const existing = balanceMap.get(payer) || { amount: 0, name: "", email: "" };
            const before = existing.amount;
            existing.amount -= amount;
            balanceMap.set(payer, existing);
            console.log(`   📥 YOU received from ${payer.substring(0,8)}: balance ${before} -> ${existing.amount}`);
          }
        });
        
        console.log("\n✅ All settlements applied");
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
      const balanceArray: GroupBalance[] = Array.from(balanceMap.entries())
        .filter(([_, data]) => Math.abs(data.amount) > 0.01)
        .map(([userId, data]) => ({
          userId,
          userName: data.name || data.email || "Unknown User",
          userEmail: data.email || "",
          amount: Math.round(data.amount * 100) / 100,
        }));

      console.log("\n💰 Final group balances:");
      balanceArray.forEach(b => {
        console.log(`   ${b.userName}: ${b.amount > 0 ? 'owes you' : 'you owe'} ₹${Math.abs(b.amount)}`);
      });

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

      console.log("\n✅ Group balance calculation complete");
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

    // Real-time subscription for auto-updates within this group
    if (groupId) {
      const channel = supabase
        .channel(`group-balances-${groupId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'settlements' },
          () => {
            console.log("🔔 Settlement changed in group, recalculating...");
            calculateBalances();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses' },
          () => {
            console.log("🔔 Expense changed in group, recalculating...");
            calculateBalances();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expense_splits' },
          () => {
            console.log("🔔 Split changed in group, recalculating...");
            calculateBalances();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [calculateBalances, groupId]);

  return {
    balances,
    totalOwed,
    totalOwe,
    loading,
    refreshBalances: calculateBalances,
    createSettlement,
  };
}