import ProductHero from "@/components/product-hero"
import BenefitsSection from "@/components/benefits-section"
import IngredientsSection from "@/components/ingredients-section"
import TestimonialsSection from "@/components/testimonials-section"
import CallToAction from "@/components/call-to-action"
import StickyOrderButton from "@/components/sticky-order-button"
import CtaBoxes from "@/components/cta-boxes"
import ProductFeatures from "@/components/product-features"
import RenameInfoModal from "@/components/rename-info-modal"
import ThemeNavigation from "@/components/theme-navigation"
import NewCta from "@/components/new-cta"
import Footer from "@/components/footer"
import BuyNotification from "@/components/buy-notification"
import BuyerAlert from "@/components/buyer-alert"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--bg-gradient-from)] via-[var(--bg-gradient-via)] to-[var(--bg-gradient-to)] text-[var(--text-primary)]">
      <div className="relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/bg-pattern.png')] opacity-5"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full filter blur-[120px] opacity-20 dark-theme:opacity-20 light-theme:opacity-10"></div>
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-600 rounded-full filter blur-[120px] opacity-20 dark-theme:opacity-20 light-theme:opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600 rounded-full filter blur-[120px] opacity-10 dark-theme:opacity-10 light-theme:opacity-5"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 py-4 md:py-8">
          {/* Removed ThemeToggle, keeping only ThemeNavigation */}
          <ThemeNavigation />

          <div className="text-center mb-6 md:mb-12 pt-4 md:pt-8">
            {/* Buyer Alert - now in a separate component with animation */}
            <BuyerAlert />

            {/* Updated to ensure white text in dark mode */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-4 text-black dark:text-white text-center">
              THIS PRODUCT HAS BEEN RENAMED TO
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black text-red-600 text-center">
              TRIBAL FORCE X
            </h2>
          </div>

          <div id="product">
            <ProductHero />
          </div>
          <div id="ingredients">
            <IngredientsSection />
          </div>
          <div id="benefits">
            <NewCta />
            <CtaBoxes position="top" />
            <BenefitsSection />
          </div>
          <div id="features">
            <ProductFeatures />
            <CtaBoxes position="middle" />
          </div>
          <div id="testimonials">
            <TestimonialsSection />
          </div>
          <div id="order">
            <CallToAction />
          </div>
        </div>
      </div>
      <StickyOrderButton />
      <RenameInfoModal />
      <BuyNotification />
      <Footer />
    </main>
  )
}
