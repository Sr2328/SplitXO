import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  ArrowRightLeft,
  IndianRupee,
  Compass,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface Profile {
  avatar_url: string | null;
  full_name: string | null;
  email: string | null;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/groups", icon: Users, label: "Groups" },
  { href: "/expenses", icon: IndianRupee, label: "Expenses" },
  { href: "/settlements", icon: ArrowRightLeft, label: "Settlements" },
  { href: "/personal-expenses", icon: Wallet, label: "Personal" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const mobileNavItems = navItems.slice(0, 5);

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, full_name, email")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Failed to sign out");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An error occurred during sign out");
    }
  };

  const userName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  const userEmail = profile?.email || user.email || "";

  const nameParts = userName.trim().split(" ");
  let userInitial = "";
  if (nameParts.length === 1) {
    userInitial = nameParts[0].charAt(0).toUpperCase();
  } else {
    userInitial =
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  }

  const Avatar = ({ className = "h-10 w-10" }: { className?: string }) => {
    return profile?.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={userName}
        className={cn("rounded-full object-cover", className)}
      />
    ) : (
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold",
          className
        )}
      >
        {userInitial}
      </div>
    );
  };

  const Logo = ({ className = "h-8 w-8" }: { className?: string }) => {
    const logoUrl = import.meta.env.VITE_APP_LOGO_URL || 
      "https://i.postimg.cc/MH3PZrq3/Green-Simple-Grocery-Store-Logo-(1).png";
    
    return (
      <img
        src={logoUrl}
        alt="SplitXO Logo"
        className={cn("object-contain", className)}
      />
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 hidden lg:flex flex-col transition-all duration-300 ease-in-out shadow-sm",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          {!sidebarCollapsed ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-3">
                <Logo className="h-8 w-8" />
                <div>
                  <span className="font-bold text-lg text-gray-900 block leading-tight">
                    SplitXO
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">Split Smart</span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link to="/dashboard" className="flex items-center justify-center w-full">
              <Logo className="h-8 w-8" />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-teal-600")} />
                {!sidebarCollapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
                
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-100 space-y-3 flex-shrink-0 bg-white">
          {/* Upgrade Card */}
          {!sidebarCollapsed && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-bold text-sm">Upgrade Now</span>
                </div>
                <p className="text-xs text-emerald-50 mb-3">
                  Unlock premium features and get unlimited access
                </p>
                <button className="w-full bg-white text-teal-600 rounded-lg py-2 px-3 text-xs font-semibold hover:bg-emerald-50 transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}

          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center"
              title="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
          
          {/* User Profile */}
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <Avatar className="h-9 w-9" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-9 w-9" />
            </div>
          )}
          
          {/* Sign Out Button */}
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg h-9"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className={cn(
        "h-screen flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Top Header - Enhanced */}
        <header className="h-16 bg-white shadow-sm flex-shrink-0 z-30 border-b border-gray-100">
          <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <Link to="/dashboard" className="flex items-center gap-2.5">
                <Logo className="h-9 w-9" />
                <div className="hidden sm:block">
                  <span className="font-bold text-lg text-gray-900 block leading-tight">
                    SplitXO
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">Split expenses smart</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <NotificationBell />
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-200">
                <Avatar className="h-8 w-8" />
                <div className="hidden xl:block">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight truncate max-w-[150px]">
                    {userEmail}
                  </p>
                </div>
              </div>
              <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Avatar className="h-8 w-8" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content with proper spacing for floating nav */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 md:p-6 lg:p-8 pb-28 lg:pb-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <Logo className="h-8 w-8" />
            <div>
              <span className="font-bold text-lg text-gray-900 block leading-tight">
                SplitXO
              </span>
              <span className="text-[10px] text-gray-500 leading-tight">Split Smart</span>
            </div>
          </Link>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-teal-600")} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200 space-y-3 flex-shrink-0">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold text-sm">Upgrade Now</span>
              </div>
              <p className="text-xs text-emerald-50 mb-3">
                Unlock premium features
              </p>
              <button className="w-full bg-white text-teal-600 rounded-lg py-2 px-3 text-xs font-semibold hover:bg-emerald-50 transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Avatar className="h-9 w-9" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userEmail}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg h-9"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Floating Mobile Bottom Navigation - Android Style */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <div className="bg-white rounded-full shadow-2xl border border-gray-200 px-2 py-3">
          <div className="flex items-center justify-around">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-full transition-all duration-200 relative",
                    isActive
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white scale-110 shadow-lg shadow-emerald-500/30"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                </Link>
              );
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center p-3 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <Menu className="h-5 w-5 flex-shrink-0" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}