import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Generate a slug from a string
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// Validate product data
export function validateProduct(data: any): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === "") {
    errors.name = "Product name is required";
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Description is required";
  }

  if (!data.redirect_link || data.redirect_link.trim() === "") {
    errors.redirect_link = "Redirect link is required";
  } else if (!isValidUrl(data.redirect_link)) {
    errors.redirect_link = "Invalid URL format";
  }

  if (!data.money_back_days || isNaN(Number.parseInt(data.money_back_days))) {
    errors.money_back_days = "Money back guarantee days must be a number";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validate ingredient data
export function validateIngredient(data: any): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim() === "") {
    errors.title = "Ingredient title is required";
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Ingredient description is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validate why choose data
export function validateWhyChoose(data: any): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim() === "") {
    errors.title = "Title is required";
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Description is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Check if a string is a valid URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to handle image paths consistently
export function getImagePath(
  imagePath: string | null | undefined,
  fallback: string = "/placeholder.jpg"
): string {
  if (!imagePath) return fallback;

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Normalize and route legacy filenames to correct subdirectories
  const cleanPath = imagePath.trim().replace(/^\/+/, "");

  // If path already points inside images/, just ensure leading slash
  if (cleanPath.startsWith("images/")) {
    return `/${cleanPath}`;
  }

  // If it's a bare filename (no directory), infer subdirectory by naming convention
  if (!cleanPath.includes("/")) {
    const lower = cleanPath.toLowerCase();
    const isImageFile = /\.(png|jpe?g|webp|gif|svg)$/.test(lower);
    if (isImageFile) {
      if (lower.startsWith("badge_")) {
        return `/images/badges/${cleanPath}`;
      }
      if (lower.startsWith("product_")) {
        return `/images/products/${cleanPath}`;
      }
      if (lower.startsWith("ingredient_")) {
        return `/images/ingredients/${cleanPath}`;
      }
      if (lower.startsWith("avatar_")) {
        return `/images/avatars/${cleanPath}`;
      }
      // Unknown but valid image filename: default to products directory
      return `/images/products/${cleanPath}`;
    }
  }

  // Default: ensure leading slash
  return `/${cleanPath}`;
}

function resolveImageByCategory(
  imagePath: string | null | undefined,
  category: "products" | "badges" | "avatars" | "ingredients",
  fallback?: string
): string {
  // Prefer DB-provided value; no hardcoded defaults here
  if (imagePath && imagePath.startsWith("http")) return imagePath;
  if (imagePath && imagePath.trim() !== "") {
    // Normalize slashes and strip leading public/ if present
    const normalized = imagePath
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/^public\//, "");
    const clean = normalized;
    if (clean.startsWith("images/")) return `/${clean}`;
    if (clean.includes("/")) return `/${clean}`;
    return `/images/${category}/${clean}`;
  }
  // If empty, return normalized fallback or empty string
  return fallback ? getImagePath(fallback) : "";
}

export function resolveProductImagePath(
  imagePath: string | null | undefined,
  fallback?: string
): string {
  return resolveImageByCategory(imagePath, "products", fallback);
}

export function resolveBadgeImagePath(
  imagePath: string | null | undefined,
  fallback?: string
): string {
  return resolveImageByCategory(imagePath, "badges", fallback);
}

export function resolveAvatarImagePath(
  imagePath: string | null | undefined,
  fallback?: string
): string {
  return resolveImageByCategory(imagePath, "avatars", fallback);
}

export function resolveIngredientImagePath(
  imagePath: string | null | undefined,
  fallback?: string
): string {
  return resolveImageByCategory(imagePath, "ingredients", fallback);
}
