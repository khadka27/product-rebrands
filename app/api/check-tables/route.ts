import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  let connection;
  try {
    console.log("Checking database tables...");
    connection = await db.getConnection();

    // List all tables
    const [tables] = (await connection.query("SHOW TABLES")) as any;

    console.log("All tables in database:", tables);

    // Check if reviews table exists
    const reviewsExists = tables.some(
      (table: any) => Object.values(table)[0] === "reviews"
    );

    // Check if customer_reviews table exists
    const customerReviewsExists = tables.some(
      (table: any) => Object.values(table)[0] === "customer_reviews"
    );

    console.log("Reviews table exists:", reviewsExists);
    console.log("Customer_reviews table exists:", customerReviewsExists);

    let tableStructure = null;
    let tableName = null;

    if (reviewsExists) {
      tableName = "reviews";
      const [columns] = (await connection.query("DESCRIBE reviews")) as any;
      tableStructure = columns;
      console.log("Reviews table structure:", columns);
    }

    if (customerReviewsExists) {
      tableName = "customer_reviews";
      const [columns] = (await connection.query(
        "DESCRIBE customer_reviews"
      )) as any;
      tableStructure = columns;
      console.log("Customer_reviews table structure:", columns);
    }

    return NextResponse.json({
      success: true,
      allTables: tables,
      reviewsExists,
      customerReviewsExists,
      tableStructure,
      activeTable: tableName,
    });
  } catch (error) {
    console.error("Error checking database tables:", error);
    return NextResponse.json(
      {
        error: "Failed to check database tables",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
