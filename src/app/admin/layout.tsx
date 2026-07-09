import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role?.toString().toLowerCase();
  const userEmail = user.email?.toLowerCase() || "";
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";
  const isAdmin =
    role === "admin" ||
    role === "superadmin" ||
    role === "owner" ||
    (adminEmail !== "" && userEmail === adminEmail);

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
