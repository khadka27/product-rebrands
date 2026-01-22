import { type NextRequest, NextResponse } from "next/server";
import {
  createIngredient,
  getIngredientsByProductId,
  deleteIngredientByProductId,
} from "@/lib/models/ingredient";
import { validateIngredient } from "@/lib/utils";
import { processImage, ensureDirectoryExists } from "@/lib/server-utils";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Resolve product_id from params.id (could be numeric ID or slug)
    const connection = await (await import("@/lib/db")).default.getConnection();
    let productId: string;

    try {
      const numericId = !isNaN(Number(params.id))
        ? parseInt(params.id, 10)
        : null;
      let productResult;

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

      productId = productResult.rows[0].product_id.toString();
    } finally {
      connection.release();
    }

    const ingredients = await getIngredientsByProductId(productId);
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Resolve product_id from params.id (could be numeric ID or slug)
    const db = (await import("@/lib/db")).default;
    const connection = await db.getConnection();
    let productId: string;

    try {
      const numericId = !isNaN(Number(params.id))
        ? parseInt(params.id, 10)
        : null;
      let productResult;

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

      productId = productResult.rows[0].product_id.toString();
    } finally {
      connection.release();
    }

    // Parse the form data
    const formData = await req.formData();

    // Extract ingredient data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const display_order = Number.parseInt(
      (formData.get("display_order") as string) || "0",
    );

    // Validate ingredient data
    const validation = validateIngredient({
      title,
      description,
    });

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    // Process ingredient image
    let image = "";
    const imageFile = formData.get("image") as File;
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = `ingredient_${Date.now()}`;
      const targetDir = path.join(
        process.cwd(),
        "public",
        "images",
        "ingredients",
      );

      ensureDirectoryExists(targetDir);
      image = await processImage(
        { buffer, originalname: imageFile.name } as Express.Multer.File,
        targetDir,
        filename,
      );
    }

    // Add the ingredient
    const ingredient = await createIngredient(
      {
        product_id: productId,
        title,
        description,
        image,
        display_order,
      },
      null,
    );

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Resolve product_id from params.id (could be numeric ID or slug)
    const db = (await import("@/lib/db")).default;
    const connection = await db.getConnection();
    let productId: string;

    try {
      const numericId = !isNaN(Number(params.id))
        ? parseInt(params.id, 10)
        : null;
      let productResult;

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

      productId = productResult.rows[0].product_id.toString();
    } finally {
      connection.release();
    }

    const deleted = await deleteIngredientByProductId(productId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ingredients:", error);
    return NextResponse.json(
      { error: "Failed to delete ingredients" },
      { status: 500 },
    );
  }
}
