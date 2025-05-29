"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "../../components/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  paragraph: string;
  bullet_points: string[];
  redirect_link: string;
  generated_link: string;
  money_back_days: number;
  image?: string;
  badge_image?: string;
  theme?: any;
  ingredients?: any[];
  why_choose?: any[];
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
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
              <p>Product ID: {product.id}</p>
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
                          src={ingredient.image}
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

            {/* Theme Settings Summary */}
            {product.theme && (
              <div>
                <h3 className="text-lg font-semibold">Theme Settings</h3>
                <p>Primary BG: {product.theme.primary_bg_color}</p>
                {/* Add other theme settings here as needed */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Edit Form */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
        <ProductForm productId={product.id} initialData={product} />
      </div>
    </div>
  );
}
