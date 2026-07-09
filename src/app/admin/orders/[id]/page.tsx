import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  let result: any = null;
  let response: Response | null = null;

  try {
    response = await fetch(`/api/admin/orders/${id}`, {
      method: "GET",
      headers: headers(),
      cache: "no-store",
    });

    result = await response.json();
  } catch (error) {
    console.error("[ADMIN ORDER PAGE] Failed to load order details:", error);
  }

  if (!response || !response.ok || !result?.success) {
    if (response?.status === 401) {
      redirect("/login");
    }

    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Unable to load order</h1>
        <p className="text-muted">We could not load the selected order. Please refresh or try again later.</p>
        {result?.error && <p className="text-sm text-red-500 mt-4">{result.error}</p>}
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
