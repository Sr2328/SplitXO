import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MessageCircle, Copy, Check, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Expense, ExpenseSplit } from "@/hooks/useExpenses";
import { GroupMember } from "@/hooks/useGroups";
import { toast } from "sonner";

interface ShareReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense & {
    group?: { name: string; description?: string } | null;
  } | null;
  members: GroupMember[];
  splits?: ExpenseSplit[];
}

export function ShareReceiptModal({
  isOpen,
  onClose,
  expense,
  members,
  splits = [],
}: ShareReceiptModalProps) {
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  if (!expense) return null;

  const categoryEmoji: Record<string, string> = {
    food: "🍔",
    transport: "🚗",
    entertainment: "🎬",
    shopping: "🛍️",
    utilities: "💡",
    rent: "🏠",
    travel: "✈️",
    healthcare: "🏥",
    other: "📦",
  };

  const receiptMessage = `SplitXo - Expense Receipt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ${categoryEmoji[expense.category as keyof typeof categoryEmoji] || "📦"} ${expense.title}
₹${expense.amount.toFixed(2)} • ${new Date(expense.expense_date).toLocaleDateString()}

🏢 Group: ${expense.group?.name || "Unknown"}
👤 Paid by: ${expense.payer?.full_name || "Unknown"}
${expense.notes ? `📝 Notes: ${expense.notes}` : ""}

${
  splits.length > 0
    ? "Split Details:\n" + splits.map((s) => `  • ${s.profile?.full_name || "Unknown"}: ₹${Number(s.amount).toFixed(2)}`).join("\n")
    : ""
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Manage your expenses with SplitXo`;

  const generatePDF = async () => {
    setGeneratingPDF(true);
    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 12;
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;

      // ============ HEADER ============
      pdf.setFillColor(5, 150, 105); // Teal color
      pdf.rect(margin, yPosition, contentWidth, 22, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, "bold");
      pdf.text("SplitXo", pageWidth / 2, yPosition + 9, { align: "center" });

      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.text("Split Smart, Move Fast", pageWidth / 2, yPosition + 16, { align: "center" });

      yPosition += 30;

      // ============ EXPENSE SECTION ============
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont(undefined, "bold");
      pdf.text("EXPENSE", margin, yPosition);

      yPosition += 8;

      // Title
      pdf.setTextColor(20, 20, 20);
      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text(expense.title.toUpperCase(), margin, yPosition);

      yPosition += 10;

      // Amount
      pdf.setTextColor(5, 150, 105);
      pdf.setFontSize(32);
      pdf.setFont(undefined, "bold");
      pdf.text(`₹${Number(expense.amount).toFixed(2)}`, margin, yPosition);

      yPosition += 12;

      // Date
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.text(
        new Date(expense.expense_date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        margin,
        yPosition
      );

      yPosition += 10;

      // Divider
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += 8;

      // ============ DETAILS SECTION ============
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont(undefined, "bold");
      pdf.text("DETAILS", margin, yPosition);

      yPosition += 7;

      // Group
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      pdf.text("Group:", margin, yPosition);
      pdf.setTextColor(20, 20, 20);
      pdf.setFont(undefined, "bold");
      pdf.text(expense.group?.name || "Unknown Group", margin + 25, yPosition);

      yPosition += 6;

      // Paid by
      pdf.setTextColor(120, 120, 120);
      pdf.setFont(undefined, "normal");
      pdf.text("Paid by:", margin, yPosition);
      pdf.setTextColor(20, 20, 20);
      pdf.setFont(undefined, "bold");
      pdf.text(expense.payer?.full_name || "Unknown", margin + 25, yPosition);

      yPosition += 8;

      // Divider
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);

      yPosition += 8;

      // ============ SPLITS SECTION ============
      if (splits && splits.length > 0) {
        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(9);
        pdf.setFont(undefined, "bold");
        pdf.text(`SPLIT DETAILS (${splits.length} ${splits.length === 1 ? "person" : "people"})`, margin, yPosition);

        yPosition += 7;

        const totalSplit = splits.reduce((sum, s) => sum + Number(s.amount || 0), 0);

        // Table headers
        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(8);
        pdf.setFont(undefined, "bold");
        pdf.text("Member", margin + 2, yPosition);
        pdf.text("Amount", pageWidth - margin - 30, yPosition, { align: "left" });

        yPosition += 5;
        pdf.setLineWidth(0.2);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 4;

        // Split rows
        splits.forEach((split, index) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 15;
          }

          pdf.setTextColor(20, 20, 20);
          pdf.setFont(undefined, "normal");
          pdf.setFontSize(9);
          const nameText = split.profile?.full_name || "Unknown";
          pdf.text(nameText, margin + 2, yPosition);

          pdf.setTextColor(5, 150, 105);
          pdf.setFont(undefined, "bold");
          pdf.text(`₹${Number(split.amount).toFixed(2)}`, pageWidth - margin - 30, yPosition);

          yPosition += 5.5;
        });

        // Total row
        yPosition += 2;
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        pdf.setTextColor(5, 150, 105);
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(10);
        pdf.text("TOTAL", margin + 2, yPosition);
        pdf.text(`₹${totalSplit.toFixed(2)}`, pageWidth - margin - 30, yPosition);

        yPosition += 8;
      }

      // ============ NOTES SECTION ============
      if (expense.notes) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 15;
        }

        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 7;

        pdf.setTextColor(80, 80, 80);
        pdf.setFontSize(9);
        pdf.setFont(undefined, "bold");
        pdf.text("NOTES", margin, yPosition);

        yPosition += 5;
        pdf.setTextColor(20, 20, 20);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(9);
        const notesLines = pdf.splitTextToSize(expense.notes, contentWidth - 4);
        pdf.text(notesLines, margin + 2, yPosition);

        yPosition += notesLines.length * 5 + 3;
      }

      // ============ FOOTER ============
      pdf.setTextColor(180, 180, 180);
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(7);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString("en-IN")} at ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
        pageWidth / 2,
        pageHeight - 7,
        { align: "center" }
      );

      const fileName = `Receipt_${expense.title.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      toast.success("✓ Receipt PDF downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF generation failed. Try copying details instead.");
    } finally {
      setGeneratingPDF(false);
    }
  };

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

  const handleWhatsAppShare = async () => {
    if (members.length === 0) {
      toast.error("No members to share with");
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
    window.open(
      `mailto:${selectedMember.profile.email}?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Expense Receipt: ${expense.title}`,
          text: receiptMessage,
        });
      } else {
        toast.info("Share feature not available on your device");
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-lg max-h-[95vh] overflow-y-auto rounded-3xl bg-white"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Share Receipt</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-5">

                {/* Expense Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-5 border border-gray-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl sm:text-3xl">
                      {categoryEmoji[expense.category as keyof typeof categoryEmoji] || "📦"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {expense.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {expense.group?.name || "Unknown Group"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/70 rounded-xl p-2.5 sm:p-3">
                      <p className="text-xs text-gray-600 font-medium">Amount</p>
                      <p className="text-lg sm:text-xl font-bold text-teal-600 mt-1">
                        ₹{expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-2.5 sm:p-3">
                      <p className="text-xs text-gray-600 font-medium">Date</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">
                        {new Date(expense.expense_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600 font-medium mb-1">Paid by</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {expense.payer?.full_name || "Unknown"}
                    </p>
                  </div>
                </motion.div>

                {/* Splits Preview */}
                {splits && splits.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-blue-50 rounded-2xl p-4 sm:p-5 border border-blue-200"
                  >
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                      Split Details ({splits.length})
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {splits.map((split, index) => (
                        <div
                          key={split.id || index}
                          className="flex items-center justify-between bg-white/60 rounded-lg p-3 text-sm"
                        >
                          <p className="font-medium text-gray-900 truncate">
                            {split.profile?.full_name || "Unknown"}
                          </p>
                          <p className="font-bold text-teal-600 flex-shrink-0 ml-2">
                            ₹{Number(split.amount).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Select Member for Email */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide mb-2.5 block">
                    Send to member (for email)
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {members.length > 0 ? (
                      members.map((member) => (
                        <motion.button
                          key={member.user_id || member.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setSelectedMember(member)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                            selectedMember?.user_id === member.user_id ||
                            selectedMember?.id === member.id
                              ? "border-teal-500 bg-teal-50 shadow-md"
                              : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {(
                              member.profile?.full_name ||
                              member.profile?.email ||
                              "?"
                            )[0].toUpperCase()}
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {member.profile?.full_name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {member.profile?.email}
                            </p>
                          </div>
                          {(selectedMember?.user_id === member.user_id ||
                            selectedMember?.id === member.id) && (
                            <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                          )}
                        </motion.button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No members available
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Share Options */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2.5 pt-2"
                >
                  <Button
                    onClick={handleWhatsAppShare}
                    className="w-full justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Share via WhatsApp
                  </Button>

                  <Button
                    onClick={handleEmailShare}
                    disabled={!selectedMember}
                    className="w-full justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <Mail className="h-5 w-5" />
                    Share via Email
                  </Button>

                  <Button
                    onClick={handleNativeShare}
                    className="w-full justify-center gap-2.5 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Share via Android/iOS
                  </Button>

                  <Button
                    onClick={generatePDF}
                    disabled={generatingPDF}
                    className="w-full justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Download className="h-5 w-5" />
                    {generatingPDF ? "Generating..." : "Download PDF"}
                  </Button>

                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="w-full justify-center gap-2.5 border-gray-300 text-gray-900 font-semibold py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        Copy Details
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 py-2.5 rounded-xl transition-colors"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Receipt PDF Component
function ReceiptPDF({
  expense,
  splits,
  categoryEmoji,
}: {
  expense: any;
  splits: any[];
  categoryEmoji: Record<string, string>;
}) {
  const totalSplit = splits.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  return (
    <div
      style={{
        width: "400px",
        backgroundColor: "#ffffff",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>
          SplitXo
        </div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>Split Smart, Move Fast</div>
      </div>

      {/* Expense Title & Amount */}
      <div
        style={{
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "32px" }}>
            {categoryEmoji[expense.category as keyof typeof categoryEmoji] || "📦"}
          </div>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>
            {expense.title}
          </div>
        </div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#059669",
            marginBottom: "12px",
          }}
        >
          ₹{Number(expense.amount).toFixed(2)}
        </div>
        <div style={{ fontSize: "13px", color: "#6b7280" }}>
          {new Date(expense.expense_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Details */}
      <div
        style={{
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "16px",
          marginBottom: "16px",
          fontSize: "13px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Group
          </div>
          <div style={{ color: "#111827", fontWeight: "600", marginTop: "6px", fontSize: "14px" }}>
            {expense.group?.name || "Unknown Group"}
          </div>
        </div>
        <div>
          <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Paid By
          </div>
          <div style={{ color: "#111827", fontWeight: "600", marginTop: "6px", fontSize: "14px" }}>
            {expense.payer?.full_name || "Unknown"}
          </div>
        </div>
      </div>

      {/* Splits */}
      {splits && splits.length > 0 && (
        <div
          style={{
            background: "#eff6ff",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #bfdbfe",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#1e40af", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Split Details ({splits.length} {splits.length === 1 ? "person" : "people"})
          </div>
          <div style={{ fontSize: "13px" }}>
            {splits.map((split, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: index < splits.length - 1 ? "1px solid #bfdbfe" : "none",
                }}
              >
                <span style={{ color: "#111827", fontWeight: "500" }}>
                  {split.profile?.full_name || "Unknown"}
                </span>
                <span style={{ color: "#059669", fontWeight: "700", fontSize: "14px" }}>
                  ₹{Number(split.amount).toFixed(2)}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "10px",
                marginTop: "10px",
                borderTop: "2px solid #bfdbfe",
                fontWeight: "700",
                color: "#059669",
              }}
            >
              <span>Total Split</span>
              <span style={{ fontSize: "16px" }}>₹{totalSplit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {expense.notes && (
        <div
          style={{
            background: "#fef3c7",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "16px",
            border: "1px solid #fcd34d",
            fontSize: "12px",
            color: "#92400e",
          }}
        >
          <strong>Notes:</strong> {expense.notes}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: "11px",
          color: "#6b7280",
          borderTop: "1px solid #e5e7eb",
          paddingTop: "16px",
        }}
      >
        <div>Generated on {new Date().toLocaleDateString("en-IN")}</div>
        <div style={{ marginTop: "6px", fontWeight: "500" }}>SplitXo • Smart Expense Management</div>
      </div>
    </div>
  );
}