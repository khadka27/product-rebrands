import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { processImage } from "@/lib/server-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await db.getConnection();

    try {
      // Get product
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

      const product = rows[0];

      // Get ingredients
      const [ingredients]: any = await connection.query(
        "SELECT * FROM ingredients WHERE product_id = ? ORDER BY display_order",
        [product.id]
      );

      // Get why_choose items
      const [whyChoose]: any = await connection.query(
        "SELECT * FROM why_choose WHERE product_id = ? ORDER BY display_order",
        [product.id]
      );

      // Parse theme if it exists and is stored as JSON
      if (product.theme && typeof product.theme === "string") {
        try {
          product.theme = JSON.parse(product.theme);
        } catch (e) {
          console.error("Error parsing theme:", e);
        }
      }

      return NextResponse.json({
        ...product,
        ingredients,
        whyChoose,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse form data
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const redirect_link = formData.get("redirect_link") as string;
    const money_back_days = Number.parseInt(
      formData.get("money_back_days") as string
    );
    const imageFile = formData.get("image") as File | null;

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

      const existingProduct = rows[0];

      // Generate slug if name changed
      const slug =
        name !== existingProduct.name
          ? generateSlug(name)
          : existingProduct.slug;

      // Process image if provided
      let imagePath = existingProduct.product_image;
      if (imageFile) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const file = {
          buffer,
          originalname: imageFile.name,
          mimetype: imageFile.type,
        } as Express.Multer.File;

        imagePath = await processImage(file, "public/images/products", slug);
      }

      // Update product in database
      const [result]: any = await connection.query(
        `UPDATE products SET 
          name = ?, 
          description = ?, 
          slug = ?,
          redirect_link = ?,
          money_back_days = ?,
          product_image = ?
        WHERE id = ?`,
        [
          name,
          description,
          slug,
          redirect_link,
          money_back_days,
          imagePath,
          params.id,
        ]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "Failed to update product" },
          { status: 500 }
        );
      }

      // Get updated product
      const [updatedProducts]: any = await connection.query(
        "SELECT * FROM products WHERE id = ?",
        [params.id]
      );

      return NextResponse.json(updatedProducts[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await db.getConnection();

    try {
      // Delete product from database
      const [result]: any = await connection.query(
        "DELETE FROM products WHERE id = ?",
        [params.id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
