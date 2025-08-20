import db from "@/lib/db";

export interface Ingredient {
  id: string;
  product_id: string;
  title: string;
  description: string;
  image: string | null;
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

export async function getIngredientsByProductId(
  productId: string
): Promise<Ingredient[]> {
  return withConnection(async (connection) => {
    const result = await connection.query(
      `SELECT id, product_id, title, description, image, display_order 
       FROM ingredients 
       WHERE product_id = $1 
       ORDER BY display_order ASC`,
      [productId]
    );
    return result.rows as Ingredient[];
  });
}

export async function createIngredient(
  ingredient: Omit<Ingredient, "id">,
  connection: any // Allow passing connection for transactions
): Promise<Ingredient> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      `INSERT INTO ingredients (product_id, title, description, image, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        ingredient.product_id,
        ingredient.title,
        ingredient.description,
        ingredient.image,
        ingredient.display_order,
      ]
    );

    return result.rows[0] as Ingredient;
  } finally {
    if (!connection) conn.release(); // Only release if connection was obtained here
  }
}

export async function updateIngredient(
  id: string,
  ingredient: Partial<Ingredient>
): Promise<boolean> {
  return withConnection(async (connection) => {
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    // Build the SET clause dynamically
    Object.entries(ingredient).forEach(([key, value]) => {
      if (key !== "id" && key !== "product_id") {
        updateFields.push(`${key} = $${paramCount++}`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return false; // Nothing to update
    }

    updateValues.push(id);

    const result = await connection.query(
      `UPDATE ingredients SET ${updateFields.join(", ")} WHERE id = $${paramCount}`,
      updateValues
    );

    return result.rowCount > 0;
  });
}

export async function deleteIngredient(
  id: string,
  connection?: any // Allow passing connection for transactions
): Promise<boolean> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      "DELETE FROM ingredients WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  } finally {
    if (!connection) conn.release();
  }
}

export async function deleteIngredientByProductId(
  productId: string,
  connection?: any // Allow passing connection for transactions
): Promise<boolean> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      "DELETE FROM ingredients WHERE product_id = $1",
      [productId]
    );
    return result.rowCount >= 0; // Return true if successful (even if 0 rows affected)
  } finally {
    if (!connection) conn.release();
  }
}