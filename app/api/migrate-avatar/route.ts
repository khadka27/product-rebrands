import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST() {
  let connection;
  try {
    connection = await db.getConnection();

    console.log("Checking reviews table structure...");

    // Check current table structure
    const [tableStructure] = (await connection.query(
      "DESCRIBE reviews"
    )) as any;

    console.log("Current reviews table structure:", tableStructure);

    // Check if avatar column already exists
    const [avatarColumn] = (await connection.query(
      "SHOW COLUMNS FROM reviews LIKE 'avatar'"
    )) as any;

    if (avatarColumn.length === 0) {
      console.log("Adding avatar column to reviews table...");
      await connection.query(
        "ALTER TABLE reviews ADD COLUMN avatar VARCHAR(255) NULL AFTER review_text"
      );
      console.log("Avatar column added successfully!");

      // Verify the column was added
      const [newStructure] = (await connection.query(
        "DESCRIBE reviews"
      )) as any;

      return NextResponse.json({
        success: true,
        message: "Avatar column added successfully",
        oldStructure: tableStructure,
        newStructure: newStructure,
      });
    } else {
      console.log("Avatar column already exists in reviews table");
      return NextResponse.json({
        success: true,
        message: "Avatar column already exists",
        structure: tableStructure,
      });
    }
  } catch (error) {
    console.error("Error in migration:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
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

export async function GET() {
  let connection;
  try {
    connection = await db.getConnection();

    // Check current table structure
    const [tableStructure] = (await connection.query(
      "DESCRIBE reviews"
    )) as any;

    return NextResponse.json({
      success: true,
      structure: tableStructure,
    });
  } catch (error) {
    console.error("Error checking table structure:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check table structure",
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
