import pool from "../db"
import { generateSlug } from "../utils"
import { generateProductId } from "../utils"
import type { Ingredient } from "./ingredient"
import type { WhyChoose } from "./why-choose"
import type { ProductTheme } from "./theme"
import { getProductTheme } from "./theme"

export interface Product {
  id?: number
  product_id: string
  name: string
  slug: string
  description: string
  redirect_link: string
  product_image: string
  product_badge: string
  money_back_days: number
  created_at?: Date
  updated_at?: Date
  ingredients?: Ingredient[]
  why_choose?: WhyChoose[]
  theme?: ProductTheme
}

export async function createProduct(
  product: Omit<Product, "id" | "product_id" | "slug" | "created_at" | "updated_at">,
): Promise<Product> {
  const connection = await pool.getConnection()

  try {
    // Generate a unique product ID (3-6 digits)
    const productId = generateProductId()

    // Generate slug from product name
    const slug = generateSlug(product.name)

    // Insert product
    const [result]: any = await connection.query(
      `INSERT INTO products 
       (product_id, name, slug, description, redirect_link, product_image, product_badge, money_back_days) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        product.name,
        slug,
        product.description,
        product.redirect_link,
        product.product_image,
        product.product_badge,
        product.money_back_days,
      ],
    )

    return {
      id: result.insertId,
      product_id: productId,
      slug,
      ...product,
    }
  } finally {
    connection.release()
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const connection = await pool.getConnection()

  try {
    const [rows]: any = await connection.query("SELECT * FROM products WHERE slug = ?", [slug])

    if (rows.length === 0) {
      return null
    }

    return rows[0] as Product
  } finally {
    connection.release()
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  const connection = await pool.getConnection()

  try {
    const [rows]: any = await connection.query("SELECT * FROM products WHERE id = ?", [id])

    if (rows.length === 0) {
      return null
    }

    return rows[0] as Product
  } finally {
    connection.release()
  }
}

export async function getProductByProductId(productId: string): Promise<Product | null> {
  const connection = await pool.getConnection()

  try {
    const [rows]: any = await connection.query("SELECT * FROM products WHERE product_id = ?", [productId])

    if (rows.length === 0) {
      return null
    }

    return rows[0] as Product
  } finally {
    connection.release()
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const connection = await pool.getConnection()

  try {
    const [rows]: any = await connection.query("SELECT * FROM products ORDER BY created_at DESC")
    return rows as Product[]
  } finally {
    connection.release()
  }
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    // If name is being updated, update the slug as well
    if (product.name) {
      product.slug = generateSlug(product.name)
    }

    // Build the SET part of the query dynamically
    const setClause = Object.entries(product)
      .filter(([key]) => key !== "id" && key !== "product_id" && key !== "created_at" && key !== "updated_at")
      .map(([key]) => `${key} = ?`)
      .join(", ")

    const values = Object.entries(product)
      .filter(([key]) => key !== "id" && key !== "product_id" && key !== "created_at" && key !== "updated_at")
      .map(([, value]) => value)

    // Add the ID to the values array
    values.push(id)

    const [result]: any = await connection.query(`UPDATE products SET ${setClause} WHERE id = ?`, values)

    return result.affectedRows > 0
  } finally {
    connection.release()
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  const connection = await pool.getConnection()

  try {
    const [result]: any = await connection.query("DELETE FROM products WHERE id = ?", [id])

    return result.affectedRows > 0
  } finally {
    connection.release()
  }
}

export async function getProductWithDetails(productId: number | string): Promise<Product | null> {
  const connection = await pool.getConnection()

  try {
    let product: Product | null

    if (typeof productId === "number") {
      product = await getProductById(productId)
    } else {
      // Check if it's a slug or product_id
      if (productId.length <= 6 && /^\d+$/.test(productId)) {
        product = await getProductByProductId(productId)
      } else {
        product = await getProductBySlug(productId)
      }
    }

    if (!product) {
      return null
    }

    // Get ingredients
    const [ingredientRows]: any = await connection.query(
      "SELECT * FROM ingredients WHERE product_id = ? ORDER BY display_order",
      [product.id],
    )

    // Get why choose points
    const [whyChooseRows]: any = await connection.query(
      "SELECT * FROM why_choose WHERE product_id = ? ORDER BY display_order",
      [product.id],
    )

    // Get theme
    const theme = await getProductTheme(product.id!)

    return {
      ...product,
      ingredients: ingredientRows,
      why_choose: whyChooseRows,
      theme: theme || undefined,
    }
  } finally {
    connection.release()
  }
}

export async function recordVisit(
  productId: number,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string,
): Promise<void> {
  const connection = await pool.getConnection()

  try {
    await connection.query("INSERT INTO visits (product_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)", [
      productId,
      ipAddress,
      userAgent,
      referrer,
    ])
  } finally {
    connection.release()
  }
}

export async function getProductStats(): Promise<any> {
  const connection = await pool.getConnection()

  try {
    // Get total products
    const [totalProductsResult]: any = await connection.query("SELECT COUNT(*) as total FROM products")

    // Get total visits
    const [totalVisitsResult]: any = await connection.query("SELECT COUNT(*) as total FROM visits")

    // Get visits by product
    const [productVisitsResult]: any = await connection.query(`
      SELECT p.name, p.product_id, COUNT(v.id) as visit_count 
      FROM products p
      LEFT JOIN visits v ON p.id = v.product_id
      GROUP BY p.id
      ORDER BY visit_count DESC
    `)

    // Get recent visits
    const [recentVisitsResult]: any = await connection.query(`
      SELECT v.*, p.name as product_name 
      FROM visits v
      JOIN products p ON v.product_id = p.id
      ORDER BY v.visit_date DESC
      LIMIT 10
    `)

    return {
      totalProducts: totalProductsResult[0].total,
      totalVisits: totalVisitsResult[0].total,
      productVisits: productVisitsResult,
      recentVisits: recentVisitsResult,
    }
  } finally {
    connection.release()
  }
}
