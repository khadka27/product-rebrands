import { getProductWithDetails } from "@/lib/models/product";
import { notFound } from "next/navigation";
import ProductHero from "@/components/product-hero";
import BenefitsSection from "@/components/benefitsSection";
import IngredientsSection from "@/components/ingredientsSection";
import TestimonialsSection from "@/components/testimonials-section";
import CallToAction from "@/components/call-to-action";
import StickyOrderButton from "@/components/sticky-order-button";
import CtaBoxes from "@/components/cta-boxes";
import ProductFeatures from "@/components/product-features";
import RenameInfoModal from "@/components/rename-info-modal";
import NewCta from "@/components/new-cta";
import Footer from "@/components/footer";
import BuyNotification from "@/components/buy-notification";
import BuyerAlert from "@/components/buyer-alert";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";

// Helper to generate a robust key
const generateItemKey = (item: any, index: number): string => {
  // Use item.id if it exists and is a string/number, otherwise use index
  return item && (typeof item.id === "string" || typeof item.id === "number")
    ? item.id.toString()
    : `item-${index}`;
};

export default async function PreviewPage({
  params,
}: {
  params: { slug: string };
}) {
  // Await params as suggested by the error message
  const awaitedParams = await params;
  const product = await getProductWithDetails(awaitedParams.slug);

  if (!product) {
    notFound();
  }

  console.log("Product why_choose data:", product.why_choose);

  return (
    <>
      <main className="min-h-screen bg-[#1a1f2e] text-white">
        <div className="relative">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/bg-pattern.png')] opacity-5"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] opacity-20"></div>
            <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px] opacity-20"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full filter blur-[120px] opacity-10"></div>
          </div>

          {/* Content */}
          <div className="relative max-w-6xl mx-auto px-4 py-4 md:py-8">
            <div className="text-center mb-6 md:mb-12 pt-4 md:pt-8">
              <BuyerAlert product={product} />

              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 md:mb-4 text-center text-[#E53E3E]">
                THIS PRODUCT HAS BEEN RENAMED TO
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-center text-[#E53E3E]">
                {product.name.toUpperCase()}
              </h2>
            </div>

            <div id="product">
              <ProductHero product={product} />
            </div>

            {product.ingredients && product.ingredients.length > 0 && (
              <div id="ingredients">
                <IngredientsSection
                  ingredients={product.ingredients}
                  productImage={product.product_image}
                />
              </div>
            )}

            <div id="benefits">
              <NewCta product={product} />
              <CtaBoxes position="top" product={product} />
              {product.why_choose && product.why_choose.length > 0 && (
                <BenefitsSection
                  productName={product.name}
                  whyChoose={product.why_choose.map(
                    (item: any, index: number) => ({
                      key: generateItemKey(item, index),
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      display_order: item.display_order,
                    })
                  )}
                />
              )}
            </div>

            <div id="features">
              <ProductFeatures product={product} />
              <CtaBoxes position="middle" product={product} />
            </div>

            <div id="testimonials">
              <TestimonialsSection product={product} />
            </div>

            <div id="order">
              <CallToAction product={product} />
            </div>
          </div>
        </div>

        <StickyOrderButton product={product} />
        <RenameInfoModal product={product} />
        <BuyNotification product={product} />
        <Footer product={product} />
      </main>
    </>
  );
}
