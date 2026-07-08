import { InfoPage } from "@/components/layout/InfoPage";

export default function RefundsPage() {
  return (
    <InfoPage
      title="Refund Policy"
      description="Refunds are processed to the original payment method once the return is approved. If your item arrived damaged or incorrect, contact support right away."
      cta="Contact support"
      ctaHref="mailto:support@fjstore.com"
    />
  );
}
