import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Balance } from "@/hooks/useBalances";
import { Group } from "@/hooks/useGroups";
import { z } from "zod";

const settleSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  notes: z.string().max(500).optional(),
});

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: Balance | null;
  groups: Group[];
  onSubmit: (groupId: string, paidTo: string, amount: number, notes?: string) => Promise<void>;
}

export function SettleModal({ isOpen, onClose, balance, groups, onSubmit }: SettleModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Progressive form state
  const showGroupSelect = selectedGroupId === "";
  const showAmountInput = selectedGroupId !== "" && amount === "";
  const showNotesInput = selectedGroupId !== "" && amount !== "";
  const showConfirmation = selectedGroupId !== "" && amount !== "" && parseFloat(amount) > 0;

  const handleSubmit = async () => {
    if (!balance) return;
    
    setError("");
    const numAmount = parseFloat(amount);

    const result = settleSchema.safeParse({
      amount: numAmount,
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

    if (numAmount > Math.abs(balance.amount)) {
      setError("Amount cannot exceed outstanding balance");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedGroupId, balance.userId, result.data.amount, result.data.notes);
      
      // Reset form
      setAmount("");
      setSelectedGroupId("");
      setNotes("");
      setError("");
      onClose();
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAmount("");
    setSelectedGroupId("");
    setNotes("");
    setError("");
  };

  if (!balance) return null;

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-lg mx-auto pointer-events-auto px-4 pb-4 sm:p-0"
            >
              <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-teal-50 to-emerald-50">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Settle Payment</h2>
                    <p className="text-sm text-gray-600 mt-0.5">Record your settlement</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                  <div className="p-6 space-y-6">
                    {/* Payer Info - Always visible */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                        Paying To
                      </label>
                      <div className="flex items-center gap-3 p-4 rounded-xl
  bg-gradient-to-r from-[#ef473a]/10 to-[#cb2d3e]/10
  border-2 border-[#ef473a]/40
">
  <div className="h-12 w-12 rounded-full
    bg-gradient-to-r from-[#ef473a] to-[#cb2d3e]
    flex items-center justify-center
    text-white font-bold text-lg
    flex-shrink-0 shadow-md
  ">

                          {balance.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-lg">{balance.userName}</p>
                          <p className="text-sm text-gray-600">
                            Outstanding: <span className="font-semibold text-purple-600">₹{Math.abs(balance.amount).toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Group Selection */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                          1. Select Group
                        </label>
                        <div className="relative">
                          <select
                            value={selectedGroupId}
                            onChange={(e) => {
                              setSelectedGroupId(e.target.value);
                              setError("");
                            }}
                            className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3.5 pr-10 text-base text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none cursor-pointer hover:border-gray-400"
                            disabled={loading}
                          >
                            <option value="">Choose a group...</option>
                            {groups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none rotate-90" />
                        </div>
                        {selectedGroup && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-teal-600 mt-2 flex items-center gap-1"
                          >
                            <Check className="h-4 w-4" />
                            Selected: {selectedGroup.name}
                          </motion.p>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Amount Input */}
                    <AnimatePresence mode="wait">
                      {!showGroupSelect && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                            2. Enter Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                              ₹
                            </span>
                            <Input
                              type="number"
                              placeholder={Math.abs(balance.amount).toFixed(2)}
                              value={amount}
                              onChange={(e) => {
                                setAmount(e.target.value);
                                setError("");
                              }}
                              min="0"
                              step="0.01"
                              disabled={loading}
                              className="w-full text-2xl font-bold pl-12 pr-4 py-4 rounded-xl border-2"
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2 text-sm">
                            <span className="text-gray-500">Maximum amount</span>
                            <button
                              onClick={() => setAmount(Math.abs(balance.amount).toFixed(2))}
                              className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
                            >
                              Use full amount
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Notes Input */}
                    <AnimatePresence mode="wait">
                      {showNotesInput && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                            3. Add Notes (Optional)
                          </label>
                          <textarea
                            placeholder="e.g., Paid via UPI, Google Pay transaction..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={500}
                            rows={3}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none text-base"
                          />
                          <p className="text-xs text-gray-500 mt-1.5 text-right">
                            {notes.length}/500 characters
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Confirmation Section */}
                    <AnimatePresence mode="wait">
                      {showConfirmation && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: 0.1 }}
                          className="pt-4"
                        >
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-300 shadow-md">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Check className="h-7 w-7 text-white stroke-[3]" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">Ready to settle!</h3>
                                <p className="text-sm text-gray-600">Review and confirm your payment details</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t-2 border-emerald-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Group</span>
                                <span className="font-semibold text-gray-900">{selectedGroup?.name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Recipient</span>
                                <span className="font-semibold text-gray-900">{balance.userName}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t-2 border-emerald-200">
                                <span className="text-base text-gray-700 font-medium">Settlement Amount</span>
                                <span className="text-3xl font-bold text-emerald-600">
                                  ₹{parseFloat(amount).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error Message */}
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-4 rounded-xl bg-red-50 border-2 border-red-200"
                        >
                          <p className="text-sm text-red-700 font-medium">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t-2 border-gray-200 space-y-3 flex-shrink-0 bg-gray-50">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !selectedGroupId || !amount || parseFloat(amount) <= 0}
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Recording Settlement...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5" />
                        Confirm Settlement
                      </span>
                    )}
                  </Button>
                  
                  {(selectedGroupId || amount || notes) && !loading && (
                    <button
                      onClick={handleReset}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-3 transition-colors hover:bg-gray-100 rounded-lg"
                    >
                      Reset Form
                    </button>
                  )}
                  
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}