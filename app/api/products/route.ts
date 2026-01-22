import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { generateProductId, processImage } from "@/lib/server-utils";
import type { Express } from "express";
import {
  getProductStats,
  getProductBySlug,
  createProduct,
} from "@/lib/models/product";
import type { ProductTheme } from "@/lib/models/product-theme";
import type { Ingredient } from "@/lib/models/ingredient";
import type { WhyChoose } from "@/lib/models/why-choose";

// Define RouteParams here as well
interface RouteParams {
  params: {
    id: string;
  };
}

interface ProductRow {
  product_id: string;
  name: string;
  slug: string;
  paragraph: string;
  bullet_points: string | string[];
  redirect_link: string;
  generated_link: string;
  money_back_days: number;
  product_image: string;
  product_badge: string;
  created_at: Date;
  updated_at: Date;
  ingredients: string | any[];
  why_choose: string | any[];
  [key: string]: any; // For theme properties
}

export async function GET(req: NextRequest) {
  let connection;
  try {
    // Ensure tables exist before any database operation
    console.log("Starting GET /api/products - Ensuring tables exist...");
    await ensureTablesExist();
    console.log("Tables check completed");

    console.log("Attempting database connection...");
    connection = await db.getConnection();
    console.log("Database connection established successfully");

    const { searchParams } = new URL(req.url);
    console.log(
      "Request URL params:",
      Object.fromEntries(searchParams.entries()),
    );

    // Handle stats query
    if (searchParams.get("stats") === "true") {
      console.log("Fetching product stats...");
      try {
        const stats = await getProductStats();
        console.log("Product stats fetched successfully:", stats);
        return NextResponse.json(stats);
      } catch (error: any) {
        console.error("Error fetching product stats:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage,
        });
        return NextResponse.json(
          { error: "Failed to fetch product stats", details: error.message },
          { status: 500 },
        );
      }
    }

    // Otherwise, return all products
    try {
      // First, let's check if the tables exist using PostgreSQL syntax
      const tablesResult = await connection.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log(
        "Available tables:",
        tablesResult.rows.map((row) => row.table_name),
      );

      // Modified query to use PostgreSQL syntax
      const result = await connection.query(`
        SELECT 
          p.product_id,
          p.name,
          p.slug,
          p.paragraph,
          p.bullet_points,
          p.redirect_link,
          p.generated_link,
          p.money_back_days,
          p.product_image,
          p.product_badge,
          p.created_at,
          p.updated_at,
          STRING_AGG(
            DISTINCT CONCAT(i.id, ':', i.title, ':', i.description, ':', COALESCE(i.image, ''), ':', i.display_order),
            ','
          ) as ingredients,
          STRING_AGG(
            DISTINCT CONCAT(w.id, ':', w.title, ':', w.description, ':', w.display_order),
            ','
          ) as why_choose,
          MAX(t.primary_bg_color) as primary_bg_color,
          MAX(t.secondary_bg_color) as secondary_bg_color,
          MAX(t.accent_bg_color) as accent_bg_color,
          MAX(t.primary_text_color) as primary_text_color,
          MAX(t.secondary_text_color) as secondary_text_color,
          MAX(t.accent_text_color) as accent_text_color,
          MAX(t.link_color) as link_color,
          MAX(t.link_hover_color) as link_hover_color,
          MAX(t.primary_button_bg) as primary_button_bg,
          MAX(t.primary_button_text) as primary_button_text,
          MAX(t.primary_button_hover_bg) as primary_button_hover_bg,
          MAX(t.secondary_button_bg) as secondary_button_bg,
          MAX(t.secondary_button_text) as secondary_button_text,
          MAX(t.secondary_button_hover_bg) as secondary_button_hover_bg,
          MAX(t.card_bg_color) as card_bg_color,
          MAX(t.card_border_color) as card_border_color,
          MAX(t.card_shadow_color) as card_shadow_color,
          MAX(t.header_bg_color) as header_bg_color,
          MAX(t.header_text_color) as header_text_color,
          MAX(t.footer_bg_color) as footer_bg_color,
          MAX(t.footer_text_color) as footer_text_color,
          MAX(t.font_family) as font_family,
          MAX(t.h1_font_size) as h1_font_size,
          MAX(t.h1_font_weight) as h1_font_weight,
          MAX(t.h2_font_size) as h2_font_size,
          MAX(t.h2_font_weight) as h2_font_weight,
          MAX(t.h3_font_size) as h3_font_size,
          MAX(t.h3_font_weight) as h3_font_weight,
          MAX(t.body_font_size) as body_font_size,
          MAX(t.body_line_height) as body_line_height,
          MAX(t.section_padding) as section_padding,
          MAX(t.card_padding) as card_padding,
          MAX(t.button_padding) as button_padding,
          MAX(t.border_radius_sm) as border_radius_sm,
          MAX(t.border_radius_md) as border_radius_md,
          MAX(t.border_radius_lg) as border_radius_lg,
          MAX(t.border_radius_xl) as border_radius_xl,
          MAX(t.max_width) as max_width,
          MAX(t.container_padding) as container_padding,
          MAX(t.gradient_start) as gradient_start,
          MAX(t.gradient_end) as gradient_end,
          MAX(t.shadow_color) as shadow_color,
          MAX(t.custom_css) as custom_css
        FROM products p
        LEFT JOIN ingredients i ON p.product_id = i.product_id
        LEFT JOIN why_choose w ON p.product_id = w.product_id
        LEFT JOIN product_themes t ON p.product_id = t.product_id
        GROUP BY 
          p.product_id,
          p.name,
          p.slug,
          p.paragraph,
          p.bullet_points,
          p.redirect_link,
          p.generated_link,
          p.money_back_days,
          p.product_image,
          p.product_badge,
          p.created_at,
          p.updated_at
        ORDER BY p.created_at DESC
      `);

      console.log(
        "Query executed successfully, rows returned:",
        result.rows.length,
      );

      if (result.rows.length === 0) {
        console.log("No products found in the database");
        return NextResponse.json([]);
      }

      // Process the results
      const products = result.rows.map((row: ProductRow) => {
        const product: any = { ...row };

        // Parse bullet_points if it's a JSON string (for backward compatibility)
        if (
          product.bullet_points &&
          typeof product.bullet_points === "string"
        ) {
          try {
            product.bullet_points = JSON.parse(product.bullet_points);
          } catch (e) {
            console.error("Failed to parse bullet_points JSON:", e);
            product.bullet_points = [];
          }
        }

        // Parse ingredients
        if (product.ingredients && typeof product.ingredients === "string") {
          const ingredientsArray = product.ingredients
            .split(",")
            .filter((item: string) => item.trim())
            .map((item: string) => {
              const parts = item.split(":");
              if (parts.length >= 5) {
                return {
                  id: parts[0],
                  title: parts[1],
                  description: parts[2],
                  image: parts[3] || null,
                  display_order: parseInt(parts[4]) || 0,
                };
              }
              return null;
            })
            .filter(
              (item: any): item is NonNullable<typeof item> => item !== null,
            );
          product.ingredients = ingredientsArray;
        } else {
          product.ingredients = [];
        }

        // Parse why_choose
        if (product.why_choose && typeof product.why_choose === "string") {
          const whyChooseArray = product.why_choose
            .split(",")
            .filter((item: string) => item.trim())
            .map((item: string) => {
              const parts = item.split(":");
              if (parts.length >= 4) {
                return {
                  id: parts[0],
                  title: parts[1],
                  description: parts[2],
                  display_order: parseInt(parts[3]) || 0,
                };
              }
              return null;
            })
            .filter(
              (item: any): item is NonNullable<typeof item> => item !== null,
            );
          product.why_choose = whyChooseArray;
        } else {
          product.why_choose = [];
        }

        // Handle theme data
        const hasThemeData = product.primary_bg_color !== null;
        if (hasThemeData) {
          product.theme = {
            product_id: product.product_id,
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
          };

          // Remove theme properties from the main product object
          [
            "primary_bg_color",
            "secondary_bg_color",
            "accent_bg_color",
            "primary_text_color",
            "secondary_text_color",
            "accent_text_color",
            "link_color",
            "link_hover_color",
            "primary_button_bg",
            "primary_button_text",
            "primary_button_hover_bg",
            "secondary_button_bg",
            "secondary_button_text",
            "secondary_button_hover_bg",
            "card_bg_color",
            "card_border_color",
            "card_shadow_color",
            "header_bg_color",
            "header_text_color",
            "footer_bg_color",
            "footer_text_color",
            "font_family",
            "h1_font_size",
            "h1_font_weight",
            "h2_font_size",
            "h2_font_weight",
            "h3_font_size",
            "h3_font_weight",
            "body_font_size",
            "body_line_height",
            "section_padding",
            "card_padding",
            "button_padding",
            "border_radius_sm",
            "border_radius_md",
            "border_radius_lg",
            "border_radius_xl",
            "max_width",
            "container_padding",
            "gradient_start",
            "gradient_end",
            "shadow_color",
            "custom_css",
          ].forEach((key) => delete product[key]);
        }

        return product;
      });

      console.log("Products processed successfully:", products.length);
      return NextResponse.json(products);
    } catch (error: any) {
      console.error("Error executing products query:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
      });

      return NextResponse.json(
        { error: "Failed to fetch products", details: error.message },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Function to ensure all necessary tables exist - Updated for PostgreSQL
async function ensureTablesExist() {
  let connection;
  try {
    connection = await db.getConnection();
    console.log("Checking/creating database tables...");

    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        paragraph TEXT,
        bullet_points JSONB,
        redirect_link VARCHAR(255),
        generated_link VARCHAR(255),
        product_image VARCHAR(255),
        product_badge VARCHAR(255),
        money_back_days INTEGER DEFAULT 60,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create trigger for updated_at
    await connection.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await connection.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create visits table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) REFERENCES products(product_id) ON DELETE CASCADE,
        ip_address VARCHAR(45),
        user_agent VARCHAR(255),
        referrer VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create product_themes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_themes (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL UNIQUE,
        primary_bg_color VARCHAR(7),
        secondary_bg_color VARCHAR(7),
        accent_bg_color VARCHAR(7),
        primary_text_color VARCHAR(7),
        secondary_text_color VARCHAR(7),
        accent_text_color VARCHAR(7),
        link_color VARCHAR(7),
        link_hover_color VARCHAR(7),
        primary_button_bg VARCHAR(7),
        primary_button_text VARCHAR(7),
        primary_button_hover_bg VARCHAR(7),
        secondary_button_bg VARCHAR(7),
        secondary_button_text VARCHAR(7),
        secondary_button_hover_bg VARCHAR(7),
        card_bg_color VARCHAR(7),
        card_border_color VARCHAR(7),
        card_shadow_color VARCHAR(20),
        header_bg_color VARCHAR(7),
        header_text_color VARCHAR(7),
        footer_bg_color VARCHAR(7),
        footer_text_color VARCHAR(7),
        font_family VARCHAR(50),
        h1_font_size VARCHAR(10),
        h1_font_weight VARCHAR(10),
        h2_font_size VARCHAR(10),
        h2_font_weight VARCHAR(10),
        h3_font_size VARCHAR(10),
        h3_font_weight VARCHAR(10),
        body_font_size VARCHAR(10),
        body_line_height VARCHAR(10),
        section_padding VARCHAR(20),
        card_padding VARCHAR(20),
        button_padding VARCHAR(20),
        border_radius_sm VARCHAR(10),
        border_radius_md VARCHAR(10),
        border_radius_lg VARCHAR(10),
        border_radius_xl VARCHAR(10),
        max_width VARCHAR(20),
        container_padding VARCHAR(20),
        gradient_start VARCHAR(7),
        gradient_end VARCHAR(7),
        shadow_color VARCHAR(20),
        custom_css TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      );
    `);

    console.log("All tables ensured to exist");
  } catch (error) {
    console.error("Error ensuring tables exist:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        (connection as any).release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Attempting to create new product...");
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    console.log("Request method:", req.method);
    console.log("Content-Type:", req.headers.get("content-type"));

    const normalizePath = (value: string | null | undefined) => {
      if (!value) return null;
      const trimmed = `${value}`.replace(/^\/+/, "");
      return `/${trimmed}`;
    };

    // Check if this is FormData (multipart/form-data) or JSON
    const contentType = req.headers.get("content-type") || "";
    console.log("Detected content type:", contentType);

    let body: any = {};

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData for file uploads
      console.log("Processing FormData request...");
      const formData = await req.formData();

      // Convert FormData to a regular object
      for (const [key, value] of formData.entries()) {
        if (
          key.startsWith("ingredient_image_") ||
          key.startsWith("review_avatar_") ||
          key === "image" ||
          key === "badge_image"
        ) {
          // Handle file fields
          body[key] = value;
        } else if (
          key === "bullet_points" ||
          key === "ingredients" ||
          key === "why_choose" ||
          key === "reviews"
        ) {
          // Parse JSON strings
          try {
            body[key] = JSON.parse(value as string);
          } catch {
            body[key] = value;
          }
        } else {
          body[key] = value;
        }
      }
      console.log("Processed FormData keys:", Object.keys(body));
    } else {
      // Handle JSON requests
      console.log("Processing JSON request...");
      try {
        body = await req.json();
      } catch (jsonError: any) {
        console.error("JSON parsing error:", jsonError.message);
        return NextResponse.json(
          { error: "Invalid JSON in request body", details: jsonError.message },
          { status: 400 },
        );
      }
    }

    console.log("Received product data:", {
      ...body,
      // Don't log file objects, just their presence
      image:
        body.image && typeof body.image === "object" && body.image.name
          ? `[File: ${body.image.name}]`
          : body.image,
      badge_image:
        body.badge_image &&
        typeof body.badge_image === "object" &&
        body.badge_image.name
          ? `[File: ${body.badge_image.name}]`
          : body.badge_image,
    });

    // Validate required fields
    if (!body.name || !body.paragraph || !body.redirect_link) {
      return NextResponse.json(
        { error: "Missing required fields: name, paragraph, redirect_link" },
        { status: 400 },
      );
    }

    // Generate product ID for image processing (consistent with createProduct)
    const productId = generateProductId();
    console.log("Generated product_id for image processing:", productId);

    // Process uploaded images and store file paths
    let productImagePath: string | null = null;
    let badgeImagePath: string | null = null;

    // Process main product image
    if (
      body.image &&
      typeof body.image === "object" &&
      body.image.arrayBuffer
    ) {
      console.log("Processing product image...");
      const buffer = Buffer.from(await body.image.arrayBuffer());
      const file = {
        buffer,
        originalname: body.image.name,
        mimetype: body.image.type,
      } as Express.Multer.File;
      productImagePath = await processImage(
        file,
        "public/images/products",
        `${productId}`,
      );
      console.log("Product image saved to:", productImagePath);
    } else if (typeof body.image === "string" && body.image.trim()) {
      productImagePath = normalizePath(body.image.trim());
    }

    // Process badge image
    if (
      body.badge_image &&
      typeof body.badge_image === "object" &&
      body.badge_image.arrayBuffer
    ) {
      console.log("Processing badge image...");
      const buffer = Buffer.from(await body.badge_image.arrayBuffer());
      const file = {
        buffer,
        originalname: body.badge_image.name,
        mimetype: body.badge_image.type,
      } as Express.Multer.File;
      badgeImagePath = await processImage(
        file,
        "public/images/badges",
        `badge_${productId}`,
      );
      console.log("Badge image saved to:", badgeImagePath);
    } else if (
      typeof body.badge_image === "string" &&
      body.badge_image.trim()
    ) {
      badgeImagePath = normalizePath(body.badge_image.trim());
    }

    // Process ingredient images
    const processedIngredients = [];
    if (body.ingredients && Array.isArray(body.ingredients)) {
      for (const [index, ingredient] of body.ingredients.entries()) {
        let ingredientImagePath: string | null = null;

        if (ingredient.image && typeof ingredient.image === "string") {
          ingredientImagePath = normalizePath(ingredient.image);
        }

        // Check for ingredient image file
        const ingredientImageKey = `ingredient_image_${index}`;
        if (
          body[ingredientImageKey] &&
          typeof body[ingredientImageKey] === "object" &&
          body[ingredientImageKey].arrayBuffer
        ) {
          console.log(`Processing ingredient ${index} image...`);
          const buffer = Buffer.from(
            await body[ingredientImageKey].arrayBuffer(),
          );
          const file = {
            buffer,
            originalname: body[ingredientImageKey].name,
            mimetype: body[ingredientImageKey].type,
          } as Express.Multer.File;
          ingredientImagePath = await processImage(
            file,
            "public/images/ingredients",
            `${productId}_ingredient_${index}`,
          );
          console.log(
            `Ingredient ${index} image saved to:`,
            ingredientImagePath,
          );
        }

        processedIngredients.push({
          ...ingredient,
          image: ingredientImagePath,
        });
      }
    }

    // Process review avatar images
    const processedReviews = [];
    if (body.reviews && Array.isArray(body.reviews)) {
      for (const [index, review] of body.reviews.entries()) {
        let avatarPath: string | null = null;

        if (review.avatar && typeof review.avatar === "string") {
          avatarPath = normalizePath(review.avatar);
        }

        // Check for review avatar file
        const avatarKey = `review_avatar_${index}`;
        if (
          body[avatarKey] &&
          typeof body[avatarKey] === "object" &&
          body[avatarKey].arrayBuffer
        ) {
          console.log(`Processing review ${index} avatar...`);
          const buffer = Buffer.from(await body[avatarKey].arrayBuffer());
          const file = {
            buffer,
            originalname: body[avatarKey].name,
            mimetype: body[avatarKey].type,
          } as Express.Multer.File;
          avatarPath = await processImage(
            file,
            "public/images/avatars",
            `avatar_${productId}_${index}`,
          );
          console.log(`Review ${index} avatar saved to:`, avatarPath);
        }

        processedReviews.push({
          ...review,
          avatar: avatarPath,
        });
      }
    }

    // Create product data with processed image paths
    const productData = {
      ...body,
      product_id: productId, // Use the same ID we used for image processing
      product_image: productImagePath ?? null,
      product_badge: badgeImagePath ?? null,
      ingredients: processedIngredients,
      reviews: processedReviews,
      // Remove file objects and temp keys
      image: undefined,
      badge_image: undefined,
    };

    // Remove all temporary file keys
    Object.keys(productData).forEach((key) => {
      if (
        key.startsWith("ingredient_image_") ||
        key.startsWith("review_avatar_") ||
        key === "image_existing" ||
        key === "badge_image_existing"
      ) {
        delete productData[key];
      }
    });

    console.log("Creating product with processed data:", {
      ...productData,
      ingredients: productData.ingredients?.length + " ingredients",
      reviews: productData.reviews?.length + " reviews",
    });

    const product = await createProduct(productData);
    console.log("Product created successfully:", product);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error.message },
      { status: 500 },
    );
  }
}
