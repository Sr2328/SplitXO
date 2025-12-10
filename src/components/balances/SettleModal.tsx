import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
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

    setLoading(true);
    try {
      await onSubmit(selectedGroupId, balance.userId, result.data.amount, result.data.notes);
      setAmount("");
      setNotes("");
      onClose();
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  if (!balance) return null;

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl pointer-events-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* Left Side - Success Message */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-10 flex flex-col items-center justify-center text-center border-r border-gray-200">
                    <div className="mb-6">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-lg">
                        <Check className="h-10 w-10 text-white stroke-[3]" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Settlement is on its way!
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                      We've recorded your payment and are just waiting for confirmation to mark it as settled.
                    </p>
                    
                    <div className="mt-8 w-full space-y-3">
                      <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        {loading ? "Recording..." : "Confirm Settlement"}
                      </Button>
                      
                      <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Right Side - Settlement Details */}
                  <div className="bg-white p-8 md:p-10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Settlement Summary</h2>
                      <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Payer Info */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                          Paying To
                        </label>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {balance.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{balance.userName}</span>
                        </div>
                      </div>

                      {/* Group Selection */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                          Group
                        </label>
                        <select
                          value={selectedGroupId}
                          onChange={(e) => setSelectedGroupId(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select a group</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                          Amount (₹)
                        </label>
                        <Input
                          type="number"
                          placeholder={Math.abs(balance.amount).toFixed(2)}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          className="text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          Outstanding balance: ₹{Math.abs(balance.amount).toFixed(2)}
                        </p>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                          Notes (Optional)
                        </label>
                        <Input
                          placeholder="e.g., Paid via UPI"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          maxLength={500}
                          className="text-sm"
                        />
                      </div>

                      {/* Total */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Total Settlement</span>
                          <span className="text-2xl font-bold text-emerald-600">
                            ₹{amount || "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}