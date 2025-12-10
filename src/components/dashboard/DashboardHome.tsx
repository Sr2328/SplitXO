import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Receipt,
  Plus,
  Calendar,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGroups, GroupMember } from "@/hooks/useGroups";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalances, Balance } from "@/hooks/useBalances";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { GroupCard } from "@/components/groups/GroupCard";
import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { BalanceCard } from "@/components/balances/BalanceCard";
import { SettleModal } from "@/components/balances/SettleModal";
import { Group } from "@/hooks/useGroups";

interface DashboardHomeProps {
  user: User;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const userName = user.user_metadata?.full_name?.split(" ")[0] || "there";
  
  const { groups, createGroup, updateGroup, deleteGroup, getGroupMembers, addMemberByEmail, removeMember } = useGroups();
  const { expenses, createExpense, deleteExpense } = useExpenses();
  const { balances, totalOwed, totalOwe, createSettlement, calculateBalances } = useBalances();
  
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  const handleManageMembers = (group: Group) => {
    setSelectedGroup(group);
    setManageMembersOpen(true);
  };

  const refreshMembers = async () => {
    if (selectedGroup) {
      const members = await getGroupMembers(selectedGroup.id);
      setGroupMembers(members);
    }
  };

  const handleSettle = (balance: Balance) => {
    setSelectedBalance(balance);
    setSettleOpen(true);
  };

  const handleSettleSubmit = async (groupId: string, paidTo: string, amount: number, notes?: string) => {
    await createSettlement(groupId, paidTo, amount, notes);
    await calculateBalances();
  };

  const netBalance = totalOwed - totalOwe;

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Enhanced Header with gradient card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[2rem] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-5 sm:p-7 md:p-9 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-emerald-50 text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-medium tracking-wide">WELCOME BACK</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight truncate">{userName}</h1>
            </div>
            <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg flex-shrink-0">
              <IndianRupee className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9" />
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <p className="text-emerald-50/80 text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-widest">BALANCE AMOUNT</p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight break-words">
              ₹{Math.abs(netBalance).toFixed(2)}
            </p>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <div className={cn(
                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0",
                netBalance >= 0 ? "bg-green-400" : "bg-amber-400"
              )} />
              <p className="text-emerald-50 text-[10px] sm:text-xs font-medium whitespace-nowrap">
                {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced decorative circles */}
        <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full -mr-24 sm:-mr-36 -mt-24 sm:-mt-36 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-36 sm:w-56 h-36 sm:h-56 bg-white/10 rounded-full -ml-18 sm:-ml-28 -mb-18 sm:-mb-28 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Enhanced Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
        <StatCard 
          title="You Owe" 
          value={`₹${totalOwe.toFixed(2)}`} 
          subtitle={`${balances.filter(b => b.amount < 0).length} people`} 
          icon={ArrowUpRight} 
          trend="negative" 
          delay={0} 
        />
        <StatCard 
          title="You're Owed" 
          value={`₹${totalOwed.toFixed(2)}`} 
          subtitle={`${balances.filter(b => b.amount > 0).length} people`} 
          icon={ArrowDownRight} 
          trend="positive" 
          delay={0.1} 
        />
        <StatCard 
          title="Active Groups" 
          value={String(groups.length)} 
          subtitle={`Group${groups.length !== 1 ? "s" : ""}`} 
          icon={Users} 
          trend="neutral" 
          delay={0.2} 
        />
        <StatCard 
          title="Expenses" 
          value={String(expenses.length)} 
          subtitle="This month" 
          icon={Receipt} 
          trend="neutral" 
          delay={0.3} 
        />
      </div>

      {/* Enhanced Balances Section */}
      {balances.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.35 }} 
          className="bg-card rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-border/50 shadow-lg p-4 sm:p-6 md:p-7"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">Your Balances</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Settle up with friends</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs font-medium hover:bg-muted/50 rounded-xl flex-shrink-0 h-8 sm:h-9 px-2 sm:px-3">View All</Button>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {balances.slice(0, 5).map((balance, i) => (
              <BalanceCard 
                key={balance.userId} 
                balance={balance} 
                onSettle={handleSettle} 
                delay={i * 0.05} 
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Enhanced Recent Expenses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.4 }} 
          className="bg-card rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-border/50 shadow-lg p-4 sm:p-6 md:p-7"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">Recent Expenses</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Last transactions</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setAddExpenseOpen(true)}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl hover:bg-muted/50 transition-all hover:scale-105 flex-shrink-0"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/50 mb-4 sm:mb-5">
                <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1.5 sm:mb-2">No expenses yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6 max-w-[250px]">Start tracking by adding your first expense</p>
              <Button size="sm" onClick={() => setAddExpenseOpen(true)} className="rounded-xl shadow-sm text-xs sm:text-sm h-9 sm:h-10">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Add Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {expenses.slice(0, 5).map((expense, i) => (
                <ExpenseCard key={expense.id} expense={expense} currentUserId={user.id} onDelete={(id) => deleteExpense(id)} delay={i * 0.05} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Enhanced Your Groups */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.45 }} 
          className="bg-card rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-border/50 shadow-lg p-4 sm:p-6 md:p-7"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">Your Groups</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Manage your groups</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setCreateGroupOpen(true)}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl hover:bg-muted/50 transition-all hover:scale-105 flex-shrink-0"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/50 mb-4 sm:mb-5">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1.5 sm:mb-2">No groups yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6 max-w-[250px]">Create a group to start splitting expenses</p>
              <Button size="sm" onClick={() => setCreateGroupOpen(true)} className="rounded-xl shadow-sm text-xs sm:text-sm h-9 sm:h-10">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />Create Group
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {groups.slice(0, 4).map((group, i) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  onEdit={() => {}} 
                  onDelete={(g) => deleteGroup(g.id)} 
                  onManageMembers={handleManageMembers} 
                  onClick={() => {}} 
                  delay={i * 0.05} 
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CreateGroupModal 
        isOpen={createGroupOpen} 
        onClose={() => setCreateGroupOpen(false)} 
        onSubmit={createGroup} 
      />
      <AddExpenseModal 
        isOpen={addExpenseOpen} 
        onClose={() => setAddExpenseOpen(false)} 
        groups={groups} 
        onSubmit={createExpense} 
        getGroupMembers={getGroupMembers} 
        currentUserId={user.id} 
        onCreateGroup={() => { 
          setAddExpenseOpen(false); 
          setCreateGroupOpen(true); 
        }} 
      />
      <ManageMembersModal 
        isOpen={manageMembersOpen} 
        onClose={() => setManageMembersOpen(false)} 
        group={selectedGroup} 
        members={groupMembers} 
        onAddMember={(email) => addMemberByEmail(selectedGroup!.id, email)} 
        onRemoveMember={(userId) => removeMember(selectedGroup!.id, userId)} 
        onRefresh={refreshMembers} 
        currentUserId={user.id} 
      />
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

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  delay 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ElementType; 
  trend: "positive" | "negative" | "neutral"; 
  delay: number; 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay }} 
      className="bg-card rounded-xl sm:rounded-2xl border border-border/50 shadow-md p-3.5 sm:p-5 hover:shadow-lg transition-all duration-300 group hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={cn(
          "p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300",
          trend === "positive" && "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
          trend === "negative" && "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
          trend === "neutral" && "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
        )}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </div>
      </div>
      <p className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-muted-foreground mb-1.5 sm:mb-2 tracking-wide uppercase truncate">{title}</p>
      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 sm:mb-1 tracking-tight break-words line-clamp-1">{value}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{subtitle}</p>
    </motion.div>
  );
}