import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Wallet,
  Users,
  TrendingUp,
  Calendar,
  ArrowRightLeft,
  IndianRupee,
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
  const [isExpanded, setIsExpanded] = useState(false);
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

    setTodayExpenses(todayShared);
    setTodayPersonalExpenses(todayPersonal);
    setTotalPersonalExpenseAmount(totalPersonal);
    setTotalSettlements(totalSettlementsCount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "bg-white rounded-2xl border border-gray-200 shadow-lg cursor-pointer transition-all duration-300 overflow-hidden",
          isExpanded ? "shadow-2xl" : "hover:shadow-xl"
        )}
        layout
      >
        {/* Top Expand Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-gradient-to-r from-gray-50 to-gray-100"
            >
              <div className="grid grid-cols-2 gap-2 p-3">
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-500 font-medium">Settlements</p>
                    <p className="text-base font-bold text-teal-600">{totalSettlements}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-500 font-medium">Today</p>
                    <p className="text-base font-bold text-emerald-600">{todayExpenses}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <TrendingUp className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base">Quick Stats</h3>
              <p className="text-[9px] text-gray-500">Click to expand</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Settlements */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-2.5 rounded-xl border border-teal-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <ArrowRightLeft className="h-3 w-3 text-white" />
                </div>
                <p className="text-[9px] font-semibold text-gray-600">Settlements</p>
              </div>
              <p className="text-xl font-bold text-teal-600">{totalSettlements}</p>
            </div>

            {/* Today */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-2.5 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
                <p className="text-[9px] font-semibold text-gray-600">Today</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">{todayExpenses}</p>
            </div>

            {/* Personal */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-2.5 rounded-xl border border-teal-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <Wallet className="h-3 w-3 text-white" />
                </div>
                <p className="text-[9px] font-semibold text-gray-600">Personal</p>
              </div>
              <p className="text-xl font-bold text-teal-600">{personalExpenses.length}</p>
            </div>

            {/* Groups */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-2.5 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-5 w-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <p className="text-[9px] font-semibold text-gray-600">Groups</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">{totalGroups}</p>
            </div>
          </div>
        </div>

        {/* Bottom Expand Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-2 gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-500 font-medium">Personal</p>
                    <p className="text-base font-bold text-teal-600">
                      ₹{totalPersonalExpenseAmount > 999 
                        ? `${(totalPersonalExpenseAmount / 1000).toFixed(1)}k` 
                        : totalPersonalExpenseAmount.toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Users className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-500 font-medium">Total Groups</p>
                    <p className="text-base font-bold text-emerald-600">{totalGroups}</p>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className={cn(
                "py-2.5 text-center text-xs font-bold tracking-wide",
                (todayExpenses > 0 || todayPersonalExpenses > 0)
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  : "bg-gray-200 text-gray-600"
              )}>
                {(todayExpenses > 0 || todayPersonalExpenses > 0)
                  ? "Active Today"
                  : "No Activity"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}