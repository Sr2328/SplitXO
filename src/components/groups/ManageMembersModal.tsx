import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Trash2, Mail, Crown } from "lucide-react";
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
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 z-50 w-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 flex items-center justify-center"
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 max-h-[calc(100vh-2rem)] sm:max-h-[80vh] w-full overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Manage Members</h2>
                  <p className="text-sm text-muted-foreground">{group.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Add member form */}
              <form onSubmit={handleAddMember} className="mb-6">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter member's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading} size="icon">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              </form>

              {/* Members list */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {members.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No members yet</p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {(member.profile?.full_name || member.profile?.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {member.profile?.full_name || "Unknown"}
                            {member.user_id === currentUserId && (
                              <span className="text-muted-foreground ml-1">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.profile?.email || "No email"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role === "admin" && (
                          <Crown className="h-4 w-4 text-accent" />
                        )}
                        {member.user_id !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemove(member.user_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
