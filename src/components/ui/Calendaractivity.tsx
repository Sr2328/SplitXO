import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Receipt,
  ArrowRightLeft,
  IndianRupee,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Expense {
  id: string;
  amount: number;
  title: string;
  expense_date: string;
  paid_by: string;
  created_by: string;
  user_id: string;
}

interface Settlement {
  id: string;
  amount: number;
  created_at: string;
  paid_by: string;
  paid_to: string;
  notes?: string;
}

interface CalendarActivityProps {
  userId: string;
  allExpenses: Expense[];
}

type ViewMode = "expenses" | "settlements";

export function CalendarActivity({ userId, allExpenses }: CalendarActivityProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("expenses");
  const [myExpenses, setMyExpenses] = useState<Expense[]>([]);
  const [othersExpenses, setOthersExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (selectedDate) {
      fetchDayData(selectedDate);
    }
  }, [selectedDate, viewMode]);

  const fetchDayData = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];

      if (viewMode === "expenses") {
        const myExpensesData = allExpenses.filter(exp => {
          const expDate = new Date(exp.expense_date).toISOString().split('T')[0];
          return expDate === dateStr && exp.created_by === userId;
        });

        const othersExpensesData = allExpenses.filter(exp => {
          const expDate = new Date(exp.expense_date).toISOString().split('T')[0];
          return expDate === dateStr && exp.created_by !== userId && exp.user_id === userId;
        });

        setMyExpenses(myExpensesData);
        setOthersExpenses(othersExpensesData);
      } else {
        const { data, error } = await supabase
          .from("settlements")
          .select("*")
          .or(`paid_by.eq.${userId},paid_to.eq.${userId}`)
          .gte("created_at", `${dateStr}T00:00:00`)
          .lte("created_at", `${dateStr}T23:59:59`);

        if (error) throw error;
        setSettlements(data || []);
      }
    } catch (error) {
      console.error("Error fetching day data:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasActivityOnDate = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    return allExpenses.some(exp => {
      const expDate = new Date(exp.expense_date).toISOString().split('T')[0];
      return expDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const selectDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Calendar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6"
      >
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Select a date</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={previousMonth}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const hasActivity = hasActivityOnDate(day);
              const isTodayDate = isToday(day);
              const isSelectedDate = isSelected(day);

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectDate(day)}
                  className={cn(
                    "aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-semibold transition-all relative",
                    isSelectedDate
                      ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg"
                      : isTodayDate
                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-400"
                      : hasActivity
                      ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {day}
                  {hasActivity && !isSelectedDate && (
                    <span className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-100 border-2 border-emerald-400" />
            <span className="text-[9px] sm:text-[10px] text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-teal-50 relative">
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />
            </div>
            <span className="text-[9px] sm:text-[10px] text-gray-600">Activity</span>
          </div>
        </div>
      </motion.div>

      {/* Activity Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-4 sm:p-6"
      >
        {/* Panel Header with Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              Daily Activity
            </h3>
            {selectedDate && (
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setViewMode("expenses")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all",
                viewMode === "expenses"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Receipt className="h-3.5 w-3.5" />
                Expenses
              </div>
            </button>
            <button
              onClick={() => setViewMode("settlements")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all",
                viewMode === "settlements"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <div className="flex items-center justify-center gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Settlements
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <CalendarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">No Date Selected</p>
              <p className="text-xs text-gray-500">Select a date to view activities</p>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "expenses" ? (
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* My Expenses Section */}
                  {myExpenses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-xs font-bold text-gray-700">My Expenses</p>
                      </div>
                      <div className="space-y-2">
                        {myExpenses.map((expense) => (
                          <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {expense.title}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">You paid</p>
                              </div>
                              <div className="flex items-center gap-1 text-teal-600 font-bold">
                                <IndianRupee className="h-3.5 w-3.5" />
                                <span className="text-sm">{expense.amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Others' Expenses on Me */}
                  {othersExpenses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                          <Users className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-xs font-bold text-gray-700">Others' Expenses</p>
                      </div>
                      <div className="space-y-2">
                        {othersExpenses.map((expense) => (
                          <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {expense.title}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Created by others</p>
                              </div>
                              <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                <IndianRupee className="h-3.5 w-3.5" />
                                <span className="text-sm">{expense.amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {myExpenses.length === 0 && othersExpenses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Receipt className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">No Expenses</p>
                      <p className="text-xs text-gray-500">No expenses recorded on this date</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="settlements"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  {settlements.length > 0 ? (
                    settlements.map((settlement) => (
                      <motion.div
                        key={settlement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-3 rounded-xl",
                          settlement.paid_by === userId
                            ? "bg-gradient-to-r from-rose-50 to-red-50"
                            : "bg-gradient-to-r from-emerald-50 to-teal-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {settlement.paid_by === userId ? "You paid" : "You received"}
                            </p>
                            {settlement.notes && (
                              <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                {settlement.notes}
                              </p>
                            )}
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 font-bold",
                            settlement.paid_by === userId ? "text-rose-600" : "text-emerald-600"
                          )}>
                            <IndianRupee className="h-3.5 w-3.5" />
                            <span className="text-sm">{settlement.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <ArrowRightLeft className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">No Settlements</p>
                      <p className="text-xs text-gray-500">No settlements recorded on this date</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #14b8a6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0d9488;
        }
      `}</style>
    </div>
  );
}