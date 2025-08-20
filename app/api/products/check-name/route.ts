import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name");
  const excludeId = searchParams.get("excludeId"); // For edit mode

  if (!name) {
    return NextResponse.json(
      { error: "Product name is required" },
      { status: 400 }
    );
  }

  const connection = await db.getConnection();
  try {
    let query = "SELECT COUNT(*) as count FROM products WHERE name = $1";
    let params = [name];

    if (excludeId) {
      query += " AND product_id != $2";
      params.push(excludeId);
    }

    const result = await connection.query(query, params);
    const exists = result.rows[0].count > 0;

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Error checking product name:", error);
    return NextResponse.json(
      { error: "Failed to check product name" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}