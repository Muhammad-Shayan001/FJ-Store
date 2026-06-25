import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Table, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { format } from "date-fns";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profiles and their order counts
  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      created_at,
      orders ( id )
    `)
    .order("created_at", { ascending: false });

  // Wait, email is not in profiles natively unless joined from auth.users which is restricted.
  // The users table is auth.users. But we can't query auth.users from here using anon client or even auth client unless we have service_role.
  // Since we don't have service_role key here, we rely on the profile table.

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-foreground dark:text-white mb-1">Customer Management</h1>
          <p className="text-muted text-sm">View all registered users.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr className="border-b border-border dark:border-border text-left text-xs uppercase text-muted">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Joined</th>
                  <th className="p-3 font-medium">Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="border-b border-border dark:border-border/50 hover:bg-surface dark:hover:bg-black/5 dark:bg-white/5 transition-colors">
                    <td className="p-3 text-sm text-foreground dark:text-foreground dark:text-white font-medium">
                      {profile.full_name || "Guest User"}
                    </td>
                    <td className="p-3 text-sm text-muted">
                      {format(new Date(profile.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="p-3 text-sm text-foreground dark:text-foreground dark:text-white">
                      {profile.orders?.length || 0}
                    </td>
                  </tr>
                ))}
                {(!profiles || profiles.length === 0) && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-muted">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
