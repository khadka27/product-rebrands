"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeCustomizer } from "./theme-customizer";
import type { ProductTheme } from "@/lib/models/product";

interface ProductFormProps {
  productId?: string;
  initialData?: {
    name: string;
    description: string;
    redirect_link: string;
    money_back_days: number;
    image?: string;
    theme?: ProductTheme;
  };
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    redirect_link: initialData?.redirect_link || "",
    money_back_days: initialData?.money_back_days || 60,
    image: null as File | null,
    theme: initialData?.theme || undefined,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (theme: ProductTheme) => {
    setFormData((prev) => ({ ...prev, theme }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("redirect_link", formData.redirect_link);
      submitData.append("money_back_days", formData.money_back_days.toString());

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (formData.theme) {
        submitData.append("theme", JSON.stringify(formData.theme));
      }

      const url = productId ? `/api/products/${productId}` : "/api/products";

      const method = productId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || { general: "Something went wrong" });
        return;
      }

      // Redirect to product page or dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ general: "Failed to submit form" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>
                {productId ? "Edit Product" : "Create New Product"}
              </CardTitle>
              <CardDescription>
                {productId
                  ? "Update your product information"
                  : "Add a new product to your catalog"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={5}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="redirect_link">Redirect Link</Label>
                <Input
                  id="redirect_link"
                  name="redirect_link"
                  value={formData.redirect_link}
                  onChange={handleChange}
                  placeholder="https://example.com/checkout"
                  required
                />
                {errors.redirect_link && (
                  <p className="text-red-500 text-sm">{errors.redirect_link}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="money_back_days">
                  Money Back Guarantee (Days)
                </Label>
                <Input
                  id="money_back_days"
                  name="money_back_days"
                  type="number"
                  value={formData.money_back_days}
                  onChange={handleChange}
                  min={0}
                  required
                />
                {errors.money_back_days && (
                  <p className="text-red-500 text-sm">
                    {errors.money_back_days}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Preview:</p>
                    <img
                      src={
                        imagePreview.startsWith("data:")
                          ? imagePreview
                          : `/${imagePreview}`
                      }
                      alt="Product preview"
                      className="max-w-xs max-h-40 object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>

              {errors.general && (
                <p className="text-red-500">{errors.general}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <ThemeCustomizer
            initialTheme={formData.theme}
            onChange={handleThemeChange}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : productId
            ? "Update Product"
            : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
