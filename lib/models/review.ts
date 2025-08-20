import db from "@/lib/db";

export interface Review {
  id?: number;
  product_id: string;
  name: string;
  address: string;
  rating: number; // 1-5 stars
  review_text: string;
  avatar?: string; // Path to avatar image
  created_at?: Date;
  updated_at?: Date;
}

async function withConnection<T>(
  operation: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await db.getConnection();
  try {
    return await operation(connection);
  } finally {
    connection.release();
  }
}

// Ensure the reviews table exists (fallback safety for environments where
// global initialization didn't run). Uses the provided connection.
async function ensureReviewsTableExists(connection: any): Promise<void> {
  // Create table if it doesn't exist
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT NOT NULL,
      avatar VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
    )
  `);

  // Create index if it doesn't exist
  await connection.query(`
    CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)
  `);

  // Create or replace the update trigger function
  await connection.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create trigger for updated_at on reviews table
  await connection.query(`
    DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
    CREATE TRIGGER update_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // Ensure avatar column exists (ignore if already there)
  try {
    await connection.query(
      `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS avatar VARCHAR(500)`
    );
  } catch (error: any) {
    // PostgreSQL handles IF NOT EXISTS, so we shouldn't get duplicate column errors
    // But we'll keep this for safety
    if (
      !error ||
      !String(error.message || error)
        .toLowerCase()
        .includes("already exists")
    ) {
      // Log but don't throw - the column might already exist
      console.log("Note: Avatar column might already exist");
    }
  }
}

export async function createReview(
  review: Omit<Review, "id" | "created_at" | "updated_at">,
  existingConnection?: any
): Promise<Review> {
  if (existingConnection) {
    // Use existing connection (for transactions)
    await ensureReviewsTableExists(existingConnection);
    const query = `
      INSERT INTO reviews (product_id, name, address, rating, review_text, avatar, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const result = await existingConnection.query(query, [
      review.product_id,
      review.name,
      review.address,
      review.rating,
      review.review_text,
      review.avatar || null,
    ]);

    if (!result.rows[0]) {
      throw new Error("Failed to create review");
    }

    return result.rows[0] as Review;
  } else {
    // Use new connection (for standalone operations)
    return withConnection(async (connection) => {
      await ensureReviewsTableExists(connection);
      const query = `
        INSERT INTO reviews (product_id, name, address, rating, review_text, avatar, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;

      const result = await connection.query(query, [
        review.product_id,
        review.name,
        review.address,
        review.rating,
        review.review_text,
        review.avatar || null,
      ]);

      if (!result.rows[0]) {
        throw new Error("Failed to create review");
      }
      
      return result.rows[0] as Review;
    });
  }
}

export async function getReviewById(id: number): Promise<Review | null> {
  return withConnection(async (connection) => {
    await ensureReviewsTableExists(connection);
    const query = `
      SELECT id, product_id, name, address, rating, review_text, avatar, created_at, updated_at
      FROM reviews
      WHERE id = $1
    `;

    const result = await connection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Review;
  });
}

export async function getReviewsByProductId(
  productId: string
): Promise<Review[]> {
  return withConnection(async (connection) => {
    await ensureReviewsTableExists(connection);
    const query = `
      SELECT id, product_id, name, address, rating, review_text, avatar, created_at, updated_at
      FROM reviews
      WHERE product_id = $1
      ORDER BY created_at DESC
    `;

    const result = await connection.query(query, [productId]);
    return result.rows as Review[];
  });
}

export async function updateReview(
  id: number,
  review: Partial<Omit<Review, "id" | "created_at" | "updated_at">>
): Promise<Review | null> {
  return withConnection(async (connection) => {
    await ensureReviewsTableExists(connection);
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (review.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(review.name);
    }
    if (review.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(review.address);
    }
    if (review.rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(review.rating);
    }
    if (review.review_text !== undefined) {
      fields.push(`review_text = $${paramCount++}`);
      values.push(review.review_text);
    }
    if (review.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(review.avatar);
    }

    if (fields.length === 0) {
      return getReviewById(id);
    }

    // Add the id parameter at the end
    values.push(id);

    const query = `
      UPDATE reviews
      SET ${fields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await connection.query(query, values);
    return result.rows[0] as Review || null;
  });
}

export async function deleteReview(id: number): Promise<boolean> {
  return withConnection(async (connection) => {
    await ensureReviewsTableExists(connection);
    const query = "DELETE FROM reviews WHERE id = $1";
    const result = await connection.query(query, [id]);
    return result.rowCount > 0;
  });
}

export async function deleteReviewsByProductId(
  productId: string,
  existingConnection?: any
): Promise<boolean> {
  if (existingConnection) {
    // Use existing connection (for transactions)
    await ensureReviewsTableExists(existingConnection);
    const query = "DELETE FROM reviews WHERE product_id = $1";
    const result = await existingConnection.query(query, [productId]);
    return result.rowCount >= 0;
  } else {
    // Use new connection (for standalone operations)
    return withConnection(async (connection) => {
      await ensureReviewsTableExists(connection);
      const query = "DELETE FROM reviews WHERE product_id = $1";
      const result = await connection.query(query, [productId]);
      return result.rowCount >= 0;
    });
  }
}