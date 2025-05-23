import { getProductWithDetails } from "@/lib/models/product"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductWithDetails(params.slug)

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: product.name,
    description: product.description.substring(0, 160),
  }
}

function generateThemeCSS(theme: any) {
  if (!theme) return ""

  return `
    :root {
      --theme-primary-bg: ${theme.primary_bg_color};
      --theme-secondary-bg: ${theme.secondary_bg_color};
      --theme-accent-bg: ${theme.accent_bg_color};
      --theme-primary-text: ${theme.primary_text_color};
      --theme-secondary-text: ${theme.secondary_text_color};
      --theme-accent-text: ${theme.accent_text_color};
      --theme-link: ${theme.link_color};
      --theme-link-hover: ${theme.link_hover_color};
      --theme-primary-button-bg: ${theme.primary_button_bg};
      --theme-primary-button-text: ${theme.primary_button_text};
      --theme-primary-button-hover: ${theme.primary_button_hover_bg};
      --theme-secondary-button-bg: ${theme.secondary_button_bg};
      --theme-secondary-button-text: ${theme.secondary_button_text};
      --theme-secondary-button-hover: ${theme.secondary_button_hover_bg};
      --theme-card-bg: ${theme.card_bg_color};
      --theme-card-border: ${theme.card_border_color};
      --theme-card-shadow: ${theme.card_shadow_color};
      --theme-header-bg: ${theme.header_bg_color};
      --theme-header-text: ${theme.header_text_color};
      --theme-footer-bg: ${theme.footer_bg_color};
      --theme-footer-text: ${theme.footer_text_color};
      --theme-gradient-start: ${theme.gradient_start};
      --theme-gradient-end: ${theme.gradient_end};
      --theme-shadow: ${theme.shadow_color};
    }

    body {
      background-color: var(--theme-primary-bg);
      color: var(--theme-primary-text);
      font-family: ${theme.font_family};
      font-size: ${theme.body_font_size};
      line-height: ${theme.body_line_height};
    }

    .themed-container {
      max-width: ${theme.max_width};
      padding: ${theme.container_padding};
    }

    .themed-section {
      padding: ${theme.section_padding} 0;
    }

    .themed-card {
      background-color: var(--theme-card-bg);
      border: 1px solid var(--theme-card-border);
      border-radius: ${theme.border_radius_lg};
      padding: ${theme.card_padding};
      box-shadow: 0 4px 6px var(--theme-card-shadow);
    }

    .themed-button-primary {
      background-color: var(--theme-primary-button-bg);
      color: var(--theme-primary-button-text);
      padding: ${theme.button_padding};
      border-radius: ${theme.border_radius_md};
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .themed-button-primary:hover {
      background-color: var(--theme-primary-button-hover);
    }

    .themed-button-secondary {
      background-color: var(--theme-secondary-button-bg);
      color: var(--theme-secondary-button-text);
      padding: ${theme.button_padding};
      border-radius: ${theme.border_radius_md};
      border: 1px solid var(--theme-card-border);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .themed-button-secondary:hover {
      background-color: var(--theme-secondary-button-hover);
    }

    .themed-gradient {
      background: linear-gradient(135deg, var(--theme-gradient-start), var(--theme-gradient-end));
    }

    h1 {
      font-size: ${theme.h1_font_size};
      font-weight: ${theme.h1_font_weight};
      color: var(--theme-primary-text);
      margin-bottom: 1rem;
    }

    h2 {
      font-size: ${theme.h2_font_size};
      font-weight: ${theme.h2_font_weight};
      color: var(--theme-primary-text);
      margin-bottom: 0.75rem;
    }

    h3 {
      font-size: ${theme.h3_font_size};
      font-weight: ${theme.h3_font_weight};
      color: var(--theme-primary-text);
      margin-bottom: 0.5rem;
    }

    a {
      color: var(--theme-link);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    a:hover {
      color: var(--theme-link-hover);
    }

    .themed-header {
      background-color: var(--theme-header-bg);
      color: var(--theme-header-text);
      padding: 1rem 0;
    }

    .themed-footer {
      background-color: var(--theme-footer-bg);
      color: var(--theme-footer-text);
      padding: 2rem 0;
    }

    .themed-ingredient-card {
      background-color: var(--theme-secondary-bg);
      border: 1px solid var(--theme-card-border);
      border-radius: ${theme.border_radius_md};
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .themed-why-choose-card {
      background-color: var(--theme-accent-bg);
      border: 1px solid var(--theme-card-border);
      border-radius: ${theme.border_radius_md};
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    ${theme.custom_css || ""}
  `
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductWithDetails(params.slug)

  if (!product) {
    notFound()
  }

  const themeCSS = generateThemeCSS(product.theme)

  return (
    <>
      {/* Inject custom theme CSS */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      <div className="min-h-screen">
        {/* Header */}
        <header className="themed-header">
          <div className="themed-container mx-auto">
            <h1 className="text-center">{product.name}</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="themed-container mx-auto">
          <div className="themed-section">
            <div className="themed-card">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center items-center relative">
                  {product.product_image && (
                    <div className="relative w-full h-[300px]">
                      <Image
                        src={product.product_image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />

                      {product.product_badge && (
                        <div className="absolute top-0 right-0 w-24 h-24">
                          <Image
                            src={product.product_badge || "/placeholder.svg"}
                            alt="Product Badge"
                            width={100}
                            height={100}
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h2>{product.name}</h2>
                  <div className="mb-6">
                    <p style={{ color: "var(--theme-secondary-text)" }}>{product.description}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm" style={{ color: "var(--theme-secondary-text)" }}>
                      {product.money_back_days} Day Money Back Guarantee
                    </p>
                  </div>

                  <div className="mb-6">
                    <Link
                      href={product.redirect_link}
                      className="themed-button-primary inline-block text-center px-6 py-3 rounded-lg font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="themed-section">
              <div className="themed-card">
                <h2 className="text-center mb-8">Key Ingredients</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {product.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="themed-ingredient-card">
                      <div className="flex items-start">
                        {ingredient.image && (
                          <div className="mr-4 flex-shrink-0">
                            <Image
                              src={ingredient.image || "/placeholder.svg"}
                              alt={ingredient.title}
                              width={60}
                              height={60}
                              className="rounded-full"
                            />
                          </div>
                        )}

                        <div>
                          <h3>{ingredient.title}</h3>
                          <p style={{ color: "var(--theme-secondary-text)" }} className="text-sm">
                            {ingredient.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Why Choose Section */}
          {product.why_choose && product.why_choose.length > 0 && (
            <div className="themed-section">
              <div className="themed-card">
                <h2 className="text-center mb-8">Why Choose {product.name}</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {product.why_choose.map((item) => (
                    <div key={item.id} className="themed-why-choose-card">
                      <h3>{item.title}</h3>
                      <p style={{ color: "var(--theme-secondary-text)" }}>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="themed-section">
            <div className="themed-card text-center themed-gradient">
              <div className="p-8">
                <h2 style={{ color: "white" }}>Get {product.name} Now</h2>
                <p className="mb-6" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Don't wait! Transform your life with {product.name} today.
                </p>

                <Link
                  href={product.redirect_link}
                  className="themed-button-primary inline-block px-8 py-4 rounded-lg font-semibold text-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  Order Now
                </Link>

                <p className="mt-4 text-sm" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {product.money_back_days} Day Money Back Guarantee
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="themed-footer">
          <div className="themed-container mx-auto text-center">
            <p>&copy; 2024 {product.name}. All rights reserved.</p>
            <p className="mt-2 text-sm" style={{ color: "var(--theme-footer-text)", opacity: 0.8 }}>
              This product is not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
