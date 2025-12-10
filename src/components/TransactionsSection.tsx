import { motion } from "framer-motion";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseCard } from "../components/expenses/ExpenseCard";

// Example usage in your component:
export function TransactionsSection({ expenses, user, setAddExpenseOpen, deleteExpense }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.4 }} 
      className="px-4 md:px-6 py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {expenses.length > 0 ? `${expenses.length} transaction${expenses.length > 1 ? 's' : ''}` : 'No transactions yet'}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setAddExpenseOpen(true)}
          className="rounded-full h-11 px-5 shadow-md hover:shadow-lg transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add
        </Button>
      </div>
      
      {/* Transactions List or Empty State */}
      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-6 rounded-2xl bg-muted/30 mb-5">
            <Receipt className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">No transactions yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
            Start tracking your expenses by adding your first transaction
          </p>
          <Button 
            size="lg" 
            onClick={() => setAddExpenseOpen(true)} 
            className="rounded-full shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm px-4 py-2">
          <div className="divide-y divide-border/50">
            {expenses.slice(0, 10).map((expense, i) => (
              <ExpenseCard 
                key={expense.id} 
                expense={expense} 
                currentUserId={user.id} 
                onDelete={(id) => deleteExpense(id)} 
                delay={i * 0.05} 
              />
            ))}
          </div>
          
          {expenses.length > 10 && (
            <div className="text-center py-4 border-t border-border/50 mt-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                View All Transactions
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}