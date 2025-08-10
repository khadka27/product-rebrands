import db from "@/lib/db";

export async function addAvatarColumn() {
  let connection;
  try {
    connection = await db.getConnection();

    // Check if avatar column already exists
    const [columns] = (await connection.query(
      "SHOW COLUMNS FROM reviews LIKE 'avatar'"
    )) as any;

    if (columns.length === 0) {
      console.log("Adding avatar column to reviews table...");
      await connection.query(
        "ALTER TABLE reviews ADD COLUMN avatar VARCHAR(255) NULL AFTER review_text"
      );
      console.log("Avatar column added successfully!");
    } else {
      console.log("Avatar column already exists in reviews table");
    }
  } catch (error) {
    console.error("Error adding avatar column:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addAvatarColumn()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
