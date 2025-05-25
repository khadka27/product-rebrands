import db from "@/lib/db";
import { generateSlug } from "../utils";
import { generateProductId } from "../server-utils";
import type { Ingredient } from "./ingredient";
import type { WhyChoose } from "./why-choose";

export interface ProductTheme {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headingColor: string;
  linkColor: string;
  fontFamily: string;
  borderRadius: string;
  customCss?: string;
}

export const defaultTheme: ProductTheme = {
  primaryColor: "#ffffff",
  secondaryColor: "#f8fafc",
  textColor: "#1a202c",
  accentColor: "#3182ce",
  buttonColor: "#3182ce",
  buttonTextColor: "#ffffff",
  headingColor: "#1a202c",
  linkColor: "#3182ce",
  fontFamily: "Inter, sans-serif",
  borderRadius: "0.5rem",
};

export interface Product {
  id?: number;
  product_id: string;
  name: string;
  slug: string;
  description: string;
  redirect_link: string;
  generated_link?: string;
  product_image: string;
  product_badge: string;
  money_back_days: number;
  created_at?: Date;
  updated_at?: Date;
  ingredients?: Ingredient[];
  why_choose?: WhyChoose[];
  theme?: ProductTheme;
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

export async function createProduct(
  product: Omit<
    Product,
    "id" | "product_id" | "slug" | "created_at" | "updated_at"
  >
): Promise<Product> {
  return withConnection(async (connection) => {
    const productId = generateProductId();
    console.log("Generated product_id for new product:", productId);

    const slug = generateSlug(product.name);
    console.log("Generated slug for new product:", slug);

    console.log("Inserting new product into database:", {
      name: product.name,
      slug,
      productId,
    });

    const [result]: any = await connection.query(
      `INSERT INTO products 
       (product_id, name, slug, description, redirect_link, generated_link, product_image, product_badge, money_back_days) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        product.name,
        slug,
        product.description,
        product.redirect_link,
        product.generated_link,
        product.product_image,
        product.product_badge,
        product.money_back_days,
      ]
    );

    return {
      id: result.insertId,
      product_id: productId,
      slug,
      ...product,
    };
  });
}

export async function getProductBySlug(slug: string) {
  return withConnection(async (connection) => {
    const [rows]: any = await connection.query(
      "SELECT * FROM products WHERE slug = ?",
      [slug]
    );
    return rows.length === 0 ? null : rows[0];
  });
}

export async function getProductById(id: string | number) {
  const connection = await db.getConnection();
  try {
    const [rows]: any = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0];
  } finally {
    connection.release();
  }
}

export async function getProductByProductId(
  productId: string
): Promise<Product | null> {
  return withConnection(async (connection) => {
    console.log("Attempting to fetch product with product_id:", productId);
    const [rows]: any = await connection.query(
      "SELECT * FROM products WHERE product_id = ?",
      [productId]
    );

    if (rows.length === 0) {
      console.log("No product found with product_id:", productId);
      return null;
    }

    console.log("Found product by product_id:", rows[0]);
    return rows[0] as Product;
  });
}

export async function getAllProducts() {
  return withConnection(async (connection) => {
    const [rows]: any = await connection.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return rows;
  });
}

export async function updateProduct(
  id: number,
  product: Partial<Product>
): Promise<boolean> {
  return withConnection(async (connection) => {
    if (product.name) {
      product.slug = generateSlug(product.name);
    }

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

    values.push(id);

    const [result]: any = await connection.query(
      `UPDATE products SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  });
}

export async function deleteProduct(id: number): Promise<boolean> {
  return withConnection(async (connection) => {
    const [result]: any = await connection.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  });
}

async function getProductTheme(
  productId: number
): Promise<ProductTheme | null> {
  const connection = await db.getConnection();

  try {
    const [rows]: any = await connection.query(
      "SELECT * FROM product_themes WHERE product_id = ?",
      [productId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as ProductTheme;
  } finally {
    connection.release();
  }
}

async function fixNullProductIds() {
  return withConnection(async (connection) => {
    const [rows]: any = await connection.query(
      "SELECT * FROM products WHERE product_id IS NULL"
    );

    console.log("Found products with null product_id:", rows.length);

    for (const product of rows) {
      const productId = generateProductId();
      await connection.query(
        "UPDATE products SET product_id = ? WHERE id = ?",
        [productId, product.id]
      );
      console.log(
        `Updated product ${product.name} with product_id: ${productId}`
      );
    }
  });
}

export async function getProductWithDetails(slug: string) {
  return withConnection(async (connection) => {
    try {
      console.log("Fetching product details for slug:", slug);

      await fixNullProductIds();

      const [productRows] = await connection.query(
        `SELECT p.*, t.* 
         FROM products p 
         LEFT JOIN product_themes t ON p.product_id = t.product_id 
         WHERE p.slug = ?`,
        [slug]
      );

      if (!productRows || productRows.length === 0) {
        console.log("No product found with slug:", slug);
        return null;
      }

      const product = productRows[0];
      console.log("Product found by slug:", {
        product_id: product.product_id,
        slug: product.slug,
        name: product.name,
      });

      if (!product.product_id) {
        const productId = generateProductId();
        await connection.query(
          "UPDATE products SET product_id = ? WHERE slug = ?",
          [productId, slug]
        );
        product.product_id = productId;
        console.log(
          `Generated new product_id ${productId} for product ${product.name}`
        );
      }

      const [ingredientRows] = await connection.query(
        `SELECT id, product_id, title, description, image, display_order 
         FROM ingredients 
         WHERE product_id = ? 
         ORDER BY display_order ASC`,
        [product.product_id]
      );

      const [whyChooseRows] = await connection.query(
        `SELECT id, product_id, title, description, display_order 
         FROM why_choose 
         WHERE product_id = ? 
         ORDER BY display_order ASC`,
        [product.product_id]
      );

      return {
        ...product,
        theme: product.primary_bg_color
          ? {
              primary_bg_color: product.primary_bg_color,
              secondary_bg_color: product.secondary_bg_color,
              accent_bg_color: product.accent_bg_color,
              primary_text_color: product.primary_text_color,
              secondary_text_color: product.secondary_text_color,
              accent_text_color: product.accent_text_color,
              link_color: product.link_color,
              link_hover_color: product.link_hover_color,
              primary_button_bg: product.primary_button_bg,
              primary_button_text: product.primary_button_text,
              primary_button_hover_bg: product.primary_button_hover_bg,
              secondary_button_bg: product.secondary_button_bg,
              secondary_button_text: product.secondary_button_text,
              secondary_button_hover_bg: product.secondary_button_hover_bg,
              card_bg_color: product.card_bg_color,
              card_border_color: product.card_border_color,
              card_shadow_color: product.card_shadow_color,
              header_bg_color: product.header_bg_color,
              header_text_color: product.header_text_color,
              footer_bg_color: product.footer_bg_color,
              footer_text_color: product.footer_text_color,
              font_family: product.font_family,
              h1_font_size: product.h1_font_size,
              h1_font_weight: product.h1_font_weight,
              h2_font_size: product.h2_font_size,
              h2_font_weight: product.h2_font_weight,
              h3_font_size: product.h3_font_size,
              h3_font_weight: product.h3_font_weight,
              body_font_size: product.body_font_size,
              body_line_height: product.body_line_height,
              section_padding: product.section_padding,
              card_padding: product.card_padding,
              button_padding: product.button_padding,
              border_radius_sm: product.border_radius_sm,
              border_radius_md: product.border_radius_md,
              border_radius_lg: product.border_radius_lg,
              border_radius_xl: product.border_radius_xl,
              max_width: product.max_width,
              container_padding: product.container_padding,
              gradient_start: product.gradient_start,
              gradient_end: product.gradient_end,
              shadow_color: product.shadow_color,
              custom_css: product.custom_css,
            }
          : null,
        ingredients: ingredientRows || [],
        why_choose: whyChooseRows || [],
      };
    } catch (error) {
      console.error("Error in getProductWithDetails:", error);
      throw error;
    }
  });
}

export async function recordVisit(
  productId: number,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
): Promise<void> {
  return withConnection(async (connection) => {
    await connection.query(
      "INSERT INTO visits (product_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)",
      [productId, ipAddress, userAgent, referrer]
    );
  });
}

export async function getProductStats(): Promise<any> {
  return withConnection(async (connection) => {
    const [totalProductsResult]: any = await connection.query(
      "SELECT COUNT(*) as total FROM products"
    );

    const [totalVisitsResult]: any = await connection.query(
      "SELECT COUNT(*) as total FROM visits"
    );

    const [productVisitsResult]: any = await connection.query(`
      SELECT p.name, p.product_id, COUNT(v.id) as visit_count 
      FROM products p
      LEFT JOIN visits v ON p.product_id = v.product_id
      GROUP BY p.product_id, p.name
      ORDER BY visit_count DESC
    `);

    const [recentVisitsResult]: any = await connection.query(`
      SELECT v.*, p.name as product_name, p.product_id
      FROM visits v
      JOIN products p ON v.product_id = p.product_id
      ORDER BY v.visit_date DESC
      LIMIT 10
    `);

    return {
      totalProducts: totalProductsResult[0].total,
      totalVisits: totalVisitsResult[0].total,
      productVisits: productVisitsResult,
      recentVisits: recentVisitsResult,
    };
  });
}
