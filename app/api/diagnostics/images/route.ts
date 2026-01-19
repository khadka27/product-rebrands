import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const connection = await db.getConnection();

    // Get all products with their image paths
    const result = await connection.query(
      `SELECT product_id, name, slug, product_image, product_badge 
       FROM products 
       ORDER BY created_at DESC 
       LIMIT 10`,
    );

    connection.release();

    // Check if files exist
    const diagnostics = result.rows.map((product: any) => {
      const productImagePath = product.product_image
        ? path.join(process.cwd(), "public", product.product_image)
        : null;
      const badgeImagePath = product.product_badge
        ? path.join(process.cwd(), "public", product.product_badge)
        : null;

      return {
        product_id: product.product_id,
        name: product.name,
        slug: product.slug,
        product_image: {
          db_path: product.product_image,
          full_path: productImagePath,
          exists: productImagePath ? fs.existsSync(productImagePath) : false,
          url: product.product_image ? `/${product.product_image}` : null,
        },
        product_badge: {
          db_path: product.product_badge,
          full_path: badgeImagePath,
          exists: badgeImagePath ? fs.existsSync(badgeImagePath) : false,
          url: product.product_badge ? `/${product.product_badge}` : null,
        },
      };
    });

    // Also check public directory structure
    const publicDir = path.join(process.cwd(), "public");
    const imagesDir = path.join(publicDir, "images");

    const dirInfo = {
      public_exists: fs.existsSync(publicDir),
      images_exists: fs.existsSync(imagesDir),
      subdirs: fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [],
    };

    return NextResponse.json({
      products: diagnostics,
      directories: dirInfo,
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("Diagnostics error:", error);
    return NextResponse.json(
      { error: "Failed to run diagnostics", details: (error as Error).message },
      { status: 500 },
    );
  }
}
