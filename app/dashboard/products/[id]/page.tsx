import { ProductForm } from "../components/product-form";
import { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit product details and settings",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: PageProps) {
  const productId = params?.id;

  if (!productId) {
    console.error("EditProductPage: missing product id param", { params });
    throw new Error("Edit product: missing product id");
  }

  let product;
  try {
    product = await getProductByProductId(productId);
  } catch (error) {
    console.error("EditProductPage: failed to fetch product", {
      productId,
      error,
    });
    throw new Error(
      `Edit product: failed to fetch product ${productId}. Check server logs for details.`,
    );
  }

  if (!product) {
    const message = `Edit product: product not found for id ${productId}.`;
    console.error(message);
    throw new Error(message);
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
      <ProductForm productId={params.id} initialData={initialData} />
    </div>
  );
}
