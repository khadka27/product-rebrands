import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { theme } = await req.json();
    const connection = await db.getConnection();

    try {
      // Get existing product
      const [rows]: any = await connection.query(
        "SELECT * FROM products WHERE id = ?",
        [params.id]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Update product theme in database
      const [result]: any = await connection.query(
        "UPDATE products SET theme = ? WHERE id = ?",
        [JSON.stringify(theme), params.id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "Failed to update theme" },
          { status: 500 }
        );
      }

      // Get updated product
      const [updatedProduct]: any = await connection.query(
        "SELECT * FROM products WHERE id = ?",
        [params.id]
      );

      return NextResponse.json(updatedProduct[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating product theme:", error);
    return NextResponse.json(
      { error: "Failed to update product theme" },
      { status: 500 }
    );
  }
}
