import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");
    const excludeId = searchParams.get("excludeId"); // For edit mode

    console.log("Check name request:", { name, excludeId });

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    try {
      let query = "SELECT COUNT(*) as count FROM products WHERE name = ?";
      let params = [name];

      if (excludeId) {
        query += " AND product_id != ?";
        params.push(excludeId);
      }

      console.log("Executing query:", query, params);
      const [rows]: any = await connection.query(query, params);
      const exists = rows[0].count > 0;

      console.log("Check name result:", { exists, count: rows[0].count });
      return NextResponse.json({ exists });
    } catch (queryError) {
      console.error("Query error in check-name:", queryError);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error in check-name API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
