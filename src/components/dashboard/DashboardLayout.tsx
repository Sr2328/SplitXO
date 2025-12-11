import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  PlusCircle,
  ChevronRight,
  Search,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/groups", icon: Users, label: "Groups" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
 { href: "/settlements", icon: ArrowRightLeft, label: "Settlements" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      navigate("/");
    }
  };

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border/50 transform transition-transform duration-300 lg:translate-x-0 shadow-sm hidden lg:block"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-border/50">
            <img
              src="https://i.postimg.cc/wv9dQrMw/Gemini-Generated-Image-8a0kyv8a0kyv8a0k-(2).png"
              alt="icon"
              className="h-12 w-12 object-cover"
            />
            <div>
              <span className="font-bold text-xl text-foreground block leading-none">SplitXo</span>
              <span className="text-xs text-muted-foreground">Split Smart, Move Fast.</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="h-2 w-2 rounded-full bg-white"></div>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 pb-20 lg:pb-0">
        {/* Top bar - Desktop & Mobile */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo */}
            <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
              <img
                src="https://i.postimg.cc/wv9dQrMw/Gemini-Generated-Image-8a0kyv8a0kyv8a0k-(2).png"
                alt="icon"
                className="h-8 w-8 object-cover"
              />
              <span className="font-bold text-lg">SplitXo</span>
            </Link>

            {/* Search bar - Desktop only */}
            <div className="hidden lg:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for patients or medicine..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex-1 lg:flex-none" />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-xl hover:bg-muted"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </Button>
              
              {/* Desktop user avatar */}
              <div className="hidden lg:flex items-center gap-2 pl-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {userInitial}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="lg:hidden px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none text-sm"
            />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/50 shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  isActive
                    ? "text-teal-600"
                    : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive && "bg-teal-50"
                )}>
                  <item.icon className={cn("h-5 w-5", isActive && "text-teal-600")} />
                </div>
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border/50 transform transition-transform duration-300 shadow-xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <img
                src="https://i.postimg.cc/wv9dQrMw/Gemini-Generated-Image-8a0kyv8a0kyv8a0k-(2).png"
                alt="icon"
                className="h-12 w-12 object-cover"
              />
              <div>
                <span className="font-bold text-xl text-foreground block leading-none">SplitXo</span>
                <span className="text-xs text-muted-foreground">Split Smart, Move Fast.</span>
              </div>
            </Link>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="h-2 w-2 rounded-full bg-white"></div>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}