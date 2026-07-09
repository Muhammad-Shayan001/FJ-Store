import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const response = await fetch(`/api/admin/orders/${id}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    if (response.status === 401) {
      redirect("/login");
    }

    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Order Not Found</h1>
        <p className="text-muted">The order you are looking for does not exist or you do not have permission to view it.</p>
        {result.error && <p className="text-sm text-red-500 mt-4">{result.error}</p>}
      </div>
    );
  }

  const order = result.data;

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );
}
