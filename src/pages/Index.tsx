import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import VideoDemo from "@/components/VideoDemo";
import HowItWorks from "@/components/HowItWorks";
import InteractivePreview from "@/components/InteractivePreview";
import Industries from "@/components/Industries";
import ROICalculator from "@/components/ROICalculator";
import ComparisonTable from "@/components/ComparisonTable";
import Integrations from "@/components/Integrations";
import SocialProof from "@/components/SocialProof";
import SuccessStories from "@/components/SuccessStories";
import TrustSection from "@/components/TrustSection";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";
import ContactForm from "@/components/ContactForm";
import LiveSupport from "@/components/LiveSupport";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div id="inicio">
        <Hero />
      </div>
      <Stats />
      <div id="funciones">
        <Features />
      </div>
      <VideoDemo />
      <InteractivePreview />
      <HowItWorks />
      <div id="sectores">
        <Industries />
      </div>
      <ROICalculator />
      <ComparisonTable />
      <Integrations />
      <SocialProof />
      <SuccessStories />
      <TrustSection />
      <div id="precios">
        <Pricing />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <CTASection />
      <div id="contacto">
        <ContactForm />
      </div>
      <LiveSupport />
      <Footer />
    </div>
  );
};

export default Index;
