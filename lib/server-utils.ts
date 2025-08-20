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
  try {
    console.log(`🖼️ Processing image: ${filename}, targetDir: ${targetDir}`);
    
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

    console.log(`📁 Normalized directory: ${normalizedDir}`);

    // Ensure directory exists
    ensureDirectoryExists(normalizedDir);
    console.log(`✅ Directory ensured: ${normalizedDir}`);

    const ext = path.extname(file.originalname).toLowerCase();
    const fullFilename = `${filename}${ext}`;
    const outputPath = path.join(normalizedDir, fullFilename);
    
    console.log(`💾 Saving file to: ${outputPath}`);

    // If it's a PNG, resize to 500x500
    if (ext === ".png") {
      await sharp(file.buffer)
        .resize(500, 500, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);
      console.log(`🖼️ PNG processed and saved: ${outputPath}`);
    } else {
      // For other formats, just save the file
      fs.writeFileSync(outputPath, file.buffer);
      console.log(`📄 File saved directly: ${outputPath}`);
    }

    // Verify file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`✅ File verified: ${outputPath} (${stats.size} bytes)`);
    } else {
      console.error(`❌ File NOT created: ${outputPath}`);
    }

    // Return the relative public path for serving (images/<category>/filename)
    const publicRelativeDir = normalizedDir.replace(/^public\/?/, "");
    const relativePath = path
      .join(publicRelativeDir, fullFilename)
      .replace(/\\/g, "/");
    // Remove leading slash if present
    const finalPath = relativePath.startsWith("/")
      ? relativePath.substring(1)
      : relativePath;
    
    console.log(`🔗 Returning relative path: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error(`❌ Error processing image ${filename}:`, error);
    console.error(`🚨 This is likely a production deployment issue:`);
    console.error(`   - File system may be read-only (Vercel, Netlify, etc.)`);
    console.error(`   - Missing write permissions`);
    console.error(`   - Docker volume not mounted`);
    console.error(`   - Consider using cloud storage (S3, Cloudinary, etc.)`);
    
    // Return a placeholder path so the app doesn't crash
    const ext = path.extname(file.originalname).toLowerCase();
    const placeholderPath = `placeholder${ext}`;
    console.log(`🔄 Returning placeholder path: ${placeholderPath}`);
    return placeholderPath;
  }
}

// Generate a random product ID (3-6 digits)
export function generateProductId(): string {
  return randomInt(100, 999999).toString();
}
