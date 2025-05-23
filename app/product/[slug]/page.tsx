import { getProductBySlug } from "@/lib/models/product";
import { notFound } from "next/navigation";
import ProductHero from "@/components/product-hero";
import ProductFeatures from "@/components/product-features";
import BenefitsSection from "@/components/benefits-section";
import IngredientsSection from "@/components/ingredients-section";
import TestimonialsSection from "@/components/testimonials-section";
import PricingSection from "@/components/pricing-section";
import CallToAction from "@/components/call-to-action";
import NewCta from "@/components/new-cta";
import CTABoxes from "@/components/cta-boxes";
import Footer from "@/components/footer";
import ProductHeader from "@/components/product-header";
import StickyOrderButton from "@/components/sticky-order-button";
import BuyNotification from "@/components/buy-notification";
import BuyerAlert from "@/components/buyer-alert";
import CountdownTimer from "@/components/countdown-timer";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Generate CSS variables from theme
  const generateThemeCSS = () => {
    if (!product.theme) return "";

    return `
      :root {
        --primary-color: ${product.theme.primaryColor};
        --secondary-color: ${product.theme.secondaryColor};
        --accent-color: ${product.theme.accentColor};
        --background-color: ${product.theme.backgroundColor};
        --text-color: ${product.theme.textColor};
        --heading-color: ${product.theme.headingColor};
        --button-color: ${product.theme.buttonColor};
        --button-text-color: ${product.theme.buttonTextColor};
        --border-radius: ${product.theme.borderRadius};
      }
      
      body {
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: ${product.theme.fontFamily};
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: var(--heading-color);
      }
      
      .btn-primary {
        background-color: var(--button-color);
        color: var(--button-text-color);
        border-radius: var(--border-radius);
      }
      
      .btn-primary:hover {
        background-color: var(--button-color);
        opacity: 0.9;
      }
      
      .card {
        border-radius: var(--border-radius);
      }
      
      ${product.theme.customCSS ?? ""}
    `;
  };

  return (
    <>
      {product.theme && (
        <style dangerouslySetInnerHTML={{ __html: generateThemeCSS() }} />
      )}

      <div className="relative">
        <ProductHeader productName={product.name} />
        <BuyerAlert />
        <BuyNotification />

        <main>
          <ProductHero
            productName={product.name}
            productImage={product.image}
            description={product.description}
            redirectLink={product.redirect_link}
          />
          <CountdownTimer />
          <ProductFeatures />
          <BenefitsSection />

          {product.ingredients && product.ingredients.length > 0 && (
            <IngredientsSection ingredients={product.ingredients} />
          )}

          <TestimonialsSection />

          {product.whyChoose && product.whyChoose.length > 0 && (
            <section className="py-12 bg-gray-100">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Why Choose {product.name}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {product.whyChoose.map(
                    (item: {
                      id: string | number;
                      title: string;
                      description: string;
                    }) => (
                      <div
                        key={item.id}
                        className="bg-white p-6 rounded-lg shadow-md"
                      >
                        <h3 className="text-xl font-semibold mb-2">
                          {item.title}
                        </h3>
                        <p>{item.description}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

          <PricingSection
            productName={product.name}
            moneyBackDays={product.money_back_days}
            redirectLink={product.redirect_link}
          />
          <CallToAction redirectLink={product.redirect_link} />
          <NewCta redirectLink={product.redirect_link} />
          <CTABoxes redirectLink={product.redirect_link} />
        </main>

        <Footer />
        <StickyOrderButton redirectLink={product.redirect_link} />
      </div>
    </>
  );
}
