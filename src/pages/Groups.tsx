// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Plus, Users, Search, UserPlus, Trash2, Settings, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { supabase } from "@/integrations/supabase/client";
// import { User } from "@supabase/supabase-js";
// import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
// import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
// import { ManageMembersModal } from "@/components/groups/ManageMembersModal";
// import { useGroups, Group, GroupMember } from "@/hooks/useGroups";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";

// export default function Groups() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [createGroupOpen, setCreateGroupOpen] = useState(false);
//   const [manageMembersOpen, setManageMembersOpen] = useState(false);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//   const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

//   const { groups, createGroup, deleteGroup, getGroupMembers, addMemberByEmail, removeMember } = useGroups();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) {
//         navigate("/auth");
//         return;
//       }
//       setUser(session.user);
//       setLoading(false);
//     };

//     checkAuth();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       if (!session) {
//         navigate("/auth");
//       } else {
//         setUser(session.user);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [navigate]);

//   const handleManageMembers = async (group: Group) => {
//     setSelectedGroup(group);
//     const members = await getGroupMembers(group.id);
//     setGroupMembers(members);
//     setManageMembersOpen(true);
//   };

//   const refreshMembers = async () => {
//     if (selectedGroup) {
//       const members = await getGroupMembers(selectedGroup.id);
//       setGroupMembers(members);
//     }
//   };

//   const handleDeleteGroup = async (group: Group) => {
//     if (window.confirm(`Are you sure you want to delete "${group.name}"? This will also delete all expenses in this group.`)) {
//       await deleteGroup(group.id);
//     }
//   };

//   const filteredGroups = groups.filter((group) =>
//     group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     group.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (loading || !user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//       </div>
//     );
//   }

//   return (
//     <DashboardLayout user={user}>
//       <div className="space-y-6">
//         {/* Enhanced Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
//         >
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Groups</h1>
//             <p className="text-muted-foreground mt-2 text-sm font-medium">Manage your expense sharing groups</p>
//           </div>
//           <Button 
//             onClick={() => setCreateGroupOpen(true)}
//             className="rounded-xl shadow-sm hover:shadow-md transition-all"
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Create Group
//           </Button>
//         </motion.div>

//         {/* Enhanced Search */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="relative"
//         >
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search groups..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-11 h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
//           />
//         </motion.div>

//         {/* Groups Grid */}
//         {filteredGroups.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-card rounded-[2rem] border border-border/50 shadow-lg p-16 text-center"
//           >
//             <div className="p-5 rounded-2xl bg-muted/50 inline-block mb-6">
//               <Users className="h-10 w-10 text-muted-foreground" />
//             </div>
//             <h3 className="font-bold text-foreground mb-3 text-xl">
//               {searchQuery ? "No groups found" : "No groups yet"}
//             </h3>
//             <p className="text-muted-foreground mb-6 text-sm max-w-[300px] mx-auto">
//               {searchQuery ? "Try a different search term" : "Create your first group to start splitting expenses"}
//             </p>
//             {!searchQuery && (
//               <Button 
//                 onClick={() => setCreateGroupOpen(true)}
//                 className="rounded-xl shadow-sm"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Create Group
//               </Button>
//             )}
//           </motion.div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//             <AnimatePresence mode="popLayout">
//               {filteredGroups.map((group, index) => (
//                 <motion.div
//                   key={group.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.95 }}
//                   transition={{ delay: index * 0.05 }}
//                    onClick={() => navigate(`/groups/${group.id}`)}
//                   className="bg-card rounded-2xl border border-border shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden group cursor-pointer"
//                 >
//                   {/* Enhanced Group Header with Gradient */}
//                   <div className="h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 relative overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
//                     {/* Decorative elements */}
//                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
//                     <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    
//                     <div className="absolute bottom-4 left-5 flex items-center gap-3">
//                       <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
//                         <Users className="h-6 w-6 text-white" />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Enhanced Group Content */}
//                   <div className="p-5">
//                     <h3 className="font-bold text-foreground text-lg mb-2 tracking-tight line-clamp-1">
//                       {group.name}
//                     </h3>
//                     <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed">
//                       {group.description || "No description"}
//                     </p>

//                     <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/50">
//                       <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
//                         <div className="p-1.5 rounded-lg bg-muted/50">
//                           <Users className="h-4 w-4" />
//                         </div>
//                         <span>{group.member_count || 0} members</span>
//                       </div>
                      
//                       <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-all"
//                           onClick={() => handleManageMembers(group)}
//                         >
//                           <UserPlus className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
//                           onClick={() => handleDeleteGroup(group)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       <CreateGroupModal
//         isOpen={createGroupOpen}
//         onClose={() => setCreateGroupOpen(false)}
//         onSubmit={createGroup}
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
//     </DashboardLayout>
//   );
// }





// ++++++++++++++++++++++++++++++++++++
// ==============================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Search, UserPlus, Trash2, Settings, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [groupMembersMap, setGroupMembersMap] = useState<Record<string, GroupMember[]>>({});

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

  // Fetch members for all groups
  useEffect(() => {
    const fetchAllGroupMembers = async () => {
      const membersMap: Record<string, GroupMember[]> = {};
      for (const group of groups) {
        const members = await getGroupMembers(group.id);
        membersMap[group.id] = members;
      }
      setGroupMembersMap(membersMap);
    };

    if (groups.length > 0) {
      fetchAllGroupMembers();
    }
  }, [groups]);

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

  const getInitials = (name: string) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
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
      <div className="space-y-4 sm:space-y-6 ">
        {/* p-4 sm:p-6 lg:p-8 */}
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Groups
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm font-medium">
              Manage your expense sharing groups
            </p>
          </div>
          <Button 
            onClick={() => setCreateGroupOpen(true)}
            className="w-full sm:w-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            size="default"
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
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-11 h-11 sm:h-12 rounded-xl border-border/50 focus:border-primary/50 transition-colors shadow-sm"
          />
        </motion.div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg border-border/50">
              <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 inline-block mb-4 sm:mb-6 shadow-sm">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
                </div>
                <h3 className="font-bold text-foreground mb-2 sm:mb-3 text-lg sm:text-xl">
                  {searchQuery ? "No groups found" : "No groups yet"}
                </h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base max-w-[300px] mx-auto">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Create your first group to start splitting expenses with friends and family"}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setCreateGroupOpen(true)}
                    className="rounded-xl shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Group
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group, index) => {
                const members = groupMembersMap[group.id] || [];
                const displayMembers = members.slice(0, 4);
                const remainingCount = Math.max(0, members.length - 4);

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card 
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border-border/50 hover:-translate-y-1 h-full"
                    >
                      {/* Enhanced Group Header with Gradient */}
                      <div className="h-16 sm:h-20 lg:h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                        
                        {/* Decorative animated elements */}
                        <div className="absolute top-0 right-0 w-20 sm:w-24 lg:w-32 h-20 sm:h-24 lg:h-32 bg-white/10 rounded-full -mr-10 sm:-mr-12 lg:-mr-16 -mt-10 sm:-mt-12 lg:-mt-16 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute bottom-0 left-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-white/10 rounded-full -ml-8 sm:-ml-10 lg:-ml-12 -mb-8 sm:-mb-10 lg:-mb-12 group-hover:scale-110 transition-transform duration-500" />
                        
                        {/* Sparkle effect on hover */}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white/60" />
                        </div>
                        
                        <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-3 sm:left-4 lg:left-5 flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-colors">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Group Content */}
                      <CardContent className="p-3 sm:p-4 lg:p-5">
                        <h3 className="font-bold text-foreground text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {group.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[32px] sm:min-h-[36px] lg:min-h-[40px] leading-relaxed mb-3 sm:mb-4">
                          {group.description || "No description"}
                        </p>

                        {/* Member Avatars */}
                        <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border/50">
                          <div className="flex -space-x-2">
                            {displayMembers.map((member, idx) => (
                              <Avatar 
                                key={member.id} 
                                className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-background shadow-sm"
                                style={{ zIndex: displayMembers.length - idx }}
                              >
                                <AvatarImage src={member.profile?.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                                  {getInitials(member.profile?.full_name || member.profile?.email || "?")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {remainingCount > 0 && (
                              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center shadow-sm">
                                <span className="text-xs font-semibold text-muted-foreground">+{remainingCount}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-8 sm:h-9 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm text-xs sm:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageMembers(group);
                            }}
                          >
                            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Add</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group);
                            }}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>

                        {/* Hover indicator */}
                        <div className="flex items-center justify-center gap-1 mt-2 sm:mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
                          <span className="hidden sm:inline">View details</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Stats Summary */}
        {filteredGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs sm:text-sm text-muted-foreground pt-4"
          >
            Showing {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
            {searchQuery && ` matching "${searchQuery}"`}
          </motion.div>
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