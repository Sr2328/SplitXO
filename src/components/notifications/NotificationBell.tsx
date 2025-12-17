import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    const data = notification.data as Record<string, any> | null;
    if (data) {
      if (notification.type === "expense_created" && data.expense_id) {
        navigate(`/expenses/${data.expense_id}`);
        setOpen(false);
      } else if (notification.type === "settlement_received" && data.group_id) {
        navigate(`/groups/${data.group_id}`);
        setOpen(false);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "settlement_received":
        return "💰";
      case "expense_created":
        return "📝";
      case "group_invite":
        return "👥";
      default:
        return "🔔";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold shadow-md animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[90vw] sm:w-96 p-0 border-gray-200 shadow-xl rounded-2xl" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-50 rounded-lg">
              <Bell className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[300px] sm:h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
              <div className="p-4 bg-gray-100 rounded-full mb-3">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No notifications yet</p>
              <p className="text-xs text-gray-500">We'll notify you when something arrives</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-3 sm:px-4 py-3 sm:py-4 cursor-pointer transition-all relative group",
                    "hover:bg-gray-50",
                    !notification.is_read && "bg-teal-50/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                        !notification.is_read ? "bg-teal-100" : "bg-gray-100"
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={cn(
                        "text-sm leading-snug mb-1",
                        !notification.is_read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                        {!notification.is_read && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-medium rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <button
                          className="p-1.5 hover:bg-teal-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5 text-teal-600" />
                        </button>
                      )}
                      <button
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.is_read && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-teal-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer - only show if there are notifications */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button 
              className="w-full text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
              onClick={() => {
                setOpen(false);
                // Navigate to notifications page if you have one
                // navigate('/notifications');
              }}
            >
              View all notifications
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}


