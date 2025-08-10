import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  let connection;
  try {
    console.log("Checking reviews table structure...");
    connection = await db.getConnection();

    // Check current table structure
    const [columns] = (await connection.query("DESCRIBE reviews")) as any;

    console.log("Current reviews table structure:", columns);

    // Check if avatar column exists
    const avatarExists = columns.some((col: any) => col.Field === "avatar");
    console.log("Avatar column exists:", avatarExists);

    if (!avatarExists) {
      console.log("Adding avatar column to reviews table...");

      // Add the avatar column
      await connection.query(
        "ALTER TABLE reviews ADD COLUMN avatar VARCHAR(255) NULL AFTER review_text"
      );

      console.log("Avatar column added successfully!");

      // Verify it was added
      const [newColumns] = (await connection.query("DESCRIBE reviews")) as any;

      console.log("Updated table structure:", newColumns);
    }

    return NextResponse.json({
      success: true,
      message: avatarExists
        ? "Avatar column already exists"
        : "Avatar column added successfully",
      tableStructure: columns,
    });
  } catch (error) {
    console.error("Error checking/updating reviews table:", error);
    return NextResponse.json(
      {
        error: "Failed to update reviews table",
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
