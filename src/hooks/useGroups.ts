import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Group {
  members: any[];
  totalSpent: number;
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // Fetch groups including member count
  // -------------------------------------------------------
  const fetchGroups = async () => {
    try {
      const { data: groupsData, error } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          return { ...group, member_count: count || 0 };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error: any) {
      toast.error("Failed to load groups");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // Create group
  // -------------------------------------------------------
  const createGroup = async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("groups")
        .insert({ name, description, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      await fetchGroups();
      toast.success("Group created successfully!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
      throw error;
    }
  };

  // -------------------------------------------------------
  // Update group
  // -------------------------------------------------------
  const updateGroup = async (id: string, name: string, description?: string) => {
    try {
      const { error } = await supabase
        .from("groups")
        .update({ name, description })
        .eq("id", id);

      if (error) throw error;

      await fetchGroups();
      toast.success("Group updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update group");
      throw error;
    }
  };

  // -------------------------------------------------------
  // Delete group
  // -------------------------------------------------------
  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) throw error;

      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Group deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete group");
      throw error;
    }
  };

  // -------------------------------------------------------
  // Get members with profile
  // -------------------------------------------------------
  const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          *,
          profile:profiles!group_members_user_id_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("group_id", groupId);

      if (error) throw error;

      return (data || []).map((member) => ({
        ...member,
        profile: Array.isArray(member.profile)
          ? member.profile[0]
          : member.profile,
      }));
    } catch (error) {
      toast.error("Failed to load members");
      return [];
    }
  };

  // -------------------------------------------------------
  // Add member by email (COMPLETELY REVISED)
  // -------------------------------------------------------
  const addMemberByEmail = async (groupId: string, email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      console.log("🔍 Step 1: Searching for email:", cleanEmail);

      // Try multiple approaches to find the user
      
      // Approach 1: Direct query with all columns
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", cleanEmail)
        .limit(1);

      console.log("📊 Profile query result:", { 
        data: profileData, 
        error: profileErr,
        foundRecords: profileData?.length || 0
      });

      if (profileErr) {
        console.error("❌ Database error:", profileErr);
        throw new Error(`Database error: ${profileErr.message}`);
      }

      if (!profileData || profileData.length === 0) {
        console.log("❌ No user found with email:", cleanEmail);
        
        // Debug: Show all emails in database
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("email")
          .limit(10);
        console.log("📧 Available emails in database:", allProfiles?.map(p => p.email));
        
        throw new Error(`No user found with email: ${cleanEmail}`);
      }

      const profile = profileData[0];
      console.log("✅ Found profile:", profile);

      // Determine which ID to use for group_members
      // Based on your schema, group_members.user_id should reference the auth user ID
      // This could be profile.user_id OR profile.id depending on your setup
      
      let userIdForGroupMember: string;
      
      // Check if profile has user_id field (foreign key to auth.users)
      if (profile.user_id) {
        userIdForGroupMember = profile.user_id;
        console.log("✅ Using profile.user_id:", userIdForGroupMember);
      } else if (profile.id) {
        // Fallback to profile.id if user_id doesn't exist
        userIdForGroupMember = profile.id;
        console.log("⚠️ Using profile.id as fallback:", userIdForGroupMember);
      } else {
        throw new Error("Profile has no valid user identifier");
      }

      // Step 2: Check if already a member
      console.log("🔍 Step 2: Checking if user is already a member");
      const { data: existingMember, error: existingErr } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", userIdForGroupMember)
        .maybeSingle();

      if (existingErr) {
        console.error("❌ Error checking membership:", existingErr);
        throw new Error(`Error checking membership: ${existingErr.message}`);
      }

      if (existingMember) {
        console.log("⚠️ User is already a member");
        throw new Error("User is already a member of this group");
      }

      // Step 3: Add the member
      console.log("➕ Step 3: Adding member to group");
      console.log("   Group ID:", groupId);
      console.log("   User ID:", userIdForGroupMember);
      
      const { data: newMember, error: insertErr } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userIdForGroupMember,
          role: "member"
        })
        .select()
        .single();

      if (insertErr) {
        console.error("❌ Insert error:", insertErr);
        throw new Error(`Failed to add member: ${insertErr.message}`);
      }

      console.log("✅ Member added successfully:", newMember);
      
      const userName = profile.full_name || profile.email || cleanEmail;
      toast.success(`${userName} added to the group!`);
      
      return newMember;
      
    } catch (error: any) {
      console.error("❌ addMemberByEmail failed:", error);
      toast.error(error.message || "Failed to add member");
      return null;
    }
  };

  // -------------------------------------------------------
  // Remove member
  // -------------------------------------------------------
  const removeMember = async (groupId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  };

  // -------------------------------------------------------
  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    addMemberByEmail,
    removeMember,
  };
}