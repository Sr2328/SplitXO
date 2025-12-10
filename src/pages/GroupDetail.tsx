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
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

    // Fetch group details
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

    // Fetch members
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
      <div className="space-y-6">
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
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{group.name}</h1>
                {group.description && (
                  <p className="text-muted-foreground mt-1">{group.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{members.length} members</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setManageMembersOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Members
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSettleOpen(true)}>
                <Wallet className="h-4 w-4 mr-2" />
                Settle Up
              </Button>
              <Button onClick={() => setAddExpenseOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Balance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">You are owed</p>
                <p className="text-xl font-bold text-success">₹{totalOwed.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">You owe</p>
                <p className="text-xl font-bold text-destructive">₹{totalOwe.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="expenses" className="flex-1 sm:flex-none gap-2">
                <Receipt className="h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="members" className="flex-1 sm:flex-none gap-2">
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="balances" className="flex-1 sm:flex-none gap-2">
                <Wallet className="h-4 w-4" />
                Balances
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-6">
              {expenses.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <div className="p-4 rounded-full bg-muted inline-block mb-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first expense to start tracking
                  </p>
                  <Button onClick={() => setAddExpenseOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
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

            <TabsContent value="members" className="mt-6">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 ${
                      index !== members.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {(member.profile?.full_name || member.profile?.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.profile?.full_name || "Unknown User"}
                          {member.user_id === user.id && (
                            <span className="text-muted-foreground ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      member.role === "admin" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="balances" className="mt-6">
              {balances.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <div className="p-4 rounded-full bg-muted inline-block mb-4">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">All settled up!</h3>
                  <p className="text-muted-foreground">
                    No outstanding balances in this group
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {balances.map((balance, index) => (
                    <div
                      key={balance.userId}
                      className={`flex items-center justify-between p-4 ${
                        index !== balances.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
                          {balance.userName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{balance.userName}</p>
                          <p className="text-sm text-muted-foreground">{balance.userEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          balance.amount > 0 ? "text-success" : "text-destructive"
                        }`}>
                          {balance.amount > 0 ? "+" : ""}₹{balance.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {balance.amount > 0 ? "owes you" : "you owe"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
