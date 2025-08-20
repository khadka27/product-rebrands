import { NextResponse } from "next/server";
import db from "@/lib/db";
import fs from "fs";
import path from "path";

function toPublicRelative(p: string | null | undefined): string {
  if (!p) return "";
  const s = p.replace(/\\/g, "/").trim();
  const noPublic = s.replace(/^public\//, "");
  return noPublic.startsWith("/") ? noPublic.slice(1) : noPublic;
}

function fileExists(publicRelativePath: string): boolean {
  if (!publicRelativePath) return false;
  const abs = path.join(process.cwd(), "public", publicRelativePath);
  return fs.existsSync(abs);
}

export async function GET() {
  try {
    const connection = await db.getConnection();
    try {
      const productsResult = await connection.query(
        "SELECT product_id, slug, name, product_image, product_badge FROM products ORDER BY created_at DESC"
      );
      const products = productsResult.rows;

      const missing: Array<{
        product_id: string;
        slug: string;
        name: string;
        kind: "product_image" | "product_badge" | "ingredient" | "avatar";
        path: string;
      }> = [];

      for (const p of products) {
        const pid: string = p.product_id;
        const slug: string = p.slug;
        const name: string = p.name;

        const productImage = toPublicRelative(p.product_image);
        if (productImage && !fileExists(productImage)) {
          missing.push({
            product_id: pid,
            slug,
            name,
            kind: "product_image",
            path: productImage,
          });
        }

        const productBadge = toPublicRelative(p.product_badge);
        if (productBadge && !fileExists(productBadge)) {
          missing.push({
            product_id: pid,
            slug,
            name,
            kind: "product_badge",
            path: productBadge,
          });
        }

        const ingredientsResult = await connection.query(
          "SELECT image FROM ingredients WHERE product_id = $1",
          [pid]
        );
        const ingredients = ingredientsResult.rows;
        
        for (const ing of ingredients) {
          const img = toPublicRelative(ing.image);
          if (img && !fileExists(img)) {
            missing.push({
              product_id: pid,
              slug,
              name,
              kind: "ingredient",
              path: img,
            });
          }
        }

        const reviewsResult = await connection.query(
          "SELECT avatar FROM reviews WHERE product_id = $1",
          [pid]
        );
        const reviews = reviewsResult.rows;
        
        for (const r of reviews) {
          const avatar = toPublicRelative(r.avatar);
          if (avatar && !fileExists(avatar)) {
            missing.push({
              product_id: pid,
              slug,
              name,
              kind: "avatar",
              path: avatar,
            });
          }
        }
      }

      const summary = {
        totalProducts: products.length || 0,
        missingCount: missing.length,
      };

      return NextResponse.json({ summary, missing });
    } finally {
      // Ensure release even on error
      connection.release();
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Diagnostics failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}