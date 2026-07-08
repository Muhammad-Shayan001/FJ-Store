import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export function InfoPage({
  title,
  description,
  cta = "Browse the collection",
  ctaHref = "/shop",
}: {
  title: string;
  description: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <PageContainer maxWidth="md">
      <div className="rounded-3xl border border-border/80 bg-surface/80 p-8 shadow-sm backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-gold">FJ Store</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
        <div className="mt-8">
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-full bg-accent-gold px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-gold/90"
          >
            {cta}
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
