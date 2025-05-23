import pool from "../db";
import { generateSlug } from "../utils";
import { getProductTheme } from "./theme";

// Generate a unique product ID (3-6 digits)
function generateProductId(): string {
  return Math.floor(100 + Math.random() * 900000).toString();
}

// Import the ProductTheme from theme.ts to ensure consistency
import type { ProductTheme } from "./theme";

// Import related types
import type { Ingredient } from "./ingredient";
import type { WhyChoose } from "./why-choose";

export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  productId: string;
  redirect_link: string;
  money_back_days: number;
  image: string;
  product_badge?: string;
  theme?: ProductTheme;
  createdAt: Date;
  updatedAt: Date;
}

// Extended type for product with related items
export interface ProductWithDetails extends Product {
  ingredients?: Ingredient[];
  whyChoose?: WhyChoose[];
  why_choose?: any[]; // For backward compatibility
}

export async function createProduct(
  product: Omit<
    Product,
    "id" | "product_id" | "slug" | "created_at" | "updated_at"
  >
): Promise<Product> {
  const connection = await pool.getConnection();

  try {
    // Generate a unique product ID (3-6 digits)
    const productId = generateProductId();

    // Generate slug from product name
    const slug = generateSlug(product.name);

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
        product.image,
        product.product_badge,
        product.money_back_days,
      ]
    );

    return {
      id: result.insertId,
      // Map database fields to TypeScript interface
      name: product.name,
      description: product.description,
      slug,
      productId, // Using the right property name instead of product_id
      redirect_link: product.redirect_link,
      money_back_days: product.money_back_days,
      image: product.image,
      product_badge: product.product_badge,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } finally {
    connection.release();
  }
}

export async function getProductBySlug(slug: string) {
  const connection = await pool.getConnection();

  try {
    // Get product
    const [products]: any = await connection.query(
      "SELECT * FROM products WHERE slug = ?",
      [slug]
    );

    if (products.length === 0) {
      return null;
    }

    const product = products[0];

    // Get ingredients
    const [ingredients]: any = await connection.query(
      "SELECT * FROM ingredients WHERE product_id = ? ORDER BY display_order",
      [product.id]
    );

    // Get why_choose items
    const [whyChoose]: any = await connection.query(
      "SELECT * FROM why_choose WHERE product_id = ? ORDER BY display_order",
      [product.id]
    );

    // Parse theme if it exists and is stored as JSON
    if (product.theme && typeof product.theme === "string") {
      try {
        product.theme = JSON.parse(product.theme);
      } catch (e) {
        console.error("Error parsing theme:", e);
      }
    }

    return {
      ...product,
      ingredients,
      whyChoose,
    };
  } finally {
    connection.release();
  }
}

export async function getProductById(id: string) {
  const connection = await pool.getConnection();

  try {
    // Get product
    const [products]: any = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (products.length === 0) {
      return null;
    }

    const product = products[0];

    // Get ingredients
    const [ingredients]: any = await connection.query(
      "SELECT * FROM ingredients WHERE product_id = ? ORDER BY display_order",
      [product.id]
    );

    // Get why_choose items
    const [whyChoose]: any = await connection.query(
      "SELECT * FROM why_choose WHERE product_id = ? ORDER BY display_order",
      [product.id]
    );

    // Parse theme if it exists and is stored as JSON
    if (product.theme && typeof product.theme === "string") {
      try {
        product.theme = JSON.parse(product.theme);
      } catch (e) {
        console.error("Error parsing theme:", e);
      }
    }

    return {
      ...product,
      ingredients,
      whyChoose,
    };
  } finally {
    connection.release();
  }
}

export async function getProductByProductId(
  productId: string
): Promise<Product | null> {
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      "SELECT * FROM products WHERE product_id = ?",
      [productId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as Product;
  } finally {
    connection.release();
  }
}

export async function getAllProducts() {
  const connection = await pool.getConnection();

  try {
    const [products]: any = await connection.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );

    return products;
  } finally {
    connection.release();
  }
}

export async function updateProduct(
  id: number,
  product: Partial<Product>
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    // If name is being updated, update the slug as well
    if (product.name) {
      product.slug = generateSlug(product.name);
    }

    // Build the SET part of the query dynamically
    const setClause = Object.entries(product)
      .filter(
        ([key]) =>
          key !== "id" &&
          key !== "product_id" &&
          key !== "created_at" &&
          key !== "updated_at"
      )
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(product)
      .filter(
        ([key]) =>
          key !== "id" &&
          key !== "product_id" &&
          key !== "created_at" &&
          key !== "updated_at"
      )
      .map(([, value]) => value);

    // Add the ID to the values array
    values.push(id);

    const [result]: any = await connection.query(
      `UPDATE products SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

export async function getProductWithDetails(
  productId: number | string
): Promise<ProductWithDetails | null> {
  const connection = await pool.getConnection();

  try {
    let product: Product | null;

    if (typeof productId === "number") {
      product = await getProductById(productId.toString());
    } else {
      // Check if it's a slug or product_id
      product =
        productId.length <= 6 && /^\d+$/.test(productId)
          ? await getProductByProductId(productId)
          : await getProductBySlug(productId);
    }

    if (!product) {
      return null;
    }

    // Get ingredients
    const [ingredientRows]: any = await connection.query(
      "SELECT * FROM ingredients WHERE product_id = ? ORDER BY display_order",
      [product.id]
    );

    // Get why choose points
    const [whyChooseRows]: any = await connection.query(
      "SELECT * FROM why_choose WHERE product_id = ? ORDER BY display_order",
      [product.id]
    );

    // Get theme
    const theme = await getProductTheme(parseInt(product.id.toString()));

    return {
      ...product,
      ingredients: ingredientRows,
      why_choose: whyChooseRows,
      theme: theme ?? undefined,
    };
  } finally {
    connection.release();
  }
}

export async function recordVisit(
  productId: number,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
): Promise<void> {
  const connection = await pool.getConnection();

  try {
    await connection.query(
      "INSERT INTO visits (product_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)",
      [productId, ipAddress, userAgent, referrer]
    );
  } finally {
    connection.release();
  }
}

export async function getProductStats(): Promise<any> {
  const connection = await pool.getConnection();

  try {
    // Get total products
    const [totalProductsResult]: any = await connection.query(
      "SELECT COUNT(*) as total FROM products"
    );

    // Get total visits
    const [totalVisitsResult]: any = await connection.query(
      "SELECT COUNT(*) as total FROM visits"
    );

    // Get visits by product
    const [productVisitsResult]: any = await connection.query(`
      SELECT p.name, p.product_id, COUNT(v.id) as visit_count 
      FROM products p
      LEFT JOIN visits v ON p.id = v.product_id
      GROUP BY p.id
      ORDER BY visit_count DESC
    `);

    // Get recent visits
    const [recentVisitsResult]: any = await connection.query(`
      SELECT v.*, p.name as product_name 
      FROM visits v
      JOIN products p ON v.product_id = p.id
      ORDER BY v.visit_date DESC
      LIMIT 10
    `);

    return {
      totalProducts: totalProductsResult[0].total,
      totalVisits: totalVisitsResult[0].total,
      productVisits: productVisitsResult,
      recentVisits: recentVisitsResult,
    };
  } finally {
    connection.release();
  }
}
