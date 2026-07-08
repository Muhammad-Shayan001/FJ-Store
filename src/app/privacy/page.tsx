import { InfoPage } from "@/components/layout/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      description="We use your information to process orders, improve your experience, and communicate important updates. Personal data is handled with care and stored securely."
      cta="Browse the collection"
      ctaHref="/shop"
    />
  );
}
