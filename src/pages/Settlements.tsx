// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { supabase } from "@/integrations/supabase/client";
// import { User } from "@supabase/supabase-js";
// import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
// import { useBalances, Settlement } from "@/hooks/useBalances";
// import { useGroups } from "@/hooks/useGroups";
// import { SettleModal } from "@/components/balances/SettleModal";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { 
//   ArrowRightLeft, 
//   Receipt, 
//   Calendar, 
//   User as UserIcon, 
//   FileText, 
//   Download, 
//   ExternalLink,
//   TrendingUp,
//   TrendingDown,
//   CheckCircle2,
//   Clock,
//   Image as ImageIcon
// } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { Balance } from "@/hooks/useBalances";

// export default function Settlements() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         setUser(session?.user ?? null);
//         setLoading(false);
//         if (!session) {
//           navigate("/auth");
//         }
//       }
//     );

//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//       if (!session) {
//         navigate("/auth");
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="flex flex-col items-center gap-4">
//           <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//           <p className="text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   return (
//     <DashboardLayout user={user}>
//       <SettlementsContent user={user} />
//     </DashboardLayout>
//   );
// }

// function SettlementsContent({ user }: { user: User }) {
//   const { balances, totalOwed, totalOwe, settlements, loading, calculateBalances } = useBalances();
//   const { groups } = useGroups();
//   const [settleOpen, setSettleOpen] = useState(false);
//   const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
//   const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

//   // Real-time subscription for settlements
//   useEffect(() => {
//     const channel = supabase
//       .channel('settlements-realtime')
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'settlements'
//         },
//         () => {
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
//         () => {
//           calculateBalances();
//         }
//       )
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'expense_splits'
//         },
//         () => {
//           calculateBalances();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [calculateBalances]);

//   const handleSettle = (balance: Balance) => {
//     setSelectedBalance(balance);
//     setSettleOpen(true);
//   };

//   const handleSettleSubmit = async (groupId: string, paidTo: string, amount: number, notes?: string) => {
//     const { createSettlement } = useBalances();
//   };

//   const netBalance = totalOwed - totalOwe;

//   const getGroupName = (groupId: string) => {
//     return groups.find(g => g.id === groupId)?.name || "Unknown Group";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }} 
//         animate={{ opacity: 1, y: 0 }} 
//         transition={{ duration: 0.5 }}
//         className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
//       >
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settlements</h1>
//           <p className="text-muted-foreground mt-1">Track and manage all your payment settlements</p>
//         </div>
//       </motion.div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className={cn(
//             "bg-card rounded-2xl border border-border shadow-card p-6",
//             netBalance >= 0 ? "bg-gradient-to-br from-success/5 to-transparent" : "bg-gradient-to-br from-destructive/5 to-transparent"
//           )}
//         >
//           <div className="flex items-center gap-3 mb-4">
//             <div className={cn(
//               "p-2 rounded-xl",
//               netBalance >= 0 ? "bg-success/10" : "bg-destructive/10"
//             )}>
//               {netBalance >= 0 ? (
//                 <TrendingUp className="h-5 w-5 text-success" />
//               ) : (
//                 <TrendingDown className="h-5 w-5 text-destructive" />
//               )}
//             </div>
//             <span className="text-sm text-muted-foreground">Net Balance</span>
//           </div>
//           <p className={cn(
//             "text-3xl font-bold",
//             netBalance >= 0 ? "text-success" : "text-destructive"
//           )}>
//             {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
//           </p>
//           <p className="text-sm text-muted-foreground mt-1">
//             {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
//           </p>
//         </motion.div>

//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5, delay: 0.15 }}
//           className="bg-card rounded-2xl border border-border shadow-card p-6"
//         >
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 rounded-xl bg-success/10">
//               <TrendingUp className="h-5 w-5 text-success" />
//             </div>
//             <span className="text-sm text-muted-foreground">You're Owed</span>
//           </div>
//           <p className="text-3xl font-bold text-foreground">₹{totalOwed.toFixed(2)}</p>
//           <p className="text-sm text-muted-foreground mt-1">
//             From {balances.filter(b => b.amount > 0).length} people
//           </p>
//         </motion.div>

//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="bg-card rounded-2xl border border-border shadow-card p-6"
//         >
//           <div className="flex items-center gap-3 mb-4">
//             <div className="p-2 rounded-xl bg-destructive/10">
//               <TrendingDown className="h-5 w-5 text-destructive" />
//             </div>
//             <span className="text-sm text-muted-foreground">You Owe</span>
//           </div>
//           <p className="text-3xl font-bold text-foreground">₹{totalOwe.toFixed(2)}</p>
//           <p className="text-sm text-muted-foreground mt-1">
//             To {balances.filter(b => b.amount < 0).length} people
//           </p>
//         </motion.div>
//       </div>

//       {/* Outstanding Balances */}
//       {balances.length > 0 && (
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5, delay: 0.25 }}
//           className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
//         >
//           <div className="p-6 border-b border-border">
//             <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
//               <Clock className="h-5 w-5 text-primary" />
//               Outstanding Balances
//             </h2>
//             <p className="text-sm text-muted-foreground mt-1">People you need to settle with</p>
//           </div>
//           <div className="divide-y divide-border">
//             {balances.map((balance, i) => (
//               <motion.div
//                 key={balance.userId}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.3, delay: i * 0.05 }}
//                 className="p-4 hover:bg-muted/50 transition-colors"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <Avatar className="h-12 w-12 border-2 border-border">
//                       <AvatarFallback className="bg-primary/10 text-primary font-semibold">
//                         {balance.userName.split(" ").map(n => n[0]).join("").toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="font-medium text-foreground">{balance.userName}</p>
//                       <p className="text-sm text-muted-foreground">{balance.userEmail}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <div className="text-right">
//                       <p className={cn(
//                         "text-lg font-semibold",
//                         balance.amount > 0 ? "text-success" : "text-destructive"
//                       )}>
//                         {balance.amount > 0 ? "+" : "-"}₹{Math.abs(balance.amount).toFixed(2)}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {balance.amount > 0 ? "owes you" : "you owe"}
//                       </p>
//                     </div>
//                     {balance.amount < 0 && (
//                       <Button 
//                         size="sm" 
//                         onClick={() => handleSettle(balance)}
//                         className="gap-2"
//                       >
//                         <ArrowRightLeft className="h-4 w-4" />
//                         Settle
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       )}

//       {/* Settlement History */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }} 
//         animate={{ opacity: 1, y: 0 }} 
//         transition={{ duration: 0.5, delay: 0.3 }}
//         className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
//       >
//         <div className="p-6 border-b border-border">
//           <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
//             <CheckCircle2 className="h-5 w-5 text-success" />
//             Settlement History
//           </h2>
//           <p className="text-sm text-muted-foreground mt-1">Record of all completed settlements</p>
//         </div>
        
//         {settlements.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-16 text-center">
//             <div className="p-4 rounded-full bg-muted mb-4">
//               <Receipt className="h-8 w-8 text-muted-foreground" />
//             </div>
//             <h3 className="font-medium text-foreground mb-1">No settlements yet</h3>
//             <p className="text-sm text-muted-foreground max-w-sm">
//               When you or your group members settle payments, they'll appear here with all the details
//             </p>
//           </div>
//         ) : (
//           <div className="divide-y divide-border">
//             <AnimatePresence>
//               {settlements.map((settlement, i) => (
//                 <motion.div
//                   key={settlement.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.3, delay: i * 0.05 }}
//                   className={cn(
//                     "p-6 hover:bg-muted/50 transition-colors cursor-pointer",
//                     selectedSettlement?.id === settlement.id && "bg-primary/5"
//                   )}
//                   onClick={() => setSelectedSettlement(
//                     selectedSettlement?.id === settlement.id ? null : settlement
//                   )}
//                 >
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex items-start gap-4 flex-1">
//                       <div className="relative">
//                         <Avatar className="h-12 w-12 border-2 border-success">
//                           <AvatarFallback className="bg-success/10 text-success font-semibold">
//                             {settlement.payer?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-border">
//                           <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
//                         </div>
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <span className="font-medium text-foreground">
//                             {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name || "Unknown"}
//                           </span>
//                           <span className="text-muted-foreground">paid</span>
//                           <span className="font-medium text-foreground">
//                             {settlement.paid_to === user.id ? "You" : settlement.receiver?.full_name || "Unknown"}
//                           </span>
//                         </div>
                        
//                         <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
//                           <span className="flex items-center gap-1">
//                             <Calendar className="h-4 w-4" />
//                             {format(new Date(settlement.settled_at), "MMM d, yyyy 'at' h:mm a")}
//                           </span>
//                           <Badge variant="outline" className="text-xs">
//                             {getGroupName(settlement.group_id)}
//                           </Badge>
//                         </div>

//                         {/* Expanded Details */}
//                         <AnimatePresence>
//                           {selectedSettlement?.id === settlement.id && (
//                             <motion.div
//                               initial={{ opacity: 0, height: 0 }}
//                               animate={{ opacity: 1, height: "auto" }}
//                               exit={{ opacity: 0, height: 0 }}
//                               transition={{ duration: 0.2 }}
//                               className="mt-4 space-y-4"
//                             >
//                               {settlement.notes && (
//                                 <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
//                                   <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
//                                   <div>
//                                     <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
//                                     <p className="text-sm text-foreground">{settlement.notes}</p>
//                                   </div>
//                                 </div>
//                               )}
                              
//                               {settlement.receipt_url && (
//                                 <div className="p-3 rounded-lg bg-muted/50">
//                                   <div className="flex items-center gap-3 mb-3">
//                                     <ImageIcon className="h-4 w-4 text-muted-foreground" />
//                                     <p className="text-xs font-medium text-muted-foreground">Receipt / Proof of Payment</p>
//                                   </div>
//                                   <div className="relative group">
//                                     <img 
//                                       src={settlement.receipt_url} 
//                                       alt="Settlement receipt"
//                                       className="w-full max-w-md rounded-lg border border-border"
//                                     />
//                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
//                                       <Button 
//                                         size="sm" 
//                                         variant="secondary"
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           window.open(settlement.receipt_url!, '_blank');
//                                         }}
//                                       >
//                                         <ExternalLink className="h-4 w-4 mr-1" />
//                                         View Full
//                                       </Button>
//                                       <Button 
//                                         size="sm" 
//                                         variant="secondary"
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           const link = document.createElement('a');
//                                           link.href = settlement.receipt_url!;
//                                           link.download = `receipt-${settlement.id}.jpg`;
//                                           link.click();
//                                         }}
//                                       >
//                                         <Download className="h-4 w-4 mr-1" />
//                                         Download
//                                       </Button>
//                                     </div>
//                                   </div>
//                                 </div>
//                               )}

//                               <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div className="p-3 rounded-lg bg-muted/50">
//                                   <p className="text-xs text-muted-foreground mb-1">From</p>
//                                   <p className="font-medium text-foreground">
//                                     {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name}
//                                   </p>
//                                   <p className="text-xs text-muted-foreground">{settlement.payer?.email}</p>
//                                 </div>
//                                 <div className="p-3 rounded-lg bg-muted/50">
//                                   <p className="text-xs text-muted-foreground mb-1">To</p>
//                                   <p className="font-medium text-foreground">
//                                     {settlement.paid_to === user.id ? "You" : settlement.receiver?.full_name}
//                                   </p>
//                                   <p className="text-xs text-muted-foreground">{settlement.receiver?.email}</p>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           )}
//                         </AnimatePresence>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0">
//                       <p className="text-xl font-bold text-success">₹{Number(settlement.amount).toFixed(2)}</p>
//                       <Badge variant="secondary" className="mt-1 gap-1">
//                         <CheckCircle2 className="h-3 w-3" />
//                         Settled
//                       </Badge>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </motion.div>

//       {/* Settle Modal */}
//       <SettleModal 
//         isOpen={settleOpen} 
//         onClose={() => setSettleOpen(false)} 
//         balance={selectedBalance} 
//         groups={groups} 
//         onSubmit={async (groupId, paidTo, amount, notes) => {
//           const { data: { user } } = await supabase.auth.getUser();
//           if (!user) return;
          
//           await supabase.from("settlements").insert({
//             group_id: groupId,
//             paid_by: user.id,
//             paid_to: paidTo,
//             amount,
//             notes,
//           });
          
//           await calculateBalances();
//         }} 
//       />
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useBalances, Settlement } from "@/hooks/useBalances";
import { useGroups } from "@/hooks/useGroups";
import { SettleModal } from "@/components/balances/SettleModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import  VerseLoading  from "@/components/ui/Verselaoding";
import {
  ArrowRightLeft, 
  Receipt, 
  Calendar, 
  FileText, 
  Download, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Balance } from "@/hooks/useBalances";

export default function Settlements() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

 if (!user || loading) {
     return (
       <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
         <VerseLoading />
       </div>
     );
   }
 

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <SettlementsContent user={user} />
    </DashboardLayout>
  );
}

function SettlementsContent({ user }: { user: User }) {
  const { balances, totalOwed, totalOwe, settlements, loading, calculateBalances } = useBalances();
  const { groups } = useGroups();
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  // Real-time subscription for settlements
  useEffect(() => {
    const channel = supabase
      .channel('settlements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settlements'
        },
        () => {
          calculateBalances();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses'
        },
        () => {
          calculateBalances();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expense_splits'
        },
        () => {
          calculateBalances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [calculateBalances]);

  const handleSettle = (balance: Balance) => {
    setSelectedBalance(balance);
    setSettleOpen(true);
  };

  const handleSettleSubmit = async (groupId: string, paidTo: string, amount: number, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from("settlements").insert({
      group_id: groupId,
      paid_by: user.id,
      paid_to: paidTo,
      amount,
      notes,
    });
    
    await calculateBalances();
  };

  const netBalance = totalOwed - totalOwe;

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || "Unknown Group";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Enhanced Responsive Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Settlements
          </h1>
          <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm font-medium">
            Track and manage all your payment settlements
          </p>
        </div>
      </motion.div>

      {/* Enhanced Summary Cards - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "bg-card rounded-xl border border-border/50 shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all",
            netBalance >= 0 
              ? "bg-gradient-to-br from-teal-500/5 to-emerald-500/5" 
              : "bg-gradient-to-br from-destructive/5 to-transparent"
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className={cn(
              "p-2 sm:p-2.5 rounded-xl",
              netBalance >= 0 ? "bg-teal-500/10" : "bg-destructive/10"
            )}>
              {netBalance >= 0 ? (
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
              ) : (
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Net Balance
            </span>
          </div>
          <p className={cn(
            "text-2xl sm:text-3xl font-bold tracking-tight",
            netBalance >= 0 ? "text-teal-600" : "text-destructive"
          )}>
            {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 font-medium">
            {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-xl border border-border/50 shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all bg-gradient-to-br from-emerald-500/5 to-teal-500/5"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              You're Owed
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            ₹{totalOwed.toFixed(2)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 font-medium">
            From {balances.filter(b => b.amount > 0).length} people
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-xl border border-border/50 shadow-md p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-2.5 rounded-xl bg-destructive/10">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              You Owe
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            ₹{totalOwe.toFixed(2)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 font-medium">
            To {balances.filter(b => b.amount < 0).length} people
          </p>
        </motion.div>
      </div>

      {/* Enhanced Outstanding Balances */}
      {balances.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-card rounded-xl border border-border/50 shadow-lg overflow-hidden"
        >
          <div className="p-4 sm:p-5 lg:p-6 border-b border-teal-500/10 bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
              Outstanding Balances
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">People you need to settle with</p>
          </div>
          <div className="divide-y divide-border/50">
            {balances.map((balance, i) => (
              <motion.div
                key={balance.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-3 sm:p-4 lg:p-5 hover:bg-gradient-to-br hover:from-teal-500/5 hover:to-emerald-500/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-teal-500/20 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-700 font-semibold text-sm sm:text-base">
                        {balance.userName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {balance.userName}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {balance.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className={cn(
                        "text-base sm:text-lg font-bold whitespace-nowrap",
                        balance.amount > 0 ? "text-emerald-600" : "text-destructive"
                      )}>
                        {balance.amount > 0 ? "+" : "-"}₹{Math.abs(balance.amount).toFixed(2)}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">
                        {balance.amount > 0 ? "owes you" : "you owe"}
                      </p>
                    </div>
                    {balance.amount < 0 && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSettle(balance)}
                        className="gap-1.5 sm:gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-xs sm:text-sm rounded-xl"
                      >
                        <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Settle</span>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Settlement History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-card rounded-xl border border-border/50 shadow-lg overflow-hidden"
      >
        <div className="p-4 sm:p-5 lg:p-6 border-b border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Settlement History
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Record of all completed settlements</p>
        </div>
        
        {settlements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="p-4 sm:p-5 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 mb-4">
              <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-teal-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">No settlements yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              When you or your group members settle payments, they'll appear here with all the details
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            <AnimatePresence>
              {settlements.map((settlement, i) => (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={cn(
                    "p-4 sm:p-5 lg:p-6 hover:bg-gradient-to-br hover:from-emerald-500/5 hover:to-teal-500/5 transition-colors cursor-pointer",
                    selectedSettlement?.id === settlement.id && "bg-gradient-to-br from-teal-500/10 to-emerald-500/10"
                  )}
                  onClick={() => setSelectedSettlement(
                    selectedSettlement?.id === settlement.id ? null : settlement
                  )}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4 flex-1 w-full">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-emerald-500/30">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-700 font-semibold text-sm sm:text-base">
                            {settlement.payer?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-teal-500/20">
                          <ArrowRightLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-teal-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-sm sm:text-base">
                          <span className="font-semibold text-foreground">
                            {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name || "Unknown"}
                          </span>
                          <span className="text-muted-foreground text-xs sm:text-sm">paid</span>
                          <span className="font-semibold text-foreground">
                            {settlement.paid_to === user.id ? "You" : settlement.receiver?.full_name || "Unknown"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mt-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            <span className="hidden sm:inline">
                              {format(new Date(settlement.settled_at), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                            <span className="sm:hidden">
                              {format(new Date(settlement.settled_at), "MMM d, yyyy")}
                            </span>
                          </span>
                          <Badge variant="outline" className="text-[9px] sm:text-xs border-teal-500/20">
                            {getGroupName(settlement.group_id)}
                          </Badge>
                        </div>

                        {/* Enhanced Expanded Details */}
                        <AnimatePresence>
                          {selectedSettlement?.id === settlement.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 sm:mt-4 space-y-3 sm:space-y-4"
                            >
                              {settlement.notes && (
                                <div className="flex items-start gap-2 sm:gap-3 p-3 rounded-lg bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-teal-500/10">
                                  <FileText className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Notes</p>
                                    <p className="text-xs sm:text-sm text-foreground break-words">{settlement.notes}</p>
                                  </div>
                                </div>
                              )}
                              
                              {settlement.receipt_url && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                                    <ImageIcon className="h-4 w-4 text-emerald-600" />
                                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                                      Receipt / Proof of Payment
                                    </p>
                                  </div>
                                  <div className="relative group">
                                    <img 
                                      src={settlement.receipt_url} 
                                      alt="Settlement receipt"
                                      className="w-full max-w-md rounded-lg border border-teal-500/20"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="secondary"
                                        className="text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(settlement.receipt_url!, '_blank');
                                        }}
                                      >
                                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        View
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="secondary"
                                        className="text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const link = document.createElement('a');
                                          link.href = settlement.receipt_url!;
                                          link.download = `receipt-${settlement.id}.jpg`;
                                          link.click();
                                        }}
                                      >
                                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-teal-500/10">
                                  <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold mb-1">From</p>
                                  <p className="font-semibold text-foreground truncate">
                                    {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {settlement.payer?.email}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                                  <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold mb-1">To</p>
                                  <p className="font-semibold text-foreground truncate">
                                    {settlement.paid_to === user.id ? "You" : settlement.receiver?.full_name}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {settlement.receiver?.email}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="text-right shrink-0 self-start sm:self-center">
                      <p className="text-lg sm:text-xl font-bold text-emerald-600 whitespace-nowrap">
                        ₹{Number(settlement.amount).toFixed(2)}
                      </p>
                      <Badge variant="secondary" className="mt-1 gap-1 text-[9px] sm:text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                        <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Settled
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Settle Modal */}
      <SettleModal 
        isOpen={settleOpen} 
        onClose={() => setSettleOpen(false)} 
        balance={selectedBalance} 
        groups={groups} 
        onSubmit={handleSettleSubmit} 
      />
    </div>
  );
}