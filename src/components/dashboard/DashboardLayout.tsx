import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Wallet,
  ArrowRightLeft,
  IndianRupee,
  Compass,
  Search,
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
  { href: "/explore", icon: Compass, label: "explore" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, full_name, email")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();

    // Subscribe to profile changes
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      navigate("/");
    }
  };

  // Get user name from profile or fallback to email
  const userName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  // Get initials
  const nameParts = userName.trim().split(" ");
  let userInitial = "";
  if (nameParts.length === 1) {
    userInitial = nameParts[0].charAt(0).toUpperCase();
  } else {
    userInitial =
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  }

  // Avatar component
  const Avatar = ({ className = "h-10 w-10" }: { className?: string }) => {
    return profile?.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={userName}
        className={cn("rounded-full object-cover shadow-sm", className)}
      />
    ) : (
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm text-sm",
          className
        )}
      >
        {userInitial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-20 bg-white border-r border-gray-100 hidden lg:flex flex-col items-center py-6 gap-8">
        {/* Logo */}
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-xl">S</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col items-center gap-4 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center",
                  isActive
                    ? "bg-gray-100 text-teal-600"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-4 border-t border-gray-200 pt-4">
          <button className="p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
            <Bell className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="p-0 rounded-lg transition-all hover:opacity-80"
            >
              <Avatar className="h-9 w-9" />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-20">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 h-16 shadow-sm">
          <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <span className="text-white font-bold">S</span>
              </div>

              {/* Desktop App name */}
              <h1 className="hidden lg:block text-lg font-bold text-gray-900">
                SplitXo
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 md:gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <NotificationBell />
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="p-0 rounded-lg transition-all hover:opacity-80"
                >
                  <Avatar className="h-9 w-9" />
                </button>

                {profileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 shadow-xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">S</span>
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 block">
                  SplitXo
                </span>
                <span className="text-xs text-gray-500">Split Smart</span>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
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
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-teal-50 text-teal-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-teal-600"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 mb-3">
              <Avatar />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
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