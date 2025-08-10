import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const productId = params.id;
    console.log("Fetching product with simple query:", productId);

    connection = await db.getConnection();
    console.log("Got connection");

    // Just fetch basic product info first
    const [productResult] = (await connection.query(
      `SELECT product_id, name, paragraph, bullet_points, redirect_link, generated_link, money_back_days, product_image, product_badge FROM products WHERE product_id = ?`,
      [productId]
    )) as any;

    console.log("Product query result:", productResult);

    if (productResult.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productResult[0];

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        id: product.product_id,
        image: product.product_image,
        badge_image: product.product_badge,
        bullet_points:
          typeof product.bullet_points === "string"
            ? JSON.parse(product.bullet_points || "[]")
            : product.bullet_points || [],
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      console.log("Releasing connection");
      connection.release();
    }
  }
}
