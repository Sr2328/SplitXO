import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GroupBalance } from "@/hooks/useGroupBalances";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const settleSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  notes: z.string().max(500).optional(),
});

interface GroupSettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: GroupBalance[];
  groupId: string;
  onSubmit: (paidTo: string, amount: number, notes?: string, receiptUrl?: string) => Promise<void>;
}

export function GroupSettleModal({ 
  isOpen, 
  onClose, 
  balances, 
  groupId, 
  onSubmit 
}: GroupSettleModalProps) {
  const [selectedUser, setSelectedUser] = useState<GroupBalance | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, receiptFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("Please select a person");
      return;
    }

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

    setLoading(true);
    try {
      const receiptUrl = await uploadReceipt();
      await onSubmit(selectedUser.userId, result.data.amount, result.data.notes, receiptUrl || undefined);
      resetForm();
      onClose();
    } catch {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setAmount("");
    setNotes("");
    setReceiptFile(null);
    setReceiptPreview(null);
    setError("");
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
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 z-50 w-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 flex items-center justify-center"
          >
            <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 w-full max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Settle Up</h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {balances.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't owe anyone in this group!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Person */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Pay to *
                    </label>
                    <div className="space-y-2">
                      {balances.map((balance) => (
                        <button
                          key={balance.userId}
                          type="button"
                          onClick={() => {
                            setSelectedUser(balance);
                            setAmount(Math.abs(balance.amount).toString());
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            selectedUser?.userId === balance.userId
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                              {balance.userName[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">{balance.userName}</span>
                          </div>
                          <span className="text-destructive font-semibold">
                            ₹{Math.abs(balance.amount).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedUser && (
                    <>
                      <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-secondary/50">
                        <div className="text-center">
                          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold mx-auto mb-1">
                            You
                          </div>
                          <p className="text-xs text-muted-foreground">You</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <div className="text-center">
                          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold mx-auto mb-1">
                            {selectedUser.userName[0].toUpperCase()}
                          </div>
                          <p className="text-xs text-muted-foreground">{selectedUser.userName}</p>
                        </div>
                      </div>

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

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Notes
                        </label>
                        <Input
                          placeholder="e.g., Paid via UPI"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          maxLength={500}
                        />
                      </div>

                      {/* Receipt Upload */}
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Receipt (Optional)
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {receiptPreview ? (
                          <div className="relative">
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="w-full h-32 object-cover rounded-xl border border-border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptPreview(null);
                              }}
                              className="absolute top-2 right-2 p-1 bg-background/80 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 transition-colors"
                          >
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Upload receipt image</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={loading || !selectedUser}
                    >
                      {loading ? "Recording..." : "Record Payment"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
