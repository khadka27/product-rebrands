import pool from "../db"

export interface WhyChoose {
  id?: number
  product_id: number
  title: string
  description: string
  display_order: number
}

export async function addWhyChoose(whyChoose: Omit<WhyChoose, "id">): Promise<WhyChoose> {
  const connection = await pool.getConnection()

  try {
    const [result]: any = await connection.query(
      `INSERT INTO why_choose 
       (product_id, title, description, display_order) 
       VALUES (?, ?, ?, ?)`,
      [whyChoose.product_id, whyChoose.title, whyChoose.description, whyChoose.display_order],
    )

    return {
      id: result.insertId,
      ...whyChoose,
    }
  } finally {
    connection.release()
  }
}

export async function getWhyChooseByProductId(productId: number): Promise<WhyChoose[]> {
  const connection = await pool.getConnection()

  try {
    const [rows]: any = await connection.query("SELECT * FROM why_choose WHERE product_id = ? ORDER BY display_order", [
      productId,
    ])

    return rows as WhyChoose[]
  } finally {
    connection.release()
  }
}

export async function updateWhyChoose(id: number, whyChoose: Partial<WhyChoose>): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    // Build the SET part of the query dynamically
    const setClause = Object.entries(whyChoose)
      .filter(([key]) => key !== "id" && key !== "product_id")
      .map(([key]) => `${key} = ?`)
      .join(", ")

    const values = Object.entries(whyChoose)
      .filter(([key]) => key !== "id" && key !== "product_id")
      .map(([, value]) => value)

    // Add the ID to the values array
    values.push(id)

    const [result]: any = await connection.query(`UPDATE why_choose SET ${setClause} WHERE id = ?`, values)

    return result.affectedRows > 0
  } finally {
    connection.release()
  }
}

export async function deleteWhyChoose(id: number): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    const [result]: any = await connection.query("DELETE FROM why_choose WHERE id = ?", [id])

    return result.affectedRows > 0
  } finally {
    connection.release()
  }
}

export async function deleteWhyChooseByProductId(productId: number): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    const [result]: any = await connection.query("DELETE FROM why_choose WHERE product_id = ?", [productId])

    return true
  } finally {
    connection.release()
  }
}
