import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Trash2, Mail, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Group, GroupMember } from "@/hooks/useGroups";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email address");

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  members: GroupMember[];
  onAddMember: (email: string) => Promise<any>;
  onRemoveMember: (userId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  currentUserId: string;
}

export function ManageMembersModal({
  isOpen,
  onClose,
  group,
  members,
  onAddMember,
  onRemoveMember,
  onRefresh,
  currentUserId,
}: ManageMembersModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && group) {
      onRefresh();
    }
  }, [isOpen, group]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid email");
      return;
    }

    setLoading(true);
    try {
      await onAddMember(result.data);
      setEmail("");
      await onRefresh();
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    await onRemoveMember(userId);
    await onRefresh();
  };

  if (!group) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0"
          >
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full sm:w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sm:mb-8 pb-6 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Manage Members
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 ml-12">{group.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 ml-4"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Add member section */}
              <div className="mb-6 sm:mb-8 flex-shrink-0">
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Input
                    type="email"
                    placeholder="Enter member's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl h-11 sm:h-10 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                  />
                  <Button
                    type="submit"
                    onClick={handleAddMember}
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold rounded-xl h-11 sm:h-10 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="sm:hidden">Add</span>
                    <span className="hidden sm:inline">Add Member</span>
                  </Button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-3 flex items-center gap-2 font-medium"
                  >
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full" />
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Members count */}
              <div className="text-sm text-gray-600 mb-4 font-medium px-1">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </div>

              {/* Members list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 sm:pr-3">
                <style>{`
                  .members-scroll::-webkit-scrollbar {
                    width: 6px;
                  }
                  .members-scroll::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .members-scroll::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 3px;
                  }
                  .members-scroll::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                  }
                `}</style>
                <div className="members-scroll">
                  {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-4 bg-gray-100 rounded-2xl mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm font-semibold">No members yet</p>
                      <p className="text-gray-500 text-xs mt-1">Add your first member to get started</p>
                    </div>
                  ) : (
                    members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 shadow-md">
                            {(member.profile?.full_name || member.profile?.email || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {member.profile?.full_name || "Unknown"}
                              </p>
                              {member.user_id === currentUserId && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 flex-shrink-0">
                                  You
                                </span>
                              )}
                              {member.role === "admin" && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 flex-shrink-0">
                                  <Crown className="h-3 w-3" />
                                  Admin
                                </div>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1 truncate">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{member.profile?.email || "No email"}</span>
                            </p>
                          </div>
                        </div>
                        {member.user_id !== currentUserId && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemove(member.user_id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ml-2 opacity-0 group-hover:opacity-100 sm:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}