import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  let connection;
  try {
    console.log("Testing database connection...");

    connection = await db.getConnection();
    console.log("Got connection from pool");

    const [result] = (await connection.query("SELECT 1 as test")) as any;
    console.log("Query result:", result);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result: result[0],
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      console.log("Releasing connection...");
      connection.release();
    }
  }
}
