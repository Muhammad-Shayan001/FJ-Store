"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { Loader2, Send, Bell } from "lucide-react";
import { format } from "date-fns";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const supabase = createBrowserClient();

  // Form State
  const [targetUser, setTargetUser] = useState("all"); // "all" or userId
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [notifRes, userRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("*, profiles ( full_name )")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("profiles").select("id, full_name").order("full_name"),
    ]);

    if (notifRes.data) setNotifications(notifRes.data);
    if (userRes.data) setUsers(userRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async () => {
    if (!title || !message) {
      alert("Please fill in both title and message.");
      return;
    }

    setSending(true);

    try {
      if (targetUser === "all") {
        // Send notification to all users
        // Since we cannot loop on all users safely in a single batch in some server setups,
        // we can insert a notification for each user profile.
        const inserts = users.map((u) => ({
          user_id: u.id,
          title,
          message,
          is_read: false,
        }));

        const { error } = await supabase.from("notifications").insert(inserts);
        if (error) throw error;
        alert(`Successfully broadcasted notification to ${inserts.length} users!`);
      } else {
        // Send notification to a single user
        const { error } = await supabase.from("notifications").insert({
          user_id: targetUser,
          title,
          message,
          is_read: false,
        });
        if (error) throw error;
        alert("Notification sent successfully!");
      }

      setTitle("");
      setMessage("");
      setTargetUser("all");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface/80 to-surface/40 border border-accent-gold/10 px-6 md:px-10 py-8 rounded-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground dark:text-white mb-2">Notification Center</h1>
        <p className="text-muted">Broadcast global announcements or send direct system alerts to registered users.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-accent-gold" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Bell className="text-accent-gold" size={20} />
                <CardTitle>Send Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Target Audience
                  </label>
                  <select
                    className="w-full bg-surface/50 border border-border rounded-md h-10 px-3 text-foreground dark:text-white focus:outline-none focus:border-accent-gold text-sm"
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                  >
                    <option value="all">Broadcast to All Users</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || "Guest User"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Alert Title
                  </label>
                  <Input
                    placeholder="e.g. System Maintenance"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                    Alert Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-surface/50 border border-border rounded-md p-3 text-foreground dark:text-white focus:outline-none focus:border-accent-gold text-sm"
                    placeholder="Write details of the notification here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button
                  variant="luxury"
                  className="w-full gap-2"
                  disabled={sending || !title || !message}
                  onClick={handleSend}
                >
                  {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* History Logs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notification Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Target User</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Sent Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted py-8">
                          No notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                    {notifications.map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell className="font-medium text-foreground dark:text-white">
                          {notif.profiles?.full_name || <span className="text-muted">Broadcast</span>}
                        </TableCell>
                        <TableCell className="text-accent-gold font-medium">{notif.title}</TableCell>
                        <TableCell className="text-foreground dark:text-white max-w-xs truncate text-xs">
                          {notif.message}
                        </TableCell>
                        <TableCell>
                          {notif.is_read ? (
                            <Badge variant="success">Read</Badge>
                          ) : (
                            <Badge variant="outline">Unread</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted text-xs">
                          {format(new Date(notif.created_at), "MMM d, yyyy h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
