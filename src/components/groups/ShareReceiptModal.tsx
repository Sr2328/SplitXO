import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MessageCircle, Copy, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Expense } from "@/hooks/useExpenses";
import { GroupMember } from "@/hooks/useGroups";
import { toast } from "sonner";

interface ShareReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  members: GroupMember[];
}

export function ShareReceiptModal({ isOpen, onClose, expense, members }: ShareReceiptModalProps) {
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [copied, setCopied] = useState(false);

  if (!expense) return null;

  const receiptMessage = `💰 Expense Receipt
📋 Title: ${expense.title}
💵 Amount: ₹${expense.amount.toFixed(2)}
📅 Date: ${new Date(expense.expense_date).toLocaleDateString()}
🏷️ Category: ${expense.category}
${expense.notes ? `📝 Notes: ${expense.notes}` : ""}
Paid by: ${expense.payer?.full_name || "Unknown"}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(receiptMessage);
      setCopied(true);
      toast.success("Receipt details copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleWhatsAppShare = () => {
    if (!selectedMember?.profile?.email) {
      toast.error("Please select a member first");
      return;
    }
    
    const encodedMessage = encodeURIComponent(receiptMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handleEmailShare = () => {
    if (!selectedMember?.profile?.email) {
      toast.error("Please select a member first");
      return;
    }

    const subject = encodeURIComponent(`Expense Receipt: ${expense.title}`);
    const body = encodeURIComponent(receiptMessage);
    window.open(`mailto:${selectedMember.profile.email}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Share Receipt</h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Expense Summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{expense.title}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      Amount: <span className="text-gray-900 dark:text-white font-medium">₹{expense.amount.toFixed(2)}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Date: <span className="text-gray-900 dark:text-white">{new Date(expense.expense_date).toLocaleDateString()}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Paid by: <span className="text-gray-900 dark:text-white">{expense.payer?.full_name || "Unknown"}</span>
                    </p>
                  </div>
                </div>

                {/* Select Member */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                    Send to member
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          selectedMember?.id === member.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {(member.profile?.full_name || member.profile?.email || "?")[0].toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {member.profile?.full_name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.profile?.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={handleWhatsAppShare}
                  >
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Share via WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={handleEmailShare}
                  >
                    <Mail className="h-5 w-5 text-blue-500" />
                    Share via Email
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                    {copied ? "Copied!" : "Copy Receipt Details"}
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="ghost" className="w-full" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}