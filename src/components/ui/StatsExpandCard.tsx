import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Wallet,
  Users,
  TrendingUp,
  Calendar,
  ArrowRightLeft,
  IndianRupee,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PersonalExpense {
  id: string;
  amount: number;
  category: string;
  expense_date: string;
  title: string;
  notes: string | null;
  user_id: string;
  created_at: string;
}

interface Settlement {
  id: string;
  amount: number;
  created_at: string;
  group_id: string;
  paid_by: string;
  paid_to: string;
}

interface Expense {
  id: string;
  amount: number;
  expense_date: string;
}

interface StatsExpandCardProps {
  userId: string;
  totalGroups: number;
  allExpenses: Expense[];
}

export function StatsExpandCard({ 
  userId, 
  totalGroups, 
  allExpenses 
}: StatsExpandCardProps) {
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const [todayExpenses, setTodayExpenses] = useState(0);
  const [todayPersonalExpenses, setTodayPersonalExpenses] = useState(0);
  const [totalPersonalExpenseAmount, setTotalPersonalExpenseAmount] = useState(0);
  const [totalSettlements, setTotalSettlements] = useState(0);

  useEffect(() => {
    fetchData();
  }, [userId, allExpenses]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: personalData, error: personalError } = await supabase
        .from("personal_expenses")
        .select("*")
        .eq("user_id", userId)
        .order("expense_date", { ascending: false });

      if (personalError) throw personalError;

      const { data: settlementsData, error: settlementsError } = await supabase
        .from("settlements")
        .select("*")
        .or(`paid_by.eq.${userId},paid_to.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (settlementsError) throw settlementsError;

      setPersonalExpenses(personalData || []);
      setSettlements(settlementsData || []);

      calculateStats(personalData || [], settlementsData || []);
    } catch (error) {
      console.error("Error fetching stats data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    personal: PersonalExpense[], 
    settlementsArr: Settlement[]
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayShared = allExpenses.filter((exp) => {
      const expDate = new Date(exp.expense_date);
      expDate.setHours(0, 0, 0, 0);
      return expDate.getTime() === today.getTime();
    }).length;

    const todayPersonal = personal.filter((exp) => {
      const expDate = new Date(exp.expense_date);
      expDate.setHours(0, 0, 0, 0);
      return expDate.getTime() === today.getTime();
    }).length;

    const totalPersonal = personal.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSettlementsCount = settlementsArr.length;

    setTodayExpenses(todayShared + todayPersonal);
    setTodayPersonalExpenses(todayPersonal);
    setTotalPersonalExpenseAmount(totalPersonal);
    setTotalSettlements(totalSettlementsCount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-10 bg-gray-100 rounded-xl"></div>
          <div className="h-8 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all p-4 sm:p-6 text-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h3 className="font-bold text-base sm:text-lg">Quick Stats</h3>
          </div>
          <p className="text-[10px] sm:text-xs text-emerald-50/70 font-medium">
            Your financial overview
          </p>
        </div>

        {/* Top Pills Row - Personal Amount & Transactions */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Personal Amount */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Personal
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              ₹{totalPersonalExpenseAmount > 999 
                ? `${(totalPersonalExpenseAmount / 1000).toFixed(1)}k` 
                : totalPersonalExpenseAmount.toFixed(0)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1">Total spent</p>
          </motion.div>

          {/* Personal Transactions */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Expenses
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {personalExpenses.length}
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1">Transactions</p>
          </motion.div>
        </div>

        {/* Today's Activity - Full Width */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg mb-3 sm:mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                  Today
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {todayExpenses}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold",
                todayExpenses > 0 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-gray-100 text-gray-600"
              )}>
                {todayExpenses > 0 ? "Active" : "No Activity"}
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-500 mt-1">
                {todayExpenses === 1 ? "transaction" : "transactions"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Settlements */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 border border-white/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="h-6 w-6 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <ArrowRightLeft className="h-3 w-3 text-white" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-wider">
                Settlements
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalSettlements}</p>
          </div>

          {/* Groups */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 border border-white/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="h-6 w-6 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-wider">
                Groups
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalGroups}</p>
          </div>
        </div>

        {/* Performance Indicator */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-200" />
              <p className="text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-wider">
                Activity Score
              </p>
            </div>
            <p className="text-sm sm:text-base font-bold text-white">
              {Math.min(100, (todayExpenses * 10) + (personalExpenses.length * 2))}%
            </p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (todayExpenses * 10) + (personalExpenses.length * 2))}%` 
              }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-300 to-white rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}