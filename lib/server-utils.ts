import sharp from "sharp";
import fs from "fs";
import path from "path";
import { randomInt } from "crypto";
import type { Express } from "express";

// Ensure directory exists
export function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Process and resize image
export async function processImage(
  file: Express.Multer.File,
  targetDir: string,
  filename: string
): Promise<string> {
  // Normalize target directory to always write under public/images/<category>
  const normalizedDir = (() => {
    const td = targetDir.replace(/\\/g, "/").replace(/^\/+/, "");
    // If already starts with public/
    if (td.startsWith("public/")) return td;
    // If starts with images/
    if (td.startsWith("images/")) return `public/${td}`;
    // If is a bare category (products|badges|avatars|ingredients)
    if (["products", "badges", "avatars", "ingredients"].includes(td)) {
      return `public/images/${td}`;
    }
    // Default: place under public/images/<td>
    return `public/images/${td}`;
  })();

  // Ensure directory exists
  ensureDirectoryExists(normalizedDir);

  const ext = path.extname(file.originalname).toLowerCase();
  const fullFilename = `${filename}${ext}`;
  const outputPath = path.join(normalizedDir, fullFilename);

  // If it's a PNG, resize to 500x500
  if (ext === ".png") {
    await sharp(file.buffer)
      .resize(500, 500, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(outputPath);
  } else {
    // For other formats, just save the file
    fs.writeFileSync(outputPath, file.buffer);
  }

  // Return the relative public path for serving (images/<category>/filename)
  const publicRelativeDir = normalizedDir.replace(/^public\/?/, "");
  const relativePath = path
    .join(publicRelativeDir, fullFilename)
    .replace(/\\/g, "/");
  // Remove leading slash if present
  return relativePath.startsWith("/")
    ? relativePath.substring(1)
    : relativePath;
}

// Generate a random product ID (3-6 digits)
export function generateProductId(): string {
  return randomInt(100, 999999).toString();
}
