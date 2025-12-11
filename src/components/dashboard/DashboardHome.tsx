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
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Enhanced Header with gradient card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-7 md:p-9 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-emerald-50 text-xs md:text-sm mb-2 font-medium tracking-wide">WELCOME BACK</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{userName}</h1>
            </div>
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              <IndianRupee className="h-7 w-7 md:h-9 md:w-9" />
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-emerald-50/80 text-[10px] md:text-xs font-semibold tracking-widest">BALANCE AMOUNT</p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">₹{Math.abs(netBalance).toFixed(2)}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <div className={cn(
                "w-2 h-2 rounded-full",
                netBalance >= 0 ? "bg-green-400" : "bg-amber-400"
              )} />
              <p className="text-emerald-50 text-xs font-medium">
                {netBalance >= 0 ? "You're owed overall" : "You owe overall"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Enhanced decorative circles */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full -ml-28 -mb-28 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </motion.div>

      {/* Enhanced Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
          className="bg-card rounded-[1rem] border border-border/50 shadow-lg p-6 md:p-7"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Your Balances</h2>
              <p className="text-xs text-muted-foreground mt-1">Settle up with friends</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-medium hover:bg-muted/50 rounded-xl">View All</Button>
          </div>
          <div className="space-y-3">
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
    <>
  {/* Enhanced Recent Expenses */}
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5, delay: 0.4 }} 
    className="bg-card rounded-2xl border border-border/50 shadow-lg p-6 mb-6"
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Recent Expenses</h2>
        <p className="text-xs text-muted-foreground mt-1">Last transactions</p>
      </div>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={() => setAddExpenseOpen(true)}
        className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50 transition-all hover:scale-105"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
    
    {expenses.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-2xl bg-muted/50 mb-4">
          <Receipt className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">No expenses yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">Start tracking by adding your first expense</p>
        <Button size="sm" onClick={() => setAddExpenseOpen(true)} className="rounded-xl shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
    ) : (
      <div className="space-y-3">
        {expenses.slice(0, 5).map((expense, i) => (
          <ExpenseCard 
            key={expense.id} 
            expense={expense} 
            currentUserId={user.id} 
            onDelete={(id) => deleteExpense(id)} 
            delay={i * 0.05} 
          />
        ))}
      </div>
    )}
  </motion.div>

  {/* Enhanced Your Groups */}
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5, delay: 0.45 }} 
    className="bg-card rounded-2xl border border-border/50 shadow-lg p-6"
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Your Groups</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage your groups</p>
      </div>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={() => setCreateGroupOpen(true)}
        className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50 transition-all hover:scale-105"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
    
    {groups.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-2xl bg-muted/50 mb-4">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">No groups yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">Create a group to start splitting expenses</p>
        <Button size="sm" onClick={() => setCreateGroupOpen(true)} className="rounded-xl shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
</>

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
      className="bg-card rounded-2xl border border-border/50 shadow-md p-5 hover:shadow-lg transition-all duration-300 group hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-xl transition-all duration-300",
          trend === "positive" && "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
          trend === "negative" && "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
          trend === "neutral" && "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
        )}>
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>
      </div>
      <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-2 tracking-wide uppercase">{title}</p>
      <p className="text-2xl md:text-3xl font-bold text-foreground mb-1 tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
    </motion.div>
  );
}






//  NEW DASHBOARD CODE COMPONENT


// import { useState } from "react";
// import { motion } from "framer-motion";
// import { User } from "@supabase/supabase-js";
// import {
//   TrendingUp,
//   ArrowUpRight,
//   ArrowDownRight,
//   Users,
//   Receipt,
//   Plus,
//   Calendar,
//   DollarSign,
//   IndianRupee,
//   Clock,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { useGroups, GroupMember } from "@/hooks/useGroups";
// import { useExpenses } from "@/hooks/useExpenses";
// import { useBalances, Balance } from "@/hooks/useBalances";
// import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
// import { GroupCard } from "@/components/groups/GroupCard";
// import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
// import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
// import { ExpenseCard } from "@/components/expenses/ExpenseCard";
// import { BalanceCard } from "@/components/balances/BalanceCard";
// import { SettleModal } from "@/components/balances/SettleModal";
// import { Group } from "@/hooks/useGroups";

// interface DashboardHomeProps {
//   user: User;
// }

// export function DashboardHome({ user }: DashboardHomeProps) {
//   const userName = user.user_metadata?.full_name?.split(" ")[0] || "there";
  
//   const { groups, createGroup, updateGroup, deleteGroup, getGroupMembers, addMemberByEmail, removeMember } = useGroups();
//   const { expenses, createExpense, deleteExpense } = useExpenses();
//   const { balances, totalOwed, totalOwe, createSettlement, calculateBalances } = useBalances();

//   const [createGroupOpen, setCreateGroupOpen] = useState(false);
//   const [addExpenseOpen, setAddExpenseOpen] = useState(false);
//   const [manageMembersOpen, setManageMembersOpen] = useState(false);
//   const [settleOpen, setSettleOpen] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//   const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
//   const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

//   const handleManageMembers = (group: Group) => {
//     setSelectedGroup(group);
//     setManageMembersOpen(true);
//   };

//   const refreshMembers = async () => {
//     if (selectedGroup) {
//       const members = await getGroupMembers(selectedGroup.id);
//       setGroupMembers(members);
//     }
//   };

//   const handleSettle = (balance: Balance) => {
//     setSelectedBalance(balance);
//     setSettleOpen(true);
//   };

//   const handleSettleSubmit = async (groupId: string, paidTo: string, amount: number, notes?: string) => {
//     await createSettlement(groupId, paidTo, amount, notes);
//     await calculateBalances();
//   };

//   const netBalance = totalOwed - totalOwe;
//   const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
//       {/* Left Main Content Area */}
//       <div className="flex-1 space-y-6">
//         {/* Welcome Header */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5 }}
//         >
//           <div className="flex items-center justify-between mb-2">
//             <h1 className="text-3xl md:text-4xl font-bold text-foreground">Hello, {userName}!</h1>
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Calendar className="h-4 w-4" />
//               <span className="hidden sm:inline">{currentDate}</span>
//             </div>
//           </div>
//           <p className="text-muted-foreground">Have a great day managing your expenses!</p>
//         </motion.div>

//         {/* Stats Cards Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <StatCard 
//             title="You Owe" 
//             value={totalOwe.toFixed(0)}
//             subtitle={`${balances.filter(b => b.amount < 0).length} people`} 
//             icon={ArrowUpRight} 
//             color="purple"
//             delay={0} 
//           />
//           <StatCard 
//             title="You're Owed" 
//             value={totalOwed.toFixed(0)}
//             subtitle={`${balances.filter(b => b.amount > 0).length} people`} 
//             icon={ArrowDownRight} 
//             color="green"
//             delay={0.1} 
//           />
//           <StatCard 
//             title="Finance" 
//             value={(totalOwed - totalOwe).toFixed(0)}
//             subtitle="Net Balance" 
//             icon={DollarSign} 
//             color="orange"
//             change="5.5% vs last month"
//             delay={0.2} 
//           />
//         </div>

//         {/* Recent Activity Section */}
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }} 
//           animate={{ opacity: 1, y: 0 }} 
//           transition={{ duration: 0.5, delay: 0.25 }} 
//           className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100"
//         >
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-foreground">Recent Goods Sales</h3>
//             <span className="text-xs text-muted-foreground">10 Dec</span>
//           </div>
//           <p className="text-sm text-muted-foreground mb-4">
//             You have sold <span className="font-semibold text-emerald-600">{expenses.length} products</span> this month.
//           </p>
//           <div className="h-32 flex items-end justify-between gap-2">
//             {/* Simple bar chart visualization */}
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '40%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '60%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '50%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '80%' }}></div>
//             <div className="flex-1 bg-emerald-200/50 rounded-t-lg" style={{ height: '70%' }}></div>
//             <div className="flex-1 bg-emerald-500 rounded-t-lg relative" style={{ height: '100%' }}>
//               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-white text-xs px-2 py-1 rounded">
//                 32
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Quick Actions Grid */}
//         <div className="grid grid-cols-2 gap-4">
//           <ActionCard 
//             title="Create Appointment" 
//             icon={Calendar}
//             onClick={() => setAddExpenseOpen(true)}
//             delay={0.3}
//           />
//           <ActionCard 
//             title="Create Counter Sale" 
//             icon={Receipt}
//             onClick={() => setAddExpenseOpen(true)}
//             delay={0.35}
//           />
//           <ActionCard 
//             title="Create New Patient" 
//             icon={Users}
//             onClick={() => setCreateGroupOpen(true)}
//             delay={0.4}
//           />
//           <ActionCard 
//             title="Generate Monthly Report" 
//             icon={TrendingUp}
//             onClick={() => {}}
//             delay={0.45}
//           />
//         </div>

//         {/* Your Balances */}
//         {balances.length > 0 && (
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             transition={{ duration: 0.5, delay: 0.5 }} 
//             className="bg-white rounded-2xl border border-border/50 shadow-sm p-6"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-foreground">Your Balances</h2>
//               <Button variant="ghost" size="sm" className="text-xs">View All</Button>
//             </div>
//             <div className="space-y-3">
//               {balances.slice(0, 4).map((balance, i) => (
//                 <BalanceCard 
//                   key={balance.userId} 
//                   balance={balance} 
//                   onSettle={handleSettle} 
//                   delay={i * 0.05} 
//                 />
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </div>

//       {/* Right Sidebar - Schedule/Timeline */}
//       <div className="lg:w-[380px] space-y-6">
//         {/* Date Header */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex items-center justify-between"
//         >
//           <h2 className="text-lg font-semibold text-foreground">Today, 12 Dec.</h2>
//           <div className="text-xs text-muted-foreground">8:00 am</div>
//         </motion.div>

//         {/* Timeline of Expenses */}
//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="space-y-3"
//         >
//           {expenses.length === 0 ? (
//             <div className="bg-white rounded-2xl border border-border/50 p-8 text-center">
//               <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
//               <h3 className="font-semibold text-foreground mb-2">No expenses yet</h3>
//               <p className="text-sm text-muted-foreground mb-4">Start by adding your first expense</p>
//               <Button size="sm" onClick={() => setAddExpenseOpen(true)} className="rounded-xl">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Expense
//               </Button>
//             </div>
//           ) : (
//             expenses.slice(0, 6).map((expense, i) => (
//               <TimelineExpenseCard 
//                 key={expense.id} 
//                 expense={expense} 
//                 currentUserId={user.id}
//                 onDelete={(id) => deleteExpense(id)}
//                 delay={i * 0.05} 
//               />
//             ))
//           )}
//         </motion.div>

//         {/* Groups Section */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="bg-white rounded-2xl border border-border/50 shadow-sm p-5"
//         >
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-foreground">Your Groups</h3>
//             <Button 
//               variant="ghost" 
//               size="icon"
//               className="h-8 w-8 rounded-full"
//               onClick={() => setCreateGroupOpen(true)}
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//           {groups.length === 0 ? (
//             <div className="text-center py-6">
//               <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
//               <p className="text-sm text-muted-foreground mb-3">No groups yet</p>
//               <Button size="sm" variant="outline" onClick={() => setCreateGroupOpen(true)} className="rounded-xl">
//                 Create Group
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {groups.slice(0, 4).map((group, i) => (
//                 <CompactGroupCard 
//                   key={group.id} 
//                   group={group}
//                   onManageMembers={handleManageMembers}
//                   delay={i * 0.05}
//                 />
//               ))}
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Modals */}
//       <CreateGroupModal 
//         isOpen={createGroupOpen} 
//         onClose={() => setCreateGroupOpen(false)} 
//         onSubmit={createGroup} 
//       />
//       <AddExpenseModal 
//         isOpen={addExpenseOpen} 
//         onClose={() => setAddExpenseOpen(false)} 
//         groups={groups} 
//         onSubmit={createExpense} 
//         getGroupMembers={getGroupMembers} 
//         currentUserId={user.id} 
//         onCreateGroup={() => { 
//           setAddExpenseOpen(false); 
//           setCreateGroupOpen(true); 
//         }} 
//       />
//       <ManageMembersModal 
//         isOpen={manageMembersOpen} 
//         onClose={() => setManageMembersOpen(false)} 
//         group={selectedGroup} 
//         members={groupMembers} 
//         onAddMember={(email) => addMemberByEmail(selectedGroup!.id, email)} 
//         onRemoveMember={(userId) => removeMember(selectedGroup!.id, userId)} 
//         onRefresh={refreshMembers} 
//         currentUserId={user.id} 
//       />
//       <SettleModal 
//         isOpen={settleOpen} 
//         onClose={() => setSettleOpen(false)} 
//         balance={selectedBalance} 
//         groups={groups} 
//         onSubmit={handleSettleSubmit} 
//       />
//     </div>
//   );
// }

// function StatCard({ 
//   title, 
//   value, 
//   subtitle, 
//   icon: Icon, 
//   color,
//   change,
//   delay 
// }: { 
//   title: string; 
//   value: string; 
//   subtitle: string; 
//   icon: React.ElementType; 
//   color: "purple" | "green" | "orange";
//   change?: string;
//   delay: number; 
// }) {
//   const colorStyles = {
//     purple: "bg-purple-50 border-purple-100",
//     green: "bg-emerald-50 border-emerald-100",
//     orange: "bg-orange-50 border-orange-100"
//   };

//   const iconStyles = {
//     purple: "text-purple-600",
//     green: "text-emerald-600",
//     orange: "text-orange-600"
//   };

//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }} 
//       animate={{ opacity: 1, y: 0 }} 
//       transition={{ duration: 0.5, delay }} 
//       className={cn("rounded-2xl border p-5", colorStyles[color])}
//     >
//       <div className="flex items-start justify-between mb-3">
//         <Icon className={cn("h-5 w-5", iconStyles[color])} />
//       </div>
//       <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
//       <p className="text-3xl font-bold text-foreground mb-1">
//         {value}
//         <span className="text-lg ml-1">₹</span>
//       </p>
//       <p className="text-xs text-muted-foreground">{subtitle}</p>
//       {change && (
//         <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
//           <TrendingUp className="h-3 w-3" />
//           {change}
//         </p>
//       )}
//     </motion.div>
//   );
// }

// function ActionCard({ 
//   title, 
//   icon: Icon, 
//   onClick,
//   delay 
// }: { 
//   title: string; 
//   icon: React.ElementType; 
//   onClick: () => void;
//   delay: number;
// }) {
//   return (
//     <motion.button
//       initial={{ opacity: 0, scale: 0.9 }} 
//       animate={{ opacity: 1, scale: 1 }} 
//       transition={{ duration: 0.5, delay }}
//       onClick={onClick}
//       className="bg-teal-500 hover:bg-teal-600 text-white rounded-2xl p-6 text-left transition-all hover:scale-105 hover:shadow-lg group"
//     >
//       <div className="bg-white/20 rounded-xl p-3 w-fit mb-4 group-hover:bg-white/30 transition-colors">
//         <Icon className="h-6 w-6" />
//       </div>
//       <h3 className="font-semibold text-sm leading-tight">{title}</h3>
//     </motion.button>
//   );
// }

// function TimelineExpenseCard({ 
//   expense, 
//   currentUserId,
//   onDelete,
//   delay 
// }: { 
//   expense: any; 
//   currentUserId: string;
//   onDelete: (id: string) => void;
//   delay: number;
// }) {
//   const colors = ["rose", "emerald", "blue", "purple", "orange"];
//   const color = colors[Math.floor(Math.random() * colors.length)];
  
//   const bgColors = {
//     rose: "bg-rose-50 border-rose-100",
//     emerald: "bg-emerald-50 border-emerald-100",
//     blue: "bg-blue-50 border-blue-100",
//     purple: "bg-purple-50 border-purple-100",
//     orange: "bg-orange-50 border-orange-100"
//   };

//   const iconColors = {
//     rose: "bg-rose-500",
//     emerald: "bg-emerald-500",
//     blue: "bg-blue-500",
//     purple: "bg-purple-500",
//     orange: "bg-orange-500"
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.3, delay }}
//       className={cn("rounded-2xl border p-4", bgColors[color as keyof typeof bgColors])}
//     >
//       <div className="flex items-start gap-3">
//         <div className={cn("p-2 rounded-xl", iconColors[color as keyof typeof iconColors])}>
//           <Receipt className="h-4 w-4 text-white" />
//         </div>
//         <div className="flex-1 min-w-0">
//           <h4 className="font-semibold text-sm text-foreground truncate">{expense.description || "Expense"}</h4>
//           <p className="text-xs text-muted-foreground mt-0.5">₹{expense.amount?.toFixed(2) || "0.00"}</p>
//         </div>
//       </div>
//       <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
//         <span>{new Date(expense.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
//         <span className="truncate ml-2">{expense.paidBy || "Unknown"}</span>
//       </div>
//     </motion.div>
//   );
// }

// function CompactGroupCard({ 
//   group, 
//   onManageMembers,
//   delay 
// }: { 
//   group: any;
//   onManageMembers: (group: any) => void;
//   delay: number;
// }) {
//   return (
//     <motion.button
//       initial={{ opacity: 0, x: 10 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.3, delay }}
//       onClick={() => onManageMembers(group)}
//       className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-left"
//     >
//       <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
//         {group.name?.[0]?.toUpperCase() || "G"}
//       </div>
//       <div className="flex-1 min-w-0">
//         <h4 className="font-semibold text-sm text-foreground truncate">{group.name}</h4>
//         <p className="text-xs text-muted-foreground">View details</p>
//       </div>
//     </motion.button>
//   );
// }