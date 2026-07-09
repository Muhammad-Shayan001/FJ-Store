"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === "undefined") {
      setErrorMessage("No valid order ID was provided.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${id}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok || !result?.success) {
          setErrorMessage(result?.error || "Unable to load order.");
          setLoading(false);
          return;
        }

        setOrder(result.data);
      } catch (error) {
        if ((error as any)?.name === "AbortError") {
          return;
        }
        setErrorMessage("Failed to load order. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();

    return () => controller.abort();
  }, [id, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Loading order...</h1>
        <p className="text-muted">Please wait while the order details are loaded.</p>
      </div>
    );
  }

  if (!id || errorMessage) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Unable to load order</h1>
        <p className="text-muted">No valid order ID was provided or the order could not be loaded. Please go back to the orders list and try again.</p>
        {errorMessage && <p className="text-sm text-red-500 mt-4">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );
}
