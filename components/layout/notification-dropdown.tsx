"use client";

import React, { useContext } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppContext } from "@/components/providers/app-provider";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  XCircle,
  Check
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function NotificationDropdown() {
  const { member } = useContext(AppContext);
  
  const notifications = useQuery(api.audit.getActiveNotificationsByUser, 
    member?.id ? { userId: member.id as Id<"users"> } : "skip"
  );
  
  const clearNotifications = useMutation(api.audit.clearNotifications);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleClear = async () => {
    if (member?.id) {
      await clearNotifications({ userId: member.id as Id<"users"> });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-green-500" size={16} />;
      case "warning": return <AlertTriangle className="text-amber-500" size={16} />;
      case "error": return <XCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer text-gray-600 outline-none transition-colors border-none bg-transparent">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className=" w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 gap-1"
            >
              <Check size={12} />
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="h-[350px] overflow-y-auto overflow-x-hidden custom-scrollbar">

          {notifications === undefined ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="text-gray-300" size={24} />
              </div>
              <p className="text-sm font-medium text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">No new notifications at this time.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`p-4 transition-colors ${n.isRead ? 'bg-white opacity-60' : 'bg-primary/5 hover:bg-primary/10'}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="p-3 border-t border-gray-100">
          <Button variant="ghost" className="w-full text-xs text-gray-500 hover:text-gray-900 h-8">
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
