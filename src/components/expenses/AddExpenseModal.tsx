import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, Plus, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Group, GroupMember } from "@/hooks/useGroups";
import { ExpenseCategory, SplitInput } from "@/hooks/useExpenses";
import { z } from "zod";

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
  },
  splits: SplitInput[]
) => Promise<any>;  // or Promise<Expense>

  getGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  currentUserId: string;
  onCreateGroup?: () => void;
  onSuccess?: () => void; // NEW: Callback after successful creation
}

export function AddExpenseModal({
  isOpen,
  onClose,
  groups,
  onSubmit,
  getGroupMembers,
  currentUserId,
  onCreateGroup,
  onSuccess,
}: AddExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedGroupId) {
      loadMembers(selectedGroupId);
    } else {
      setMembers([]);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (isOpen) {
      setPaidBy(currentUserId);
      if (groups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(groups[0].id);
      }
    }
  }, [isOpen, groups, currentUserId]);

  const loadMembers = async (groupId: string) => {
    try {
      const groupMembers = await getGroupMembers(groupId);
      setMembers(groupMembers);
      const splits: Record<string, string> = {};
      groupMembers.forEach((m) => {
        splits[m.user_id] = "";
      });
      setCustomSplits(splits);
    } catch (error) {
      console.error("Failed to load members:", error);
      setError("Failed to load group members");
    }
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

  const handleSubmit = async () => {
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

    if (members.length === 0) {
      setError("Group must have at least one member");
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

      if (splits.length === 0) {
        setError("Please enter split amounts for at least one person");
        return;
      }

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
      
      // Call the success callback to refresh the expenses and balances
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      console.error("Failed to create expense:", err);
      setError("Failed to create expense. Please try again.");
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
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto">
              <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent/10">
                    <Receipt className="h-5 w-5 text-accent" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Add Expense</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Group Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Group *
                  </label>
                  {groups.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-4 text-center">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No groups yet</p>
                      <Button type="button" size="sm" onClick={onCreateGroup}>
                        <Plus className="h-4 w-4 mr-1" />
                        Create Group
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                      >
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Title *
                  </label>
                  <Input
                    placeholder="e.g., Dinner at restaurant"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Amount (₹) *
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-2 rounded-xl text-xs font-medium transition-all ${
                          category === cat.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        <span className="block text-base mb-1">{cat.emoji}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>

                {/* Paid By */}
                {members.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Paid by
                    </label>
                    <div className="relative">
                      <select
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                      >
                        {members.map((member) => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.profile?.full_name || member.profile?.email || "Unknown"}
                            {member.user_id === currentUserId && " (You)"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Split Type */}
                {members.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Split
                    </label>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setSplitType("equal")}
                        className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                          splitType === "equal"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        Split Equally
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitType("custom")}
                        className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                          splitType === "custom"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        Custom Split
                      </button>
                    </div>
                    {splitType === "equal" && amount && (
                      <p className="text-sm text-muted-foreground">
                        Each person pays: ₹{(parseFloat(amount) / members.length).toFixed(2)}
                      </p>
                    )}
                    {splitType === "custom" && (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div key={member.user_id} className="flex items-center gap-3">
                            <span className="flex-1 text-sm text-foreground truncate">
                              {member.profile?.full_name || member.profile?.email || "Unknown"}
                            </span>
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
                              className="w-24"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Notes
                  </label>
                  <textarea
                    className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                    placeholder="Any additional notes..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <div className="p-6 border-t border-border shrink-0">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={loading || groups.length === 0 || members.length === 0}
                    onClick={handleSubmit}
                  >
                    {loading ? "Adding..." : "Add Expense"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}