import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { theme } = await req.json();
    const connection = await db.getConnection();

    try {
      // Resolve product_id from params.id (could be numeric ID or slug)
      let productResult;
      const numericId = !isNaN(Number(params.id))
        ? parseInt(params.id, 10)
        : null;

      if (numericId !== null) {
        productResult = await connection.query(
          "SELECT product_id FROM products WHERE product_id = $1",
          [numericId],
        );
      } else {
        productResult = await connection.query(
          "SELECT product_id FROM products WHERE slug = $1",
          [params.id],
        );
      }

      if (productResult.rows.length === 0) {
        connection.release();
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const product_id = productResult.rows[0].product_id;

      // Build the INSERT query with ON CONFLICT for PostgreSQL
      const columns = Object.keys(theme);
      const values = Object.values(theme);
      const placeholders = values.map((_, index) => `$${index + 2}`);
      const updateClauses = columns.map(
        (col, index) => `${col} = $${index + 2}`,
      );

      const insertQuery = `
        INSERT INTO product_themes (product_id, ${columns.join(", ")})
        VALUES ($1, ${placeholders.join(", ")})
        ON CONFLICT (product_id) 
        DO UPDATE SET ${updateClauses.join(", ")}
        RETURNING *
      `;

      const result = await connection.query(insertQuery, [
        product_id,
        ...values,
      ]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Failed to update theme" },
          { status: 500 },
        );
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating product theme:", error);
    return NextResponse.json(
      { error: "Failed to update product theme" },
      { status: 500 },
    );
  }
}
