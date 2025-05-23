import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import sharp from "sharp"
import fs from "fs"
import path from "path"
import { randomInt } from "crypto"
import type { Express } from "express"

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
    .replace(/-+$/, "") // Trim - from end of text
}

// Generate a random product ID (3-6 digits)
export function generateProductId(): string {
  return randomInt(100, 999999).toString()
}

// Ensure directory exists
export function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }
}

// Process and resize image
export async function processImage(file: Express.Multer.File, targetDir: string, filename: string): Promise<string> {
  // Ensure directory exists
  ensureDirectoryExists(targetDir)

  const ext = path.extname(file.originalname).toLowerCase()
  const fullFilename = `${filename}${ext}`
  const outputPath = path.join(targetDir, fullFilename)

  // If it's a PNG, resize to 500x500
  if (ext === ".png") {
    await sharp(file.buffer)
      .resize(500, 500, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(outputPath)
  } else {
    // For other formats, just save the file
    fs.writeFileSync(outputPath, file.buffer)
  }

  // Return the relative path to the file
  return path.join(targetDir.replace("public", ""), fullFilename).replace(/\\/g, "/")
}

// Validate product data
export function validateProduct(data: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.name || data.name.trim() === "") {
    errors.name = "Product name is required"
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Description is required"
  }

  if (!data.redirect_link || data.redirect_link.trim() === "") {
    errors.redirect_link = "Redirect link is required"
  } else if (!isValidUrl(data.redirect_link)) {
    errors.redirect_link = "Invalid URL format"
  }

  if (!data.money_back_days || isNaN(Number.parseInt(data.money_back_days))) {
    errors.money_back_days = "Money back guarantee days must be a number"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// Validate ingredient data
export function validateIngredient(data: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.title || data.title.trim() === "") {
    errors.title = "Ingredient title is required"
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Ingredient description is required"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// Validate why choose data
export function validateWhyChoose(data: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.title || data.title.trim() === "") {
    errors.title = "Title is required"
  }

  if (!data.description || data.description.trim() === "") {
    errors.description = "Description is required"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// Check if a string is a valid URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
