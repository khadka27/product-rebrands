import db from "@/lib/db";

export interface WhyChoose {
  id: string;
  product_id: string;
  title: string;
  description: string;
  display_order: number;
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

export async function getWhyChooseByProductId(
  productId: string,
  connection?: any
): Promise<WhyChoose[]> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      `SELECT id, product_id, title, description, display_order 
       FROM why_choose 
       WHERE product_id = $1 
       ORDER BY display_order ASC`,
      [productId]
    );
    return result.rows as WhyChoose[];
  } finally {
    if (!connection) conn.release();
  }
}

export async function createWhyChoose(
  whyChoose: Omit<WhyChoose, "id">,
  connection?: any
): Promise<WhyChoose> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      `INSERT INTO why_choose (product_id, title, description, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        whyChoose.product_id,
        whyChoose.title,
        whyChoose.description,
        whyChoose.display_order,
      ]
    );

    return result.rows[0] as WhyChoose;
  } finally {
    if (!connection) conn.release();
  }
}

export async function updateWhyChoose(
  id: string,
  whyChoose: Partial<WhyChoose>,
  connection?: any
): Promise<boolean> {
  const conn = connection || (await db.getConnection());
  try {
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    // Build the SET clause dynamically
    Object.entries(whyChoose).forEach(([key, value]) => {
      if (key !== "id" && key !== "product_id") {
        updateFields.push(`${key} = $${paramCount++}`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return false; // Nothing to update
    }

    updateValues.push(id);

    const result = await conn.query(
      `UPDATE why_choose SET ${updateFields.join(", ")} WHERE id = $${paramCount}`,
      updateValues
    );

    return result.rowCount > 0;
  } finally {
    if (!connection) conn.release();
  }
}

export async function deleteWhyChoose(
  id: string,
  connection?: any
): Promise<boolean> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      "DELETE FROM why_choose WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  } finally {
    if (!connection) conn.release();
  }
}

export async function deleteWhyChooseByProductId(
  productId: string,
  connection?: any
): Promise<boolean> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      "DELETE FROM why_choose WHERE product_id = $1",
      [productId]
    );
    return result.rowCount >= 0; // Return true if successful (even if 0 rows affected)
  } finally {
    if (!connection) conn.release();
  }
}