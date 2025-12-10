import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Balance } from "@/hooks/useBalances";

interface BalanceCardProps {
  balance: Balance;
  onSettle?: (balance: Balance) => void;
  delay?: number;
}

export function BalanceCard({ balance, onSettle, delay = 0 }: BalanceCardProps) {
  const isOwed = balance.amount > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl ${
        isOwed ? "bg-success/10" : "bg-destructive/10"
      }`}
    >
      {/* User Info Section */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs sm:text-sm flex-shrink-0">
          {balance.userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm sm:text-base truncate">{balance.userName}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{balance.userEmail}</p>
        </div>
      </div>

      {/* Amount and Action Section */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 flex-shrink-0">
        <div className="text-left sm:text-right">
          <p
            className={`font-semibold text-base sm:text-lg ${
              isOwed ? "text-success" : "text-destructive"
            }`}
          >
            {isOwed ? "+" : "-"}₹{Math.abs(balance.amount).toFixed(2)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
            {isOwed ? "owes you" : "you owe"}
          </p>
        </div>
        
        {!isOwed && onSettle && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSettle(balance)}
            className="gap-1 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm flex-shrink-0 whitespace-nowrap"
          >
            <span className="hidden xs:inline">Settle</span>
            <span className="xs:hidden">Pay</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}