import { InfoPage } from "@/components/layout/InfoPage";

export default function OrdersPage() {
  return (
    <InfoPage
      title="Order Tracking"
      description="Track your current delivery, review recent orders, and view the status of every purchase in one place. Sign in to access your account history."
      cta="Open your account"
      ctaHref="/account"
    />
  );
}
