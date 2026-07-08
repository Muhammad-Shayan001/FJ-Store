import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import Link from "next/link";

const CATEGORY_TITLES: Record<string, string> = {
  cosmetics: "Luxury Cosmetics",
  jewelry: "Heritage Jewelry",
  food: "Gourmet Delicacies",
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <PageContainer maxWidth="md">
      <div className="rounded-3xl border border-border/80 bg-surface/80 p-8 shadow-sm backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-gold">FJ Store</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">
          {CATEGORY_TITLES[(params as any).slug] || "Category"}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Discover curated products in this collection and explore the latest arrivals for your lifestyle.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="rounded-full bg-accent-gold px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-gold/90">
            Browse products
          </Link>
          <Link href="/shop" className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent-gold">
            View all collections
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
