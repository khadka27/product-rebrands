import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Testing database connection for product ID:", params.id);

    // Test basic connection
    const testResult = await db.query("SELECT 1 as test");
    console.log("Database connection test:", testResult.rows);

    // Check if products table exists
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'products'
    `);
    console.log("Products table check:", tableCheck.rows);

    // Check if product exists
    const productCheck = await db.query(
      "SELECT product_id, name FROM products WHERE product_id = $1",
      [params.id]
    );
    console.log("Product check result:", productCheck.rows);

    // Check all products
    const allProducts = await db.query(
      "SELECT product_id, name FROM products LIMIT 5"
    );
    console.log("All products (first 5):", allProducts.rows);

    return NextResponse.json({
      success: true,
      productId: params.id,
      databaseConnected: testResult.rows.length > 0,
      productsTableExists: tableCheck.rows.length > 0,
      productExists: productCheck.rows.length > 0,
      productData: productCheck.rows[0] || null,
      allProducts: allProducts.rows,
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