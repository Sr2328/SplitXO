import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Receipt,
  Plus,
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
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your expenses</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Net Balance" value={`₹${Math.abs(netBalance).toFixed(2)}`} subtitle={netBalance >= 0 ? "You're owed overall" : "You owe overall"} icon={TrendingUp} trend={netBalance >= 0 ? "positive" : "negative"} delay={0} />
        <StatCard title="You Owe" value={`₹${totalOwe.toFixed(2)}`} subtitle={`To ${balances.filter(b => b.amount < 0).length} people`} icon={ArrowUpRight} trend="negative" delay={0.1} />
        <StatCard title="You're Owed" value={`₹${totalOwed.toFixed(2)}`} subtitle={`From ${balances.filter(b => b.amount > 0).length} people`} icon={ArrowDownRight} trend="positive" delay={0.2} />
        <StatCard title="Active Groups" value={String(groups.length)} subtitle={groups.length === 0 ? "Create your first group" : `${groups.length} group${groups.length > 1 ? "s" : ""}`} icon={Users} trend="neutral" delay={0.3} />
      </div>

      {/* Balances */}
      {balances.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Balances</h2>
          <div className="space-y-3">
            {balances.slice(0, 5).map((balance, i) => (
              <BalanceCard key={balance.userId} balance={balance} onSettle={handleSettle} delay={i * 0.05} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent expenses */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Expenses</h2>
          </div>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4"><Receipt className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="font-medium text-foreground mb-1">No expenses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start tracking by adding your first expense</p>
              <Button size="sm" onClick={() => setAddExpenseOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Expense</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense, i) => (
                <ExpenseCard key={expense.id} expense={expense} currentUserId={user.id} onDelete={(exp) => deleteExpense(exp.id)} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>

        {/* Your groups */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Your Groups</h2>
          </div>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4"><Users className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="font-medium text-foreground mb-1">No groups yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create a group to start splitting expenses</p>
              <Button size="sm" onClick={() => setCreateGroupOpen(true)}><Plus className="h-4 w-4 mr-1" />Create Group</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups.slice(0, 4).map((group, i) => (
                <GroupCard key={group.id} group={group} onEdit={() => {}} onDelete={(g) => deleteGroup(g.id)} onManageMembers={handleManageMembers} onClick={() => {}} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <CreateGroupModal isOpen={createGroupOpen} onClose={() => setCreateGroupOpen(false)} onSubmit={createGroup} />
      <AddExpenseModal isOpen={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} groups={groups} onSubmit={createExpense} getGroupMembers={getGroupMembers} currentUserId={user.id} onCreateGroup={() => { setAddExpenseOpen(false); setCreateGroupOpen(true); }} />
      <ManageMembersModal isOpen={manageMembersOpen} onClose={() => setManageMembersOpen(false)} group={selectedGroup} members={groupMembers} onAddMember={(email) => addMemberByEmail(selectedGroup!.id, email)} onRemoveMember={(userId) => removeMember(selectedGroup!.id, userId)} onRefresh={refreshMembers} currentUserId={user.id} />
      <SettleModal isOpen={settleOpen} onClose={() => setSettleOpen(false)} balance={selectedBalance} groups={groups} onSubmit={handleSettleSubmit} />
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, trend, delay }: { title: string; value: string; subtitle: string; icon: React.ElementType; trend: "positive" | "negative" | "neutral"; delay: number; }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }} className="bg-card rounded-2xl border border-border shadow-card p-6 hover:shadow-elevated transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-xl", trend === "positive" && "bg-success/10", trend === "negative" && "bg-destructive/10", trend === "neutral" && "bg-primary/10")}>
          <Icon className={cn("h-5 w-5", trend === "positive" && "text-success", trend === "negative" && "text-destructive", trend === "neutral" && "text-primary")} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </motion.div>
  );
}
