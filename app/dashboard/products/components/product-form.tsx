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
import { Plus, Trash2 } from "lucide-react";

interface IngredientWithPreview {
  id?: string;
  title: string;
  description: string;
  image?: string | File;
  image_preview?: string;
  display_order: number;
}

interface WhyChoose {
  id?: string;
  title: string;
  description: string;
  display_order: number;
}

interface ProductFormProps {
  productId?: string;
  initialData?: {
    name: string;
    description: string;
    redirect_link: string;
    generated_link: string;
    money_back_days: number;
    image?: string;
    badge_image?: string;
    theme?: ProductTheme;
    ingredients?: IngredientWithPreview[];
    why_choose?: WhyChoose[];
  };
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("general");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ingredientErrors, setIngredientErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const [whyChooseErrors, setWhyChooseErrors] = useState<
    Record<string, Record<string, string>>
  >({});

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    redirect_link: initialData?.redirect_link || "",
    generated_link: initialData?.generated_link || "",
    money_back_days: initialData?.money_back_days || 60,
    image: null as File | null,
    badge_image: null as File | null,
    theme: initialData?.theme || undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [badgeImagePreview, setBadgeImagePreview] = useState<string | null>(
    initialData?.badge_image || null
  );

  const [ingredients, setIngredients] = useState<IngredientWithPreview[]>(
    initialData?.ingredients || []
  );

  const [whyChoose, setWhyChoose] = useState<WhyChoose[]>(
    initialData?.why_choose || []
  );

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      // Auto-generate product link when name changes
      if (name === "name") {
        const baseUrl = window.location.origin;
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        newFormData.generated_link = `${baseUrl}/preview/${slug}`;
      }

      return newFormData;
    });
  };

  // Handle image changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fieldName = e.target.name;

      setFormData((prev) => ({ ...prev, [fieldName]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (fieldName === "image") {
          setImagePreview(event.target?.result as string);
        } else if (fieldName === "badge_image") {
          setBadgeImagePreview(event.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle theme changes
  const handleThemeChange = (theme: ProductTheme) => {
    setFormData((prev) => ({ ...prev, theme }));
  };

  // Add a new ingredient
  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        image: undefined,
        display_order: prev.length,
      },
    ]);
  };

  // Remove an ingredient
  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));

    // Remove any errors for this ingredient
    setIngredientErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index.toString()];
      return newErrors;
    });
  };

  // Handle ingredient input changes
  const handleIngredientChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error for this field if it exists
    if (ingredientErrors[index]?.[field]) {
      setIngredientErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  // Handle ingredient image changes
  const handleIngredientImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setIngredients((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image: file };
        return updated;
      });

      // Create preview for the ingredient image
      const reader = new FileReader();
      reader.onload = (event) => {
        setIngredients((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            image_preview: event.target?.result as string,
          };
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new why choose point
  const addWhyChoose = () => {
    setWhyChoose((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        display_order: prev.length,
      },
    ]);
  };

  // Remove a why choose point
  const removeWhyChoose = (index: number) => {
    setWhyChoose((prev) => prev.filter((_, i) => i !== index));

    // Remove any errors for this why choose point
    setWhyChooseErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index.toString()];
      return newErrors;
    });
  };

  // Handle why choose input changes
  const handleWhyChooseChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setWhyChoose((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error for this field if it exists
    if (whyChooseErrors[index]?.[field]) {
      setWhyChooseErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case "general":
        if (!formData.name.trim()) {
          newErrors.name = "Product name is required";
        }
        if (!formData.description.trim()) {
          newErrors.description = "Description is required";
        }
        if (!formData.redirect_link.trim()) {
          newErrors.redirect_link = "Redirect link is required";
        } else if (!isValidUrl(formData.redirect_link)) {
          newErrors.redirect_link = "Invalid URL format";
        }
        if (!formData.generated_link.trim()) {
          newErrors.generated_link = "Generated link is required";
        } else if (!isValidUrl(formData.generated_link)) {
          newErrors.generated_link = "Invalid URL format";
        }
        if (
          !formData.money_back_days ||
          isNaN(Number(formData.money_back_days))
        ) {
          newErrors.money_back_days =
            "Money back guarantee days must be a number";
        }
        break;

      case "ingredients":
        ingredients.forEach((ingredient, index) => {
          if (!ingredient.title.trim()) {
            newErrors[`ingredient_${index}_title`] = "Title is required";
          }
          if (!ingredient.description.trim()) {
            newErrors[`ingredient_${index}_description`] =
              "Description is required";
          }
        });
        break;

      case "why-choose":
        whyChoose.forEach((item, index) => {
          if (!item.title.trim()) {
            newErrors[`why_choose_${index}_title`] = "Title is required";
          }
          if (!item.description.trim()) {
            newErrors[`why_choose_${index}_description`] =
              "Description is required";
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      const steps = ["general", "ingredients", "why-choose", "appearance"];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handlePreviousStep = () => {
    const steps = ["general", "ingredients", "why-choose", "appearance"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Check if a string is a valid URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Add this function at the top-level inside ProductForm
  function mapThemeToBackend(theme: any) {
    if (!theme) return undefined;
    return {
      primary_bg_color: theme.primaryColor,
      secondary_bg_color: theme.secondaryColor,
      accent_bg_color: theme.accentColor,
      primary_text_color: theme.textColor,
      heading_color: theme.headingColor,
      button_bg_color: theme.buttonColor,
      button_text_color: theme.buttonTextColor,
      link_color: theme.linkColor,
      font_family: theme.fontFamily,
      border_radius: theme.borderRadius,
      custom_css: theme.customCss,
      // Add more mappings as needed
    };
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("redirect_link", formData.redirect_link);
      submitData.append("generated_link", formData.generated_link);
      submitData.append("money_back_days", formData.money_back_days.toString());

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (formData.badge_image) {
        submitData.append("badge_image", formData.badge_image);
      }

      if (formData.theme) {
        const backendTheme = mapThemeToBackend(formData.theme);
        submitData.append("theme", JSON.stringify(backendTheme));
      }

      // Add ingredients data
      submitData.append(
        "ingredients",
        JSON.stringify(
          ingredients.map((ing) => ({
            title: ing.title,
            description: ing.description,
            display_order: ing.display_order,
            // We'll handle the image files separately
          }))
        )
      );

      // Add ingredient images
      ingredients.forEach((ingredient, index) => {
        if (ingredient.image instanceof File) {
          submitData.append(`ingredient_image_${index}`, ingredient.image);
        }
      });

      // Add why choose data
      submitData.append(
        "why_choose",
        JSON.stringify(
          whyChoose.map((wc) => ({
            title: wc.title,
            description: wc.description,
            display_order: wc.display_order,
          }))
        )
      );

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
      <Tabs value={currentStep} onValueChange={setCurrentStep}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="why-choose">Why Choose</TabsTrigger>
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
                <Label htmlFor="generated_link">Product Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="generated_link"
                    name="generated_link"
                    value={formData.generated_link}
                    onChange={handleChange}
                    placeholder="Product link will be generated automatically"
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (formData.generated_link) {
                        window.open(formData.generated_link, "_blank");
                      }
                    }}
                    disabled={!formData.generated_link}
                  >
                    Preview
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  This link will be automatically generated based on your
                  product name
                </p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="badge_image">Badge Image</Label>
                  <Input
                    id="badge_image"
                    name="badge_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {badgeImagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Preview:</p>
                      <img
                        src={
                          badgeImagePreview.startsWith("data:")
                            ? badgeImagePreview
                            : `/${badgeImagePreview}`
                        }
                        alt="Badge preview"
                        className="max-w-xs max-h-40 object-contain border rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {errors.general && (
                <p className="text-red-500">{errors.general}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients">
          <Card>
            <CardHeader>
              <CardTitle>Product Ingredients</CardTitle>
              <CardDescription>
                Add the key ingredients of your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="p-4 border rounded-lg relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`ingredient-title-${index}`}>
                          Title
                        </Label>
                        <Input
                          id={`ingredient-title-${index}`}
                          value={ingredient.title}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Ingredient name"
                          className={
                            ingredientErrors[index]?.title
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {ingredientErrors[index]?.title && (
                          <p className="text-red-500 text-sm">
                            {ingredientErrors[index].title}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`ingredient-image-${index}`}>
                          Image
                        </Label>
                        <Input
                          id={`ingredient-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleIngredientImageChange(index, e)
                          }
                        />
                        {(ingredient.image_preview ||
                          (typeof ingredient.image === "string" &&
                            ingredient.image)) && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-1">
                              Preview:
                            </p>
                            <img
                              src={
                                ingredient.image_preview
                                  ? ingredient.image_preview
                                  : typeof ingredient.image === "string"
                                  ? `/${ingredient.image}`
                                  : ""
                              }
                              alt={`Ingredient ${index + 1}`}
                              className="max-w-xs max-h-20 object-contain border rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`ingredient-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`ingredient-description-${index}`}
                        value={ingredient.description}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe the ingredient and its benefits"
                        rows={3}
                        className={
                          ingredientErrors[index]?.description
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {ingredientErrors[index]?.description && (
                        <p className="text-red-500 text-sm">
                          {ingredientErrors[index].description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="why-choose">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose This Product</CardTitle>
              <CardDescription>
                Add reasons why customers should choose this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {whyChoose.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeWhyChoose(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="space-y-2">
                      <Label htmlFor={`why-choose-title-${index}`}>Title</Label>
                      <Input
                        id={`why-choose-title-${index}`}
                        value={item.title}
                        onChange={(e) =>
                          handleWhyChooseChange(index, "title", e.target.value)
                        }
                        placeholder="Feature or benefit title"
                        className={
                          whyChooseErrors[index]?.title ? "border-red-500" : ""
                        }
                      />
                      {whyChooseErrors[index]?.title && (
                        <p className="text-red-500 text-sm">
                          {whyChooseErrors[index].title}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`why-choose-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`why-choose-description-${index}`}
                        value={item.description}
                        onChange={(e) =>
                          handleWhyChooseChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Explain this feature or benefit"
                        rows={3}
                        className={
                          whyChooseErrors[index]?.description
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {whyChooseErrors[index]?.description && (
                        <p className="text-red-500 text-sm">
                          {whyChooseErrors[index].description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addWhyChoose}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Reason
                </Button>
              </div>
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

      <div className="mt-6 flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <div className="flex gap-4">
          {currentStep !== "general" && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}

          {currentStep !== "appearance" ? (
            <Button type="button" onClick={handleNextStep} disabled={isLoading}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : productId
                ? "Update Product"
                : "Create Product"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
