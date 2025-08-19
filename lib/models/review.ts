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
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500) NOT NULL,
      rating INT NOT NULL,
      review_text TEXT NOT NULL,
      avatar VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_product_id (product_id),
      CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
    )
  `);

  // Ensure avatar column exists (ignore if already there)
  try {
    await connection.query(
      `ALTER TABLE reviews ADD COLUMN avatar VARCHAR(500) NULL`
    );
  } catch (error: any) {
    if (
      !error ||
      !String(error.message || error)
        .toLowerCase()
        .includes("duplicate column")
    ) {
      // Non-duplicate error should bubble up
      // But if it's a different DB that already has the column, we ignore
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
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await existingConnection.execute(query, [
      review.product_id,
      review.name,
      review.address,
      review.rating,
      review.review_text,
      review.avatar || null,
    ]);

    const insertId = (result as any).insertId;

    // Get the created review using the same connection
    const [rows] = await existingConnection.execute(
      "SELECT * FROM reviews WHERE id = ?",
      [insertId]
    );

    if (!rows[0]) {
      throw new Error("Failed to create review");
    }

    return rows[0] as Review;
  } else {
    // Use new connection (for standalone operations)
    return withConnection(async (connection) => {
      await ensureReviewsTableExists(connection);
      const query = `
        INSERT INTO reviews (product_id, name, address, rating, review_text, avatar, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await connection.execute(query, [
        review.product_id,
        review.name,
        review.address,
        review.rating,
        review.review_text,
        review.avatar || null,
      ]);

      const insertId = (result as any).insertId;
      const newReview = await getReviewById(insertId);
      if (!newReview) {
        throw new Error("Failed to create review");
      }
      return newReview;
    });
  }
}

export async function getReviewById(id: number): Promise<Review | null> {
  return withConnection(async (connection) => {
    await ensureReviewsTableExists(connection);
    const query = `
      SELECT id, product_id, name, address, rating, review_text, avatar, created_at, updated_at
      FROM reviews
      WHERE id = ?
    `;

    const [rows] = await connection.execute(query, [id]);
    const reviewRows = rows as any[];

    if (reviewRows.length === 0) {
      return null;
    }

    return reviewRows[0];
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
      WHERE product_id = ?
      ORDER BY created_at DESC
    `;

    const [rows] = await connection.execute(query, [productId]);
    return rows as Review[];
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

    if (review.name !== undefined) {
      fields.push("name = ?");
      values.push(review.name);
    }
    if (review.address !== undefined) {
      fields.push("address = ?");
      values.push(review.address);
    }
    if (review.rating !== undefined) {
      fields.push("rating = ?");
      values.push(review.rating);
    }
    if (review.review_text !== undefined) {
      fields.push("review_text = ?");
      values.push(review.review_text);
    }
    if (review.avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(review.avatar);
    }

    if (fields.length === 0) {
      return getReviewById(id);
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    const query = `
      UPDATE reviews
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    await connection.execute(query, values);
    return getReviewById(id);
  });
}

export async function deleteReview(id: number): Promise<boolean> {
  return withConnection(async (connection) => {
    await ensureReviewsTableExists(connection);
    const query = "DELETE FROM reviews WHERE id = ?";
    const [result] = await connection.execute(query, [id]);
    return (result as any).affectedRows > 0;
  });
}

export async function deleteReviewsByProductId(
  productId: string,
  existingConnection?: any
): Promise<boolean> {
  if (existingConnection) {
    // Use existing connection (for transactions)
    await ensureReviewsTableExists(existingConnection);
    const query = "DELETE FROM reviews WHERE product_id = ?";
    const [result] = await existingConnection.execute(query, [productId]);
    return (result as any).affectedRows >= 0;
  } else {
    // Use new connection (for standalone operations)
    return withConnection(async (connection) => {
      await ensureReviewsTableExists(connection);
      const query = "DELETE FROM reviews WHERE product_id = ?";
      const [result] = await connection.execute(query, [productId]);
      return (result as any).affectedRows >= 0;
    });
  }
}
