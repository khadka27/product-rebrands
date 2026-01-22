import sharp from "sharp";
import fs from "fs";
import path from "path";
import { randomInt } from "crypto";
import type { Express } from "express";

// Initialize storage directories - call this on app startup
export function initializeStorage(): void {
  const baseDir = path.join(process.cwd(), "public");
  const imagesDir = path.join(baseDir, "images");
  const categories = ["products", "badges", "avatars", "ingredients"];

  console.log(`🚀 Initializing storage in: ${baseDir}`);

  try {
    // Ensure public directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log(`✅ Created public directory: ${baseDir}`);
    }

    // Ensure images directory exists
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log(`✅ Created images directory: ${imagesDir}`);
    }

    // Create category subdirectories
    categories.forEach((category) => {
      const categoryDir = path.join(imagesDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
        console.log(`✅ Created category directory: ${categoryDir}`);
      }
    });

    // Verify write permissions
    fs.accessSync(baseDir, fs.constants.W_OK);
    console.log(`✅ Storage initialized successfully with write permissions`);
  } catch (error) {
    console.error(`❌ Failed to initialize storage:`, error);
    throw new Error(
      `Storage initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Ensure directory exists
export function ensureDirectoryExists(directory: string): void {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`📁 Creating directory: ${directory}`);
      fs.mkdirSync(directory, { recursive: true });
      console.log(`✅ Directory created successfully: ${directory}`);
    } else {
      console.log(`✅ Directory already exists: ${directory}`);
    }

    // Verify directory is writable
    fs.accessSync(directory, fs.constants.W_OK);
    console.log(`✅ Directory is writable: ${directory}`);
  } catch (error) {
    console.error(`❌ Error with directory ${directory}:`, error);
    throw new Error(`Cannot create or write to directory: ${directory}`);
  }
}

// Process and resize image
export async function processImage(
  file: Express.Multer.File,
  targetDir: string,
  filename: string,
): Promise<string> {
  try {
    console.log(`🖼️ Processing image: ${filename}, targetDir: ${targetDir}`);
    console.log(`🏠 Current working directory: ${process.cwd()}`);
    console.log(`📦 File buffer size: ${file.buffer.length} bytes`);

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

    // Use absolute path for file operations to ensure we hit the mounted volume in Docker/Coolify
    // process.cwd() is usually /app in Docker, and /app/public is mounted to persistent storage
    const absoluteTargetDir = path.join(process.cwd(), normalizedDir);

    console.log(`📁 Normalized directory: ${normalizedDir}`);
    console.log(`📂 Absolute processing path: ${absoluteTargetDir}`);

    // Ensure directory exists
    ensureDirectoryExists(absoluteTargetDir);

    const ext = path.extname(file.originalname).toLowerCase();
    const fullFilename = `${filename}${ext}`;
    // Use absolute path for saving
    const outputPath = path.join(absoluteTargetDir, fullFilename);

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
      throw new Error(`File was not created at ${outputPath}`);
    }

    // Return the relative public path for serving (images/<category>/filename)
    const publicRelativeDir = normalizedDir.replace(/^public\/?/, "");
    const relativePath = path
      .join(publicRelativeDir, fullFilename)
      .replace(/\\/g, "/");

    // Ensure leading slash for correct URL resolution
    const finalPath = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;

    console.log(`🔗 Returning public URL path: ${finalPath}`);
    console.log(
      `🎯 Image should be accessible at: ${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${finalPath}`,
    );
    return finalPath;
  } catch (error) {
    console.error(`❌ Error processing image ${filename}:`, error);
    console.error(`🚨 Diagnostics:`);
    console.error(`   - Current directory: ${process.cwd()}`);
    console.error(`   - Target directory: ${targetDir}`);
    console.error(
      `   - Error message: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.error(`   - Error stack:`, error);
    console.error(`📋 Troubleshooting steps:`);
    console.error(
      `   1. Check if /app/public is mounted as a volume in Coolify`,
    );
    console.error(`   2. Verify write permissions on the mounted volume`);
    console.error(`   3. Check available disk space`);
    console.error(
      `   4. Review Coolify deployment logs for volume mount issues`,
    );

    // Return a placeholder path so the app doesn't crash
    const ext = path.extname(file.originalname).toLowerCase();
    const placeholderPath = `/placeholder${ext}`; // Ensure leading slash here too
    console.log(`🔄 Returning placeholder path: ${placeholderPath}`);
    return placeholderPath;
  }
}

// Generate a random product ID (3-6 digits)
export function generateProductId(): string {
  return randomInt(100, 999999).toString();
}
