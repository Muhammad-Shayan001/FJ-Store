import { HeroSection } from "@/components/home/HeroSection";
import dynamic from "next/dynamic";

const WhyChooseUs = dynamic(() => import("@/components/home/WhyChooseUs").then(mod => mod.WhyChooseUs), { ssr: true });
const CuratedCollections = dynamic(() => import("@/components/home/CuratedCollections").then(mod => mod.CuratedCollections), { ssr: true });
const CategoryHub = dynamic(() => import("@/components/home/CategoryHub").then(mod => mod.CategoryHub), { ssr: true });
const FlashSale = dynamic(() => import("@/components/home/FlashSale").then(mod => mod.FlashSale), { ssr: true });
const BrandStory = dynamic(() => import("@/components/home/BrandStory").then(mod => mod.BrandStory), { ssr: true });
const Testimonials = dynamic(() => import("@/components/home/Testimonials").then(mod => mod.Testimonials), { ssr: true });
const FAQ = dynamic(() => import("@/components/home/FAQ").then(mod => mod.FAQ), { ssr: true });
const Newsletter = dynamic(() => import("@/components/home/Newsletter").then(mod => mod.Newsletter), { ssr: true });
const RecommendedProducts = dynamic(() => import("@/components/shop/RecommendedProducts"), { ssr: true });

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
