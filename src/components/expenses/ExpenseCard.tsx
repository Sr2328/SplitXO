import { motion } from "framer-motion";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Expense, ExpenseCategory } from "@/hooks/useExpenses";
import { format } from "date-fns";

const categoryEmojis: Record<ExpenseCategory, string> = {
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

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  currentUserId: string;
  delay?: number;
}

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  currentUserId,
  delay = 0,
}: ExpenseCardProps) {
  const isPaidByMe = expense.paid_by === currentUserId;
  const payerName = isPaidByMe ? "You" : expense.payer?.full_name || expense.payer?.email || "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-card flex items-center justify-center text-2xl shadow-sm">
          {categoryEmojis[expense.category] || "📦"}
        </div>
        <div>
          <h4 className="font-medium text-foreground">{expense.title}</h4>
          <p className="text-sm text-muted-foreground">
            {payerName} paid • {expense.group?.name || "Unknown group"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-semibold text-foreground">₹{Number(expense.amount).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(expense.expense_date), "MMM d, yyyy")}
          </p>
        </div>

        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(expense)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(expense)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
  );
}
