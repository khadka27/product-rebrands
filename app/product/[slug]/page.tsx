"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  image: string;
  slug: string;
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${params.slug}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
        setName(data.name || "");
        setImage(null); // Don't set file object here
        setPreview(data.image || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.slug]);

  // Handle image change
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      // Only append image if changed
      if (image) {
        formData.append("image", image);
      } else if (product?.image) {
        formData.append("image", product.image);
      }
      const res = await fetch(`/api/products/${params.slug}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update product");
      router.push(`/product/${params.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="product-name" className="block mb-1">
            Name
          </label>
          <input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="product-image" className="block mb-1">
            Image
          </label>
          {preview && (
            <Image
              src={preview}
              alt="Product Image"
              width={200}
              height={200}
              className="mb-2 rounded"
            />
          )}
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}
