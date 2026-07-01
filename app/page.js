import HeroSection      from "@/components/home/HeroSection";
import WhoWeServe       from "@/components/home/WhoWeServe";
import FeaturesSection  from "@/components/home/FeaturesSection";
import VerifiedIdentity from "@/components/home/VerifiedIdentity";
import FAQSection       from "@/components/home/FAQSection";
import FinalCTA         from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      <HeroSection />
      <WhoWeServe />
      <FeaturesSection />
      <VerifiedIdentity />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}