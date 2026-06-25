import { HeroSection } from "@/components/home/HeroSection";
import { CategoryHub } from "@/components/home/CategoryHub";
import { CuratedCollections } from "@/components/home/CuratedCollections";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import RecommendedProducts from "@/components/shop/RecommendedProducts";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CuratedCollections
        title="Curated Collections"
        subtitle="A refined selection of our finest products, styled for elegant living."
        type="featured"
      />
      <CategoryHub />
      <CuratedCollections
        title="A Legacy of Excellence"
        subtitle="Signature essentials and timeless luxuries chosen for discerning tastes."
        type="newest"
      />
      <RecommendedProducts title="Recommended For You" />
      <Testimonials />
      <Newsletter />
    </>
  );
}
