// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { motion } from "framer-motion";
// import { 
//   ArrowLeft, 
//   Users, 
//   Plus, 
//   Receipt, 
//   UserPlus, 
//   Settings,
//   Wallet,
//   TrendingUp,
//   TrendingDown
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { supabase } from "@/integrations/supabase/client";
// import { User } from "@supabase/supabase-js";
// import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
// import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
// import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
// import { GroupSettleModal } from "@/components/groups/GroupSettleModal";
// import { ExpenseCard } from "@/components/expenses/ExpenseCard";
// import { useGroups, Group, GroupMember } from "@/hooks/useGroups";
// import { useExpenses } from "@/hooks/useExpenses";
// import { useGroupBalances } from "@/hooks/useGroupBalances";
// import { ShareReceiptModal } from "@/components/groups/ShareReceiptModal";
// import { toast } from "sonner";

// export default function GroupDetail() {
//   const { groupId } = useParams<{ groupId: string }>();
//   const navigate = useNavigate();
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [group, setGroup] = useState<Group | null>(null);
//   const [members, setMembers] = useState<GroupMember[]>([]);
//   const [addExpenseOpen, setAddExpenseOpen] = useState(false);
//   const [manageMembersOpen, setManageMembersOpen] = useState(false);
//   const [settleOpen, setSettleOpen] = useState(false);
//   const [shareReceiptOpen, setShareReceiptOpen] = useState(false);
//   const [selectedExpense, setSelectedExpense] = useState<any>(null);

//   const { getGroupMembers, addMemberByEmail, removeMember } = useGroups();
//   const { expenses, fetchExpenses, createExpense, deleteExpense } = useExpenses(groupId);
//   const { balances, totalOwed, totalOwe, createSettlement, refreshBalances } = useGroupBalances(groupId);

//   useEffect(() => {
//     const checkAuth = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) {
//         navigate("/auth");
//         return;
//       }
//       setUser(session.user);
//       await loadGroupData();
//       setLoading(false);
//     };

//     checkAuth();
//   }, [navigate, groupId]);

//   const loadGroupData = async () => {
//     if (!groupId) return;

//     // Fetch group details
//     const { data: groupData, error } = await supabase
//       .from("groups")
//       .select("*")
//       .eq("id", groupId)
//       .single();

//     if (error) {
//       toast.error("Group not found");
//       navigate("/groups");
//       return;
//     }

//     setGroup(groupData);

//     // Fetch members
//     const membersData = await getGroupMembers(groupId);
//     setMembers(membersData);
//   };

//   const refreshMembers = async () => {
//     if (groupId) {
//       const membersData = await getGroupMembers(groupId);
//       setMembers(membersData);
//     }
//   };

//   const handleShareReceipt = (expense: any) => {
//     setSelectedExpense(expense);
//     setShareReceiptOpen(true);
//   };

//   if (loading || !user || !group) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//       </div>
//     );
//   }

//   return (
//     <DashboardLayout user={user}>
//       <div className="space-y-6">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-4"
//         >
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => navigate("/groups")}
//             className="gap-2"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Back to Groups
//           </Button>

//           <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//             <div className="flex items-start gap-4">
//               <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
//                 <Users className="h-8 w-8 text-primary-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-foreground">{group.name}</h1>
//                 {group.description && (
//                   <p className="text-muted-foreground mt-1">{group.description}</p>
//                 )}
//                 <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
//                   <Users className="h-4 w-4" />
//                   <span>{members.length} members</span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <Button variant="outline" size="sm" onClick={() => setManageMembersOpen(true)}>
//                 <UserPlus className="h-4 w-4 mr-2" />
//                 Members
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => setSettleOpen(true)}>
//                 <Wallet className="h-4 w-4 mr-2" />
//                 Settle Up
//               </Button>
//               <Button onClick={() => setAddExpenseOpen(true)}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Expense
//               </Button>
//             </div>
//           </div>
//         </motion.div>

//         {/* Balance Summary */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="grid grid-cols-1 sm:grid-cols-2 gap-4"
//         >
//           <div className="bg-card rounded-2xl border border-border p-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-xl bg-success/10">
//                 <TrendingUp className="h-5 w-5 text-success" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">You are owed</p>
//                 <p className="text-xl font-bold text-success">₹{totalOwed.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-card rounded-2xl border border-border p-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-xl bg-destructive/10">
//                 <TrendingDown className="h-5 w-5 text-destructive" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">You owe</p>
//                 <p className="text-xl font-bold text-destructive">₹{totalOwe.toFixed(2)}</p>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <Tabs defaultValue="expenses" className="w-full">
//             <TabsList className="w-full sm:w-auto">
//               <TabsTrigger value="expenses" className="flex-1 sm:flex-none gap-2">
//                 <Receipt className="h-4 w-4" />
//                 Expenses
//               </TabsTrigger>
//               <TabsTrigger value="members" className="flex-1 sm:flex-none gap-2">
//                 <Users className="h-4 w-4" />
//                 Members
//               </TabsTrigger>
//               <TabsTrigger value="balances" className="flex-1 sm:flex-none gap-2">
//                 <Wallet className="h-4 w-4" />
//                 Balances
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="expenses" className="mt-6">
//               {expenses.length === 0 ? (
//                 <div className="bg-card rounded-2xl border border-border p-12 text-center">
//                   <div className="p-4 rounded-full bg-muted inline-block mb-4">
//                     <Receipt className="h-8 w-8 text-muted-foreground" />
//                   </div>
//                   <h3 className="font-semibold text-foreground mb-2">No expenses yet</h3>
//                   <p className="text-muted-foreground mb-4">
//                     Add your first expense to start tracking
//                   </p>
//                   <Button onClick={() => setAddExpenseOpen(true)}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Expense
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="grid gap-4">
//                   {expenses.map((expense, index) => (
//                     <ExpenseCard
//                       key={expense.id}
//                       expense={expense}
//                       onDelete={(id) => deleteExpense(id)}
//                       onShare={() => handleShareReceipt(expense)}
//                       delay={index * 0.05}
//                     />
//                   ))}
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="members" className="mt-6">
//               <div className="bg-card rounded-2xl border border-border overflow-hidden">
//                 {members.map((member, index) => (
//                   <div
//                     key={member.id}
//                     className={`flex items-center justify-between p-4 ${
//                       index !== members.length - 1 ? "border-b border-border" : ""
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
//                         {(member.profile?.full_name || member.profile?.email || "?")[0].toUpperCase()}
//                       </div>
//                       <div>
//                         <p className="font-medium text-foreground">
//                           {member.profile?.full_name || "Unknown User"}
//                           {member.user_id === user.id && (
//                             <span className="text-muted-foreground ml-2">(You)</span>
//                           )}
//                         </p>
//                         <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
//                       </div>
//                     </div>
//                     <span className={`text-xs px-2 py-1 rounded-full ${
//                       member.role === "admin" 
//                         ? "bg-primary/10 text-primary" 
//                         : "bg-muted text-muted-foreground"
//                     }`}>
//                       {member.role}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </TabsContent>

//             <TabsContent value="balances" className="mt-6">
//               {balances.length === 0 ? (
//                 <div className="bg-card rounded-2xl border border-border p-12 text-center">
//                   <div className="p-4 rounded-full bg-muted inline-block mb-4">
//                     <Wallet className="h-8 w-8 text-muted-foreground" />
//                   </div>
//                   <h3 className="font-semibold text-foreground mb-2">All settled up!</h3>
//                   <p className="text-muted-foreground">
//                     No outstanding balances in this group
//                   </p>
//                 </div>
//               ) : (
//                 <div className="bg-card rounded-2xl border border-border overflow-hidden">
//                   {balances.map((balance, index) => (
//                     <div
//                       key={balance.userId}
//                       className={`flex items-center justify-between p-4 ${
//                         index !== balances.length - 1 ? "border-b border-border" : ""
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
//                           {balance.userName[0].toUpperCase()}
//                         </div>
//                         <div>
//                           <p className="font-medium text-foreground">{balance.userName}</p>
//                           <p className="text-sm text-muted-foreground">{balance.userEmail}</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className={`font-semibold ${
//                           balance.amount > 0 ? "text-success" : "text-destructive"
//                         }`}>
//                           {balance.amount > 0 ? "+" : ""}₹{balance.amount.toFixed(2)}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           {balance.amount > 0 ? "owes you" : "you owe"}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </motion.div>
//       </div>

//       {/* Modals */}
//       <AddExpenseModal
//         isOpen={addExpenseOpen}
//         onClose={() => setAddExpenseOpen(false)}
//         onSubmit={async (expense, splits) => {
//           await createExpense(expense, splits);
//           await refreshBalances();
//         }}
//         groups={group ? [group] : []}
//         preselectedGroupId={groupId}
//       />

//       <ManageMembersModal
//         isOpen={manageMembersOpen}
//         onClose={() => setManageMembersOpen(false)}
//         group={group}
//         members={members}
//         onAddMember={(email) => addMemberByEmail(group.id, email)}
//         onRemoveMember={(userId) => removeMember(group.id, userId)}
//         onRefresh={refreshMembers}
//         currentUserId={user.id}
//       />

//       <GroupSettleModal
//         isOpen={settleOpen}
//         onClose={() => setSettleOpen(false)}
//         balances={balances.filter(b => b.amount < 0)}
//         groupId={groupId || ""}
//         onSubmit={async (paidTo, amount, notes, receiptUrl) => {
//           await createSettlement(paidTo, amount, notes, receiptUrl);
//         }}
//       />

//       <ShareReceiptModal
//         isOpen={shareReceiptOpen}
//         onClose={() => setShareReceiptOpen(false)}
//         expense={selectedExpense}
//         members={members}
//       />
//     </DashboardLayout>
//   );
// }




// ++++++++++++++++++++++++++++
// ++++++++++++++++++++=++++++++


import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Receipt, 
  UserPlus, 
  Settings,
  Wallet,
  TrendingUp,
  TrendingDown,
  IndianRupeeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
import { GroupSettleModal } from "@/components/groups/GroupSettleModal";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { useGroups, Group, GroupMember } from "@/hooks/useGroups";
import { useExpenses } from "@/hooks/useExpenses";
import { useGroupBalances } from "@/hooks/useGroupBalances";
import { ShareReceiptModal } from "@/components/groups/ShareReceiptModal";
import { toast } from "sonner";

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [shareReceiptOpen, setShareReceiptOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const { getGroupMembers, addMemberByEmail, removeMember } = useGroups();
  const { expenses, fetchExpenses, createExpense, deleteExpense } = useExpenses(groupId);
  const { balances, totalOwed, totalOwe, createSettlement, refreshBalances } = useGroupBalances(groupId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadGroupData();
      setLoading(false);
    };
    checkAuth();
  }, [navigate, groupId]);

  const loadGroupData = async () => {
    if (!groupId) return;

    const { data: groupData, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (error) {
      toast.error("Group not found");
      navigate("/groups");
      return;
    }

    setGroup(groupData);
    const membersData = await getGroupMembers(groupId);
    setMembers(membersData);
  };

  const refreshMembers = async () => {
    if (groupId) {
      const membersData = await getGroupMembers(groupId);
      setMembers(membersData);
    }
  };

  const handleShareReceipt = (expense: any) => {
    setSelectedExpense(expense);
    setShareReceiptOpen(true);
  };

  if (loading || !user || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 sm:space-y-6">
        {/*  p-4 sm:p-6 lg:p-8 */}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/groups")}
            className="gap-2 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Groups</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-md">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                      {group.name}
                    </h1>
                    {group.description && (
                      <p className="text-sm sm:text-base text-muted-foreground mt-1 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-muted-foreground">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setManageMembersOpen(true)}
                    className="flex-1 sm:flex-none shadow-sm hover:shadow-md transition-shadow"
                  >
                    <UserPlus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Members</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSettleOpen(true)}
                    className="flex-1 sm:flex-none shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Wallet className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Settle Up</span>
                  </Button>
                  <Button 
                    onClick={() => setAddExpenseOpen(true)}
                    className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Balance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 hover:-translate-y-1">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-success/10 shadow-sm">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">You are owed</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-success truncate">
                    ₹{totalOwed.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-border/50 hover:-translate-y-1">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-destructive/10 shadow-sm">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">You owe</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-destructive truncate">
                    ₹{totalOwe.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/50 shadow-sm">
              <TabsTrigger value="expenses" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md">
                <IndianRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Members</span>
              </TabsTrigger>
              <TabsTrigger value="balances" className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:py-2.5 text-xs sm:text-sm data-[state=active]:shadow-md">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Balances</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-4 sm:mt-6">
              {expenses.length === 0 ? (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <div className="p-3 sm:p-4 rounded-full bg-muted inline-block mb-4 shadow-sm">
                      <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No expenses yet</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Add your first expense to start tracking
                    </p>
                    <Button onClick={() => setAddExpenseOpen(true)} className="shadow-md">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {expenses.map((expense, index) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onDelete={(id) => deleteExpense(id)}
                      onShare={() => handleShareReceipt(expense)}
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-4 sm:mt-6">
              <Card className="shadow-lg border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 sm:p-4 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20
 transition-colors ${
                        index !== members.length - 1 ? "border-b border-border/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm sm:text-base shrink-0 shadow-sm">
                          {(member.profile?.full_name || member.profile?.email || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-foreground truncate">
                            {member.profile?.full_name || "Unknown User"}
                            {member.user_id === user.id && (
                              <span className="text-xs sm:text-sm text-muted-foreground ml-2">(You)</span>
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {member.profile?.email}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full shrink-0 shadow-sm ${
                        member.role === "admin" 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="balances" className="mt-4 sm:mt-6">
              {balances.length === 0 ? (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <div className="p-3 sm:p-4 rounded-full bg-muted inline-block mb-4 shadow-sm">
                      <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">All settled up!</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      No outstanding balances in this group
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-border/50 overflow-hidden">
                  <CardContent className="p-0">
                    {balances.map((balance, index) => (
                      <div
                        key={balance.userId}
                        className={`flex items-center justify-between p-3 sm:p-4 hover:bg-accent/50 transition-colors ${
                          index !== balances.length - 1 ? "border-b border-border/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm sm:text-base shrink-0 shadow-sm">
                            {balance.userName[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-foreground truncate">
                              {balance.userName}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {balance.userEmail}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm sm:text-base font-semibold ${
                            balance.amount > 0 ? "text-success" : "text-destructive"
                          }`}>
                            {balance.amount > 0 ? "+" : ""}₹{Math.abs(balance.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {balance.amount > 0 ? "owes you" : "you owe"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        onSubmit={async (expense, splits) => {
          await createExpense(expense, splits);
          await refreshBalances();
        }}
        groups={group ? [group] : []}
        preselectedGroupId={groupId}
      />

      <ManageMembersModal
        isOpen={manageMembersOpen}
        onClose={() => setManageMembersOpen(false)}
        group={group}
        members={members}
        onAddMember={(email) => addMemberByEmail(group.id, email)}
        onRemoveMember={(userId) => removeMember(group.id, userId)}
        onRefresh={refreshMembers}
        currentUserId={user.id}
      />

      <GroupSettleModal
        isOpen={settleOpen}
        onClose={() => setSettleOpen(false)}
        balances={balances.filter(b => b.amount < 0)}
        groupId={groupId || ""}
        onSubmit={async (paidTo, amount, notes, receiptUrl) => {
          await createSettlement(paidTo, amount, notes, receiptUrl);
        }}
      />

      <ShareReceiptModal
        isOpen={shareReceiptOpen}
        onClose={() => setShareReceiptOpen(false)}
        expense={selectedExpense}
        members={members}
      />
    </DashboardLayout>
  );
}