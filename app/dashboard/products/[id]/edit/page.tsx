"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "../../components/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Home, Edit, Eye } from "lucide-react";
import { getImagePath } from "@/lib/utils";

interface Product {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  paragraph: string;
  bullet_points: string[];
  redirect_link: string;
  generated_link: string;
  money_back_days: number;
  image?: string;
  badge_image?: string;
  theme?: {
    theme_id: string;
    product_id: string;
    primary_bg_color: string;
    secondary_bg_color: string;
    accent_bg_color: string;
    primary_text_color: string;
    secondary_text_color: string;
    accent_text_color: string;
    link_color: string;
    link_hover_color: string;
    primary_button_bg: string;
    primary_button_text: string;
    primary_button_hover_bg: string;
    secondary_button_bg: string;
    secondary_button_text: string;
    secondary_button_hover_bg: string;
    card_bg_color: string;
    card_border_color: string;
    card_shadow_color: string;
    header_bg_color: string;
    header_text_color: string;
    footer_bg_color: string;
    footer_text_color: string;
    font_family: string;
    h1_font_size: string;
    h1_font_weight: string;
    h2_font_size: string;
    h2_font_weight: string;
    h3_font_size: string;
    h3_font_weight: string;
    body_font_size: string;
    body_line_height: string;
    section_padding: string;
    card_padding: string;
    button_padding: string;
    border_radius_sm: string;
    border_radius_md: string;
    border_radius_lg: string;
    border_radius_xl: string;
    max_width: string;
    container_padding: string;
    gradient_start: string;
    gradient_end: string;
    shadow_color: string;
    custom_css: string;
  };
  ingredients?: {
    id: string;
    title: string;
    description: string;
    image?: string;
    display_order: number;
  }[];
  why_choose?: {
    id: string;
    title: string;
    description: string;
    display_order: number;
  }[];
  reviews?: {
    id: number;
    name: string;
    address: string;
    rating: number;
    review_text: string;
    avatar?: string;
  }[];
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Fetching product with ID:", params.id);

        // Fetch from the regular products API
        const response = await fetch(`/api/products/${params.id}`);
        console.log("API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error:", errorText);
          throw new Error(
            `Failed to fetch product: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Fetched product data:", data);

        // Format the data
        const formattedData: Product = {
          ...data,
          id: data.product_id, // Map product_id to id for frontend compatibility
          product_id: data.product_id, // Keep original product_id
          slug: data.slug || data.name.replace(/\s+/g, "-").toLowerCase(), // Ensure slug exists
          theme: data.theme || {
            theme_id: "",
            product_id: data.product_id,
            primary_bg_color: "#ffffff",
            secondary_bg_color: "#f44336",
            accent_bg_color: "#ffc107",
            primary_text_color: "#333333",
            secondary_text_color: "#666666",
            accent_text_color: "#ffc107",
            link_color: "#3182ce",
            link_hover_color: "#2c5282",
            primary_button_bg: "#ff5722",
            primary_button_text: "#ffffff",
            primary_button_hover_bg: "#f44336",
            secondary_button_bg: "#e0e0e0",
            secondary_button_text: "#333333",
            secondary_button_hover_bg: "#bdbdbd",
            card_bg_color: "#ffffff",
            card_border_color: "#e0e0e0",
            card_shadow_color: "#0000001a",
            header_bg_color: "#ffffff",
            header_text_color: "#111111",
            footer_bg_color: "#333333",
            footer_text_color: "#ffffff",
            font_family: "Inter, sans-serif",
            h1_font_size: "2.5rem",
            h1_font_weight: "700",
            h2_font_size: "2rem",
            h2_font_weight: "600",
            h3_font_size: "1.5rem",
            h3_font_weight: "500",
            body_font_size: "1rem",
            body_line_height: "1.5",
            section_padding: "2rem",
            card_padding: "1.5rem",
            button_padding: "0.75rem 1.5rem",
            border_radius_sm: "4px",
            border_radius_md: "8px",
            border_radius_lg: "12px",
            border_radius_xl: "16px",
            max_width: "1200px",
            container_padding: "1rem",
            gradient_start: "",
            gradient_end: "",
            shadow_color: "",
            custom_css: "",
          },
          ingredients: data.ingredients || [],
          why_choose: data.why_choose || [],
          reviews: data.reviews || [],
        };

        setProduct(formattedData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product data");
        toast.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-4 py-2 bg-deep-purple-400 text-white rounded hover:bg-purple-500"
            >
              Return to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested product could not be found.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-4 py-2 bg-purple-400 text-white rounded hover:bg-purple-500"
            >
              Return to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-200"></div>
              <nav className="flex items-center space-x-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <span className="text-gray-400">/</span>
                <Button variant="ghost" size="sm" disabled>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{product.name}</Badge>
              <Link href={`/preview/${product.slug || product.name.replace(/\s+/g, "-").toLowerCase()}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Current Product Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Product Details</h2>
              <p>Product ID: {product.product_id}</p>
              <p>Name: {product.name}</p>
              <p>Slug: {product.name.replace(/\s+/g, "-").toLowerCase()}</p>
              <p>Redirect Link: {product.redirect_link}</p>
              <p>Generated Link: {product.generated_link}</p>
              <p>Money Back Days: {product.money_back_days}</p>
              {product.image && (
                <div className="mt-4">
                  <p>Product Image:</p>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
              {product.badge_image && (
                <div className="mt-4">
                  <p>Product Badge:</p>
                  <img
                    src={product.badge_image}
                    alt={`${product.name} badge`}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              {product.paragraph && <p>{product.paragraph}</p>}
              {product.bullet_points && product.bullet_points.length > 0 && (
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {product.bullet_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Ingredients Section */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Ingredients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {product.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="border p-3 rounded-md">
                      <p>Title: {ingredient.title}</p>
                      <p>Description: {ingredient.description}</p>
                      {ingredient.image && (
                        <img
                          src={getImagePath(
                            ingredient.image,
                            "/placeholder.svg"
                          )}
                          alt={ingredient.title}
                          className="w-16 h-16 object-cover rounded-md mt-2"
                        />
                      )}
                      <p>Display Order: {ingredient.display_order}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why Choose Section */}
            {product.why_choose && product.why_choose.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Why Choose Us</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {product.why_choose.map((item) => (
                    <li key={item.id}>
                      <strong>{item.title}:</strong> {item.description} (Order:{" "}
                      {item.display_order})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Customer Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <div className="grid gap-4 mt-2">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="p-3 border rounded-md">
                      <div className="flex items-start gap-3">
                        {review.avatar && (
                          <img
                            src={`/images/avatars/${review.avatar}`}
                            alt={`${review.name}'s avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {review.review_text}
                          </p>
                          <p className="text-xs text-gray-400">
                            {review.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Settings Summary */}
            {product.theme && (
              <div>
                <h3 className="text-lg font-semibold">Theme Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">Colors</p>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: product.theme.primary_bg_color,
                          }}
                        />
                        <span>Primary BG</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: product.theme.secondary_bg_color,
                          }}
                        />
                        <span>Secondary BG</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: product.theme.accent_bg_color,
                          }}
                        />
                        <span>Accent BG</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">Typography</p>
                    <div className="space-y-2 mt-2">
                      <p>Font: {product.theme.font_family}</p>
                      <p>H1: {product.theme.h1_font_size}</p>
                      <p>Body: {product.theme.body_font_size}</p>
                    </div>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">Layout</p>
                    <div className="space-y-2 mt-2">
                      <p>Max Width: {product.theme.max_width}</p>
                      <p>Border Radius: {product.theme.border_radius_md}</p>
                      <p>Padding: {product.theme.section_padding}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Edit Form */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
        <ProductForm productId={product.product_id} initialData={product} />
      </div>
      </div>
    </div>
  );
}
