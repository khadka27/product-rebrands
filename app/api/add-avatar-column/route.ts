import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  let connection;
  try {
    console.log("Starting avatar column migration...");
    connection = await db.getConnection();

    // First, check if the column already exists
    const [columns] = (await connection.query(
      "SHOW COLUMNS FROM reviews LIKE 'avatar'"
    )) as any;

    if (columns.length > 0) {
      console.log("Avatar column already exists");
      return NextResponse.json({
        success: true,
        message: "Avatar column already exists",
      });
    }

    // Add the avatar column
    await connection.query(
      "ALTER TABLE reviews ADD COLUMN avatar VARCHAR(255) NULL"
    );

    console.log("Avatar column added successfully");

    return NextResponse.json({
      success: true,
      message: "Avatar column added successfully",
    });
  } catch (error) {
    console.error("Error adding avatar column:", error);
    return NextResponse.json(
      {
        error: "Failed to add avatar column",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
