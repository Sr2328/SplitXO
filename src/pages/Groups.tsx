import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Search, UserPlus, Trash2, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
import { useGroups, Group, GroupMember } from "@/hooks/useGroups";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Groups() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  const { groups, createGroup, deleteGroup, getGroupMembers, addMemberByEmail, removeMember } = useGroups();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleManageMembers = async (group: Group) => {
    setSelectedGroup(group);
    const members = await getGroupMembers(group.id);
    setGroupMembers(members);
    setManageMembersOpen(true);
  };

  const refreshMembers = async () => {
    if (selectedGroup) {
      const members = await getGroupMembers(selectedGroup.id);
      setGroupMembers(members);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    if (window.confirm(`Are you sure you want to delete "${group.name}"? This will also delete all expenses in this group.`)) {
      await deleteGroup(group.id);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Groups</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">Manage your expense sharing groups</p>
          </div>
          <Button 
            onClick={() => setCreateGroupOpen(true)}
            className="rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </motion.div>

        {/* Enhanced Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
          />
        </motion.div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-[2rem] border border-border/50 shadow-lg p-16 text-center"
          >
            <div className="p-5 rounded-2xl bg-muted/50 inline-block mb-6">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-3 text-xl">
              {searchQuery ? "No groups found" : "No groups yet"}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm max-w-[300px] mx-auto">
              {searchQuery ? "Try a different search term" : "Create your first group to start splitting expenses"}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setCreateGroupOpen(true)}
                className="rounded-xl shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]"
                >
                  {/* Enhanced Group Header with Gradient */}
                  <div className="h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    
                    <div className="absolute bottom-4 left-5 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Group Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-foreground text-lg mb-2 tracking-tight line-clamp-1">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed">
                      {group.description || "No description"}
                    </p>

                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <div className="p-1.5 rounded-lg bg-muted/50">
                          <Users className="h-4 w-4" />
                        </div>
                        <span>{group.member_count || 0} members</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-all"
                          onClick={() => handleManageMembers(group)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                          onClick={() => handleDeleteGroup(group)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={createGroup}
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
    </DashboardLayout>
  );
}