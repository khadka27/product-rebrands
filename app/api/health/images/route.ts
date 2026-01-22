import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * Health check endpoint for image storage
 * Verifies that images directory exists and is accessible
 */
export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), "public", "images");

    console.log(`🔍 Checking image storage at: ${imagesDir}`);

    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      console.warn(`⚠️ Images directory does not exist: ${imagesDir}`);
      return NextResponse.json(
        {
          status: "warning",
          message: "Images directory does not exist",
          path: imagesDir,
        },
        { status: 200 },
      );
    }

    // Get directory statistics
    const stats = fs.statSync(imagesDir);

    // List subdirectories
    const subdirs = fs.readdirSync(imagesDir);
    const categories: Record<string, number> = {};

    for (const dir of subdirs) {
      const subpath = path.join(imagesDir, dir);
      if (fs.statSync(subpath).isDirectory()) {
        const files = fs.readdirSync(subpath);
        categories[dir] = files.length;
      }
    }

    console.log(`✅ Image storage is healthy`);
    console.log(`📁 Found categories:`, categories);

    return NextResponse.json({
      status: "healthy",
      message: "Image storage is accessible",
      path: imagesDir,
      categories,
      totalCategories: subdirs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Error checking image storage:`, error);

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
