import { InfoPage } from "@/components/layout/InfoPage";

export default function WishlistPage() {
  return (
    <InfoPage
      title="Wishlist"
      description="Save your favorite pieces and revisit them anytime. Sign in to keep your wishlist synced across devices and be notified about restocks."
      cta="Browse the collection"
      ctaHref="/shop"
    />
  );
}
