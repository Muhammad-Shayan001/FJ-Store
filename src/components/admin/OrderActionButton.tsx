"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui";

interface OrderActionButtonProps {
  orderId: string;
}

export function OrderActionButton({ orderId }: OrderActionButtonProps) {
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 w-8 p-0"
      onClick={() => router.push(`/admin/orders/${orderId}`)}
      aria-label={`View order ${orderId}`}
    >
      <Eye size={16} />
    </Button>
  );
}
