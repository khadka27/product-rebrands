import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Testing database connection for product ID:", params.id);

    // Test basic connection
    const [testResult]: any = await db.query("SELECT 1 as test");
    console.log("Database connection test:", testResult);

    // Check if products table exists
    const [tableCheck]: any = await db.query('SHOW TABLES LIKE "products"');
    console.log("Products table check:", tableCheck);

    // Check if product exists
    const [productCheck]: any = await db.query(
      "SELECT product_id, name FROM products WHERE product_id = ?",
      [params.id]
    );
    console.log("Product check result:", productCheck);

    // Check all products
    const [allProducts]: any = await db.query(
      "SELECT product_id, name FROM products LIMIT 5"
    );
    console.log("All products (first 5):", allProducts);

    return NextResponse.json({
      success: true,
      productId: params.id,
      databaseConnected: testResult.length > 0,
      productsTableExists: tableCheck.length > 0,
      productExists: productCheck.length > 0,
      productData: productCheck[0] || null,
      allProducts: allProducts,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        error: "Database test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
