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
import { 
  ArrowRightLeft, 
  Receipt, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  Download, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Image as ImageIcon
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
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
    const { createSettlement } = useBalances();
  };

  const netBalance = totalOwed - totalOwe;

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || "Unknown Group";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settlements</h1>
          <p className="text-muted-foreground mt-1">Track and manage all your payment settlements</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "bg-card rounded-2xl border border-border shadow-card p-6",
            netBalance >= 0 ? "bg-gradient-to-br from-success/5 to-transparent" : "bg-gradient-to-br from-destructive/5 to-transparent"
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-2 rounded-xl",
              netBalance >= 0 ? "bg-success/10" : "bg-destructive/10"
            )}>
              {netBalance >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">Net Balance</span>
          </div>
          <p className={cn(
            "text-3xl font-bold",
            netBalance >= 0 ? "text-success" : "text-destructive"
          )}>
            {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl border border-border shadow-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">You're Owed</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹{totalOwed.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            From {balances.filter(b => b.amount > 0).length} people
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl border border-border shadow-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">You Owe</span>
          </div>
          <p className="text-3xl font-bold text-foreground">₹{totalOwe.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            To {balances.filter(b => b.amount < 0).length} people
          </p>
        </motion.div>
      </div>

      {/* Outstanding Balances */}
      {balances.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Outstanding Balances
            </h2>
            <p className="text-sm text-muted-foreground mt-1">People you need to settle with</p>
          </div>
          <div className="divide-y divide-border">
            {balances.map((balance, i) => (
              <motion.div
                key={balance.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {balance.userName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{balance.userName}</p>
                      <p className="text-sm text-muted-foreground">{balance.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-semibold",
                        balance.amount > 0 ? "text-success" : "text-destructive"
                      )}>
                        {balance.amount > 0 ? "+" : "-"}₹{Math.abs(balance.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {balance.amount > 0 ? "owes you" : "you owe"}
                      </p>
                    </div>
                    {balance.amount < 0 && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSettle(balance)}
                        className="gap-2"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                        Settle
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settlement History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Settlement History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Record of all completed settlements</p>
        </div>
        
        {settlements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No settlements yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              When you or your group members settle payments, they'll appear here with all the details
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence>
              {settlements.map((settlement, i) => (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={cn(
                    "p-6 hover:bg-muted/50 transition-colors cursor-pointer",
                    selectedSettlement?.id === settlement.id && "bg-primary/5"
                  )}
                  onClick={() => setSelectedSettlement(
                    selectedSettlement?.id === settlement.id ? null : settlement
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-success">
                          <AvatarFallback className="bg-success/10 text-success font-semibold">
                            {settlement.payer?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-border">
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground">
                            {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name || "Unknown"}
                          </span>
                          <span className="text-muted-foreground">paid</span>
                          <span className="font-medium text-foreground">
                            {settlement.paid_to === user.id ? "You" : settlement.receiver?.full_name || "Unknown"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(settlement.settled_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getGroupName(settlement.group_id)}
                          </Badge>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {selectedSettlement?.id === settlement.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-4 space-y-4"
                            >
                              {settlement.notes && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm text-foreground">{settlement.notes}</p>
                                  </div>
                                </div>
                              )}
                              
                              {settlement.receipt_url && (
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <div className="flex items-center gap-3 mb-3">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs font-medium text-muted-foreground">Receipt / Proof of Payment</p>
                                  </div>
                                  <div className="relative group">
                                    <img 
                                      src={settlement.receipt_url} 
                                      alt="Settlement receipt"
                                      className="w-full max-w-md rounded-lg border border-border"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(settlement.receipt_url!, '_blank');
                                        }}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View Full
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const link = document.createElement('a');
                                          link.href = settlement.receipt_url!;
                                          link.download = `receipt-${settlement.id}.jpg`;
                                          link.click();
                                        }}
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground mb-1">From</p>
                                  <p className="font-medium text-foreground">
                                    {settlement.paid_by === user.id ? "You" : settlement.payer?.full_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{settlement.payer?.email}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs text-muted-foreground mb-1">To</p>
                                  <p className="font-medium text-foreground">
                                    {settlement.paid_to === user.id ? "You" : settlement.receiver?.full_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{settlement.receiver?.email}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-success">₹{Number(settlement.amount).toFixed(2)}</p>
                      <Badge variant="secondary" className="mt-1 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
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
        onSubmit={async (groupId, paidTo, amount, notes) => {
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
        }} 
      />
    </div>
  );
}