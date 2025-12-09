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
      className={`flex items-center justify-between p-4 rounded-xl ${
        isOwed ? "bg-success/10" : "bg-destructive/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
          {balance.userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-foreground">{balance.userName}</p>
          <p className="text-xs text-muted-foreground">{balance.userEmail}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p
            className={`font-semibold ${
              isOwed ? "text-success" : "text-destructive"
            }`}
          >
            {isOwed ? "+" : "-"}₹{Math.abs(balance.amount).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {isOwed ? "owes you" : "you owe"}
          </p>
        </div>
        {!isOwed && onSettle && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSettle(balance)}
            className="gap-1"
          >
            Settle
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
