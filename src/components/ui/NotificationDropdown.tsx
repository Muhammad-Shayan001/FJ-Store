"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, CheckCircle2 } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-hover-bg"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-error text-foreground dark:text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-surface-secondary">
            <h3 className="font-heading font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-accent-gold hover:text-accent-gold/80 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 size={14} />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted flex flex-col items-center">
                <Bell size={32} className="opacity-20 mb-3" />
                <p className="text-sm">You have no notifications.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-border last:border-0 hover:bg-hover-bg transition-colors group ${
                      !notif.is_read ? "bg-accent-gold/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notif.is_read ? "text-foreground" : "text-text-secondary"}`}>
                          {notif.title}
                        </p>
                        <p className={`text-xs mt-1 leading-relaxed ${!notif.is_read ? "text-muted" : "text-muted/70"}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted/50 mt-2">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-1 text-success hover:bg-success/10 rounded"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1 text-error hover:bg-error/10 rounded"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border text-center bg-surface-secondary">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                View all in Notification Center
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
