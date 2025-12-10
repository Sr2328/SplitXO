import { motion } from "framer-motion";
import { MoreVertical, Pencil, Trash2, Share2 } from "lucide-react";
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

const categoryColors: Record<ExpenseCategory, string> = {
  food: "bg-orange-50 dark:bg-orange-950/30",
  transport: "bg-blue-50 dark:bg-blue-950/30",
  entertainment: "bg-purple-50 dark:bg-purple-950/30",
  shopping: "bg-pink-50 dark:bg-pink-950/30",
  utilities: "bg-yellow-50 dark:bg-yellow-950/30",
  rent: "bg-green-50 dark:bg-green-950/30",
  travel: "bg-cyan-50 dark:bg-cyan-950/30",
  healthcare: "bg-red-50 dark:bg-red-950/30",
  other: "bg-gray-50 dark:bg-gray-950/30",
};

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onShare?: (expense: Expense) => void;
  currentUserId?: string;
  delay?: number;
}

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onShare,
  currentUserId,
  delay = 0,
}: ExpenseCardProps) {
  const isPaidByMe = currentUserId && expense.paid_by === currentUserId;
  const payerName = isPaidByMe ? "You" : expense.payer?.full_name || expense.payer?.email?.split('@')[0] || "Unknown";
  const isNegative = !isPaidByMe;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between py-4 border-b border-border/40 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-all duration-200 group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar/Icon */}
        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-medium shadow-sm border border-border/50 ${categoryColors[expense.category] || categoryColors.other}`}>
          {isPaidByMe ? (
            <span className="text-2xl">{categoryEmojis[expense.category] || "📦"}</span>
          ) : (
            <span className="text-sm font-bold text-foreground">
              {(expense.payer?.full_name?.[0] || expense.payer?.email?.[0] || "?").toUpperCase()}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm md:text-base truncate">
            {expense.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground truncate">
              {payerName} paid
            </p>
            <span className="text-muted-foreground/50">•</span>
            <p className="text-xs text-muted-foreground truncate">
              {expense.group?.name || "Unknown group"}
            </p>
          </div>
        </div>
      </div>

      {/* Amount and Menu */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className={`font-bold text-base md:text-lg ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
            {isNegative ? '-' : '+'}₹{Number(expense.amount).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(expense.expense_date), "MMM d, yyyy")}
          </p>
        </div>
        
        {(onEdit || onDelete || onShare) && (
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
              {onShare && (
                <DropdownMenuItem onClick={() => onShare(expense)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(expense)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(expense.id)}
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