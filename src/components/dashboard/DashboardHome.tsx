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
  Menu,
  Grid3x3,
  Clock,
  ChevronRight,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 md:px-6 py-4 mb-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <Grid3x3 className="w-5 h-5 text-gray-700" />
            </motion.button>
            <div>
              <p className="text-xs text-gray-500">Welcome back</p>
              <h1 className="text-lg font-semibold text-gray-900">{userName}</h1>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm">Active</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6h.01M12 12h.01M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            <div className="mb-2">
              <p className="text-white/70 text-sm mb-1">Net Balance</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-1">
                ₹{Math.abs(netBalance).toFixed(2)}
              </h2>
              <p className="text-white/80 text-sm">
                {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <p className="text-white/70 text-xs mb-1">Expenses</p>
                <p className="text-white font-semibold">{expenses.length}</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <p className="text-white/70 text-xs mb-1">Groups</p>
                <p className="text-white font-semibold">{groups.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="You Owe"
            value={`₹${totalOwe.toFixed(2)}`}
            subtitle={`${balances.filter(b => b.amount < 0).length} people`}
            icon={ArrowUpRight}
            trend="negative"
            delay={0.1}
          />
          <StatCard
            title="You're Owed"
            value={`₹${totalOwed.toFixed(2)}`}
            subtitle={`${balances.filter(b => b.amount > 0).length} people`}
            icon={ArrowDownRight}
            trend="positive"
            delay={0.2}
          />
          <StatCard
            title="Total Groups"
            value={String(groups.length)}
            subtitle={groups.length === 0 ? "No groups" : `Active`}
            icon={Users}
            trend="neutral"
            delay={0.3}
            className="col-span-2 lg:col-span-1"
          />
          <StatCard
            title="Expenses"
            value={String(expenses.length)}
            subtitle="This month"
            icon={Receipt}
            trend="neutral"
            delay={0.4}
            className="col-span-2 lg:col-span-1"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                  <p className="text-sm text-gray-500 mt-0.5">This Month</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setAddExpenseOpen(true)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="p-6">
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">No expenses yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Start tracking your expenses</p>
                  <Button size="sm" onClick={() => setAddExpenseOpen(true)} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {expenses.slice(0, 5).map((expense, i) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ExpenseCard
                        expense={expense}
                        currentUserId={user.id}
                        onDelete={(exp) => deleteExpense(exp.id)}
                        delay={i * 0.05}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Balances Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Your Balances</h2>
              <p className="text-sm text-gray-500 mt-0.5">Current status</p>
            </div>

            <div className="p-6">
              {balances.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No balances to show</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {balances.slice(0, 5).map((balance, i) => (
                    <motion.div
                      key={balance.userId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <BalanceCard
                        balance={balance}
                        onSettle={handleSettle}
                        delay={i * 0.05}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Groups Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage your expense groups</p>
              </div>
              <Button
                size="sm"
                onClick={() => setCreateGroupOpen(true)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>

          <div className="p-6">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">No groups yet</h3>
                <p className="text-sm text-gray-500 mb-4">Create a group to start splitting</p>
                <Button size="sm" onClick={() => setCreateGroupOpen(true)} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Group
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.slice(0, 6).map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GroupCard
                      group={group}
                      onEdit={() => {}}
                      onDelete={(g) => deleteGroup(g.id)}
                      onManageMembers={handleManageMembers}
                      onClick={() => {}}
                      delay={i * 0.05}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
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
  delay,
  className = ""
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend: "positive" | "negative" | "neutral";
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            trend === "positive" && "bg-green-100",
            trend === "negative" && "bg-red-100",
            trend === "neutral" && "bg-blue-100"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              trend === "positive" && "text-green-600",
              trend === "negative" && "text-red-600",
              trend === "neutral" && "text-blue-600"
            )}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </motion.div>
  );
}