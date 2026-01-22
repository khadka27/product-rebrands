import { type NextRequest, NextResponse } from "next/server";
import {
  WhyChoose,
  getWhyChooseByProductId,
  deleteWhyChooseByProductId,
  createWhyChoose,
} from "@/lib/models/why-choose";
import { validateWhyChoose } from "@/lib/utils";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Resolve product_id from params.id (could be numeric ID or slug)
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

    const whyChoosePoints = await getWhyChooseByProductId(productId);
    return NextResponse.json(whyChoosePoints);
  } catch (error) {
    console.error("Error fetching why choose points:", error);
    return NextResponse.json(
      { error: "Failed to fetch why choose points" },
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

    const data = await req.json();

    // Validate why choose data
    const validation = validateWhyChoose(data);

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    // Add the why choose point
    const whyChoose = await createWhyChoose({
      product_id: productId,
      title: data.title,
      description: data.description,
      display_order: data.display_order || 0,
    });

    return NextResponse.json(whyChoose, { status: 201 });
  } catch (error) {
    console.error("Error adding why choose point:", error);
    return NextResponse.json(
      { error: "Failed to add why choose point" },
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

    const deleted = await deleteWhyChooseByProductId(productId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting why choose points:", error);
    return NextResponse.json(
      { error: "Failed to delete why choose points" },
      { status: 500 },
    );
  }
}
