import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Plus, Users, ChevronDown, AlertCircle, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Group, GroupMember } from "@/hooks/useGroups";
import { ExpenseCategory, SplitInput } from "@/hooks/useExpenses";
import { z } from "zod";
import { cn } from "@/lib/utils";

const expenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  amount: z.number().positive("Amount must be positive"),
  category: z.string(),
  expense_date: z.string().min(1, "Date is required"),
  notes: z.string().max(1000).optional(),
});

const categories: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: "food", label: "Food & Drinks", emoji: "🍔" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "utilities", label: "Utilities", emoji: "💡" },
  { value: "rent", label: "Rent", emoji: "🏠" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "healthcare", label: "Healthcare", emoji: "🏥" },
  { value: "other", label: "Other", emoji: "📦" },
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onSubmit: (
    expense: {
      group_id: string;
      title: string;
      amount: number;
      category: ExpenseCategory;
      paid_by: string;
      expense_date: string;
      notes?: string;
      receipt_url?: string;
    },
    splits: SplitInput[]
  ) => Promise<unknown>;
  getGroupMembers?: (groupId: string) => Promise<GroupMember[]>;
  currentUserId?: string;
  onCreateGroup?: () => void;
  preselectedGroupId?: string;
  onSuccess?: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  groups,
  onSubmit,
  getGroupMembers,
  currentUserId,
  onCreateGroup,
  preselectedGroupId,
}: AddExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId || "");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedGroupId && getGroupMembers) {
      loadMembers(selectedGroupId);
    } else if (selectedGroupId && groups.length > 0) {
      setMembers([]);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (isOpen) {
      setPaidBy(currentUserId || "");
      if (preselectedGroupId) {
        setSelectedGroupId(preselectedGroupId);
      } else if (groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groups[0].id);
      }
    }
  }, [isOpen, groups, currentUserId, preselectedGroupId]);

  const loadMembers = async (groupId: string) => {
    if (!getGroupMembers) return;
    const groupMembers = await getGroupMembers(groupId);
    setMembers(groupMembers);
    const splits: Record<string, string> = {};
    groupMembers.forEach((m) => {
      splits[m.user_id] = "";
    });
    setCustomSplits(splits);
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("other");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setSplitType("equal");
    setCustomSplits({});
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    const result = expenseSchema.safeParse({
      title,
      amount: numAmount,
      category,
      expense_date: expenseDate,
      notes: notes || undefined,
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid input");
      return;
    }

    if (!selectedGroupId) {
      setError("Please select a group");
      return;
    }

    let splits: SplitInput[] = [];
    if (splitType === "equal") {
      const splitAmount = numAmount / members.length;
      splits = members.map((m) => ({
        user_id: m.user_id,
        amount: Math.round(splitAmount * 100) / 100,
      }));
    } else {
      splits = Object.entries(customSplits)
        .filter(([_, val]) => parseFloat(val) > 0)
        .map(([userId, val]) => ({
          user_id: userId,
          amount: parseFloat(val),
        }));
      const total = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(total - numAmount) > 0.01) {
        setError(`Split amounts (₹${total.toFixed(2)}) must equal total (₹${numAmount.toFixed(2)})`);
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(
        {
          group_id: selectedGroupId,
          title: result.data.title,
          amount: result.data.amount,
          category: category as ExpenseCategory,
          paid_by: paidBy,
          expense_date: result.data.expense_date,
          notes: result.data.notes,
        },
        splits
      );
      resetForm();
      onClose();
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col pointer-events-auto">
              {/* Header - Green Gradient */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-6 flex items-center justify-between relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                    <IndianRupee className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Add Expense</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 relative z-10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-5">
                {/* Group Selection */}
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2.5 block">
                    Group <span className="text-red-500">*</span>
                  </label>
                  {groups.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-700 mb-3">No groups yet</p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={onCreateGroup}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Group
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-300"
                      >
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2.5 block">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Dinner at restaurant"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    className="rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                  <p className="text-xs text-gray-500 mt-2">{title.length}/200 characters</p>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2.5 block">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold">₹</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="pl-8 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-3.5 block">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "p-3 rounded-2xl transition-all duration-200 font-semibold text-xs flex flex-col items-center gap-2 border-2",
                          category === cat.value
                            ? "bg-teal-500 text-white border-teal-600 shadow-lg shadow-teal-500/20"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                        )}
                      >
                        <span className="text-xl">{cat.emoji}</span>
                        <span className="leading-tight text-[11px]">{cat.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2.5 block">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                {/* Paid By */}
                {members.length > 0 && (
                  <div>
                    <label className="text-sm font-bold text-gray-900 mb-2.5 block">
                      Paid by
                    </label>
                    <div className="relative">
                      <select
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 appearance-none cursor-pointer transition-all duration-200 hover:border-gray-300"
                      >
                        {members.map((member) => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.profile?.full_name || member.profile?.email || "Unknown"}
                            {member.user_id === currentUserId && " (You)"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Split Type */}
                {members.length > 0 && (
                  <div>
                    <label className="text-sm font-bold text-gray-900 mb-3.5 block">
                      Split Type
                    </label>
                    <div className="flex gap-3 mb-4">
                      {["equal", "custom"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSplitType(type as "equal" | "custom")}
                          className={cn(
                            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 border-2",
                            splitType === type
                              ? "bg-teal-500 text-white border-teal-600 shadow-lg shadow-teal-500/20"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-200"
                          )}
                        >
                          {type === "equal" ? "Equal Split" : "Custom Split"}
                        </button>
                      ))}
                    </div>

                    {splitType === "equal" && amount && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 text-sm text-teal-900 font-bold"
                      >
                        Each person pays: <span className="text-teal-600">₹{(parseFloat(amount) / members.length).toFixed(2)}</span>
                      </motion.div>
                    )}

                    {splitType === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 bg-gray-50 p-4 rounded-2xl border-2 border-gray-200"
                      >
                        {members.map((member) => (
                          <div key={member.user_id} className="flex items-center gap-3">
                            <span className="flex-1 text-sm font-semibold text-gray-900 truncate">
                              {member.profile?.full_name || member.profile?.email || "Unknown"}
                            </span>
                            <div className="relative w-28">
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-sm">₹</span>
                              <Input
                                type="number"
                                placeholder="0"
                                value={customSplits[member.user_id] || ""}
                                onChange={(e) =>
                                  setCustomSplits((prev) => ({
                                    ...prev,
                                    [member.user_id]: e.target.value,
                                  }))
                                }
                                className="pr-8 rounded-lg border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2.5 block">
                    Notes <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 resize-none"
                    placeholder="Add any additional notes..."
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-2">{notes.length}/1000 characters</p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-semibold">{error}</p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t-2 border-gray-100 bg-gray-50 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-gray-900 font-bold hover:bg-gray-100 py-2.5"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl"
                  disabled={loading || groups.length === 0 || members.length === 0}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block"
                    >
                      ⟳
                    </motion.div>
                  ) : (
                    "Add Expense"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}