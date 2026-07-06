"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/useAuthStore";

async function fetchNotificationsForUser(userId: string) {
  const response = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || "Failed to load notifications");
  }
  return result.data as Notification[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();
  const supabase = useMemo(() => createBrowserClient(), []);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch notifications on mount
    const fetchNotifications = async () => {
      try {
        const data = await fetchNotificationsForUser(user.id);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      } catch (error) {
        console.error("[NOTIFICATIONS] Error fetching:", error);
      }
    };

    fetchNotifications();

    // Poll for updates every 30 seconds instead of realtime
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user?.id, supabase]);

  const markAsRead = async (id: string) => {
    if (!user?.id) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    const data = await fetchNotificationsForUser(user.id);
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.is_read).length);
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    const data = await fetchNotificationsForUser(user.id);
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.is_read).length);
  };

  const deleteNotification = async (id: string) => {
    if (!user?.id) return;
    await supabase.from("notifications").delete().eq("id", id);
    const data = await fetchNotificationsForUser(user.id);
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.is_read).length);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
