import pool from "../db";

export interface Ingredient {
  id?: number;
  product_id: number;
  title: string;
  description: string;
  image: string;
  display_order: number;
}

export async function addIngredient(
  ingredient: Omit<Ingredient, "id">
): Promise<Ingredient> {
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      `INSERT INTO ingredients 
       (product_id, title, description, image, display_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        ingredient.product_id,
        ingredient.title,
        ingredient.description,
        ingredient.image,
        ingredient.display_order,
      ]
    );

    return {
      id: result.insertId,
      ...ingredient,
    };
  } finally {
    connection.release();
  }
}

export async function getIngredientsByProductId(
  productId: number
): Promise<Ingredient[]> {
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      "SELECT * FROM ingredients WHERE product_id = ? ORDER BY display_order",
      [productId]
    );

    return rows as Ingredient[];
  } finally {
    connection.release();
  }
}

export async function updateIngredient(
  id: number,
  ingredient: Partial<Ingredient>
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    // Build the SET part of the query dynamically
    const setClause = Object.entries(ingredient)
      .filter(([key]) => key !== "id" && key !== "product_id")
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(ingredient)
      .filter(([key]) => key !== "id" && key !== "product_id")
      .map(([, value]) => value);

    // Add the ID to the values array
    values.push(id);

    const [result]: any = await connection.query(
      `UPDATE ingredients SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

export async function deleteIngredient(id: number): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      "DELETE FROM ingredients WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

export async function deleteIngredientsByProductId(
  productId: number
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      "DELETE FROM ingredients WHERE product_id = ?",
      [productId]
    );

    return true;
  } finally {
    connection.release();
  }
}
