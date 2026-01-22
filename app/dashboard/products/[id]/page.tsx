import { ProductForm } from "../components/product-form";
import { Metadata } from "next";
import { headers } from "next/headers";
import { getProductByProductId } from "@/lib/models/product";
import { getIngredientsByProductId } from "@/lib/models/ingredient";
import { getWhyChooseByProductId } from "@/lib/models/why-choose";
import { getReviewsByProductId } from "@/lib/models/review";
import { notFound } from "next/navigation";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Force per-request rendering; avoids static optimization that might drop params in some hosts
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit product details and settings",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const awaitedParams = await params;
  const requestHeaders = await headers();
  const pathCandidates = [
    requestHeaders.get("x-pathname"),
    requestHeaders.get("x-forwarded-uri"),
    requestHeaders.get("x-original-uri"),
    requestHeaders.get("x-original-url"),
    requestHeaders.get("x-request-uri"),
    requestHeaders.get("x-request-url"),
    requestHeaders.get("x-rewrite-url"),
    requestHeaders.get("x-forwarded-path"),
    requestHeaders.get("x-invoke-path"),
    requestHeaders.get("x-invoke-url"),
    requestHeaders.get("x-middleware-pathname"),
    requestHeaders.get("next-url"),
    requestHeaders.get("referer"),
  ].filter(Boolean) as string[];

  const deriveProductId = (rawPath?: string | null) => {
    if (!rawPath) return null;
    let pathname = rawPath;
    try {
      // If rawPath is absolute, URL will normalize it; otherwise keep as-is
      const url = new URL(
        rawPath,
        `https://${requestHeaders.get("host") || "localhost"}`,
      );
      pathname = url.pathname;
    } catch {
      // swallow
    }

    const segments = pathname.split("/").filter(Boolean);
    const productsIndex = segments.lastIndexOf("products");
    if (productsIndex >= 0 && segments[productsIndex + 1]) {
      return segments[productsIndex + 1];
    }
    return segments.at(-1) || null;
  };

  const derivedProductId =
    awaitedParams?.id || deriveProductId(pathCandidates[0]);

  const requestInfo = {
    url: pathCandidates[0] || "(unknown)",
    host: requestHeaders.get("host") || "(unknown)",
    userAgent: requestHeaders.get("user-agent") || "(unknown)",
    pathCandidates,
    derivedProductId,
    headers: Array.from(requestHeaders.entries()),
  };

  const productId = derivedProductId;

  if (!productId) {
    console.error("EditProductPage: missing product id param", {
      params,
      requestInfo,
    });
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Edit product: missing product id</p>
          <p className="mt-2 text-sm">
            Check server logs for the request details.
          </p>
          <pre className="mt-4 overflow-auto rounded bg-white p-3 text-xs text-gray-700">
            {JSON.stringify({ params, requestInfo }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  let product;
  try {
    product = await getProductByProductId(productId);
  } catch (error) {
    console.error("EditProductPage: failed to fetch product", {
      productId,
      error,
      requestInfo,
    });
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Edit product: failed to fetch product</p>
          <p className="text-sm">Product ID: {productId}</p>
          <p className="mt-2 text-sm">Check server logs for details.</p>
          <pre className="mt-4 overflow-auto rounded bg-white p-3 text-xs text-gray-700">
            {JSON.stringify({ productId, requestInfo }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!product) {
    const message = `Edit product: product not found for id ${productId}.`;
    console.error(message, { requestInfo });
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-semibold">{message}</p>
          <p className="mt-2 text-sm">Check the ID and try again.</p>
          <pre className="mt-4 overflow-auto rounded bg-white p-3 text-xs text-gray-700">
            {JSON.stringify({ productId, requestInfo }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Fetch related data
  const [ingredients, whyChoose, reviews] = await Promise.all([
    getIngredientsByProductId(product.product_id),
    getWhyChooseByProductId(product.product_id),
    getReviewsByProductId(product.product_id),
  ]);

  // Prepare initial data for the form
  const initialData = {
    name: product.name,
    paragraph: product.paragraph,
    bullet_points: product.bullet_points || [],
    redirect_link: product.redirect_link,
    generated_link: product.generated_link || "",
    money_back_days: product.money_back_days,
    image: product.product_image,
    badge_image: product.product_badge,
    ingredients: ingredients.map((ingredient) => ({
      id: ingredient.id,
      title: ingredient.title,
      description: ingredient.description,
      image: ingredient.image ? ingredient.image : undefined,
      image_preview: ingredient.image ? ingredient.image : undefined,
      display_order: ingredient.display_order,
    })),
    why_choose: whyChoose,
    reviews: reviews.map((review) => ({
      id: review.id,
      product_id: review.product_id,
      name: review.name,
      address: review.address,
      rating: review.rating,
      review_text: review.review_text,
      avatar: review.avatar ? review.avatar : undefined,
      avatar_preview: review.avatar ? review.avatar : undefined,
      created_at: review.created_at,
      updated_at: review.updated_at,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <ProductForm productId={awaitedParams.id} initialData={initialData} />
    </div>
  );
}
