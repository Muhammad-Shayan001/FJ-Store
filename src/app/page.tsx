import { HeroSection } from "@/components/home/HeroSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CuratedCollections } from "@/components/home/CuratedCollections";
import { CategoryHub } from "@/components/home/CategoryHub";
import { FlashSale } from "@/components/home/FlashSale";
import { BrandStory } from "@/components/home/BrandStory";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { Newsletter } from "@/components/home/Newsletter";
import RecommendedProducts from "@/components/shop/RecommendedProducts";

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      
      <CuratedCollections
        title="Trending Now"
        subtitle="The most coveted pieces defining modern luxury."
        type="featured"
      />
      
      <CategoryHub />
      
      <FlashSale />
      
      <CuratedCollections
        title="New Arrivals"
        subtitle="Be the first to experience our latest masterful creations."
        type="newest"
      />
      
      <RecommendedProducts title="Recommended For You" />
      
      <BrandStory />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </>
  );
}
