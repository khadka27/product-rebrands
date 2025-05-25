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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Handle stats query
    if (searchParams.get("stats") === "true") {
      try {
        const stats = await getProductStats();
        return NextResponse.json(stats);
      } catch (err) {
        console.error("Error fetching product stats:", err);
        return NextResponse.json(
          { error: "Failed to fetch product stats" },
          { status: 500 }
        );
      }
    }

    // Otherwise, return all products
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.query(`
        SELECT p.*,
          GROUP_CONCAT(DISTINCT i.id, ':', i.title, ':', i.description, ':', i.image, ':', i.display_order) as ingredients,
          GROUP_CONCAT(DISTINCT w.id, ':', w.title, ':', w.description, ':', w.display_order) as why_choose,
          t.*
        FROM products p
        LEFT JOIN ingredients i ON p.product_id = i.product_id
        LEFT JOIN why_choose w ON p.product_id = w.product_id
        LEFT JOIN product_themes t ON p.product_id = t.product_id
        GROUP BY p.product_id
        ORDER BY p.created_at DESC
      `);

      // Manually parse the concatenated data for now
      const products = (rows as any[]).map((row) => {
        const product: any = { ...row };

        if (row.ingredients) {
          product.ingredients = row.ingredients
            .split(",")
            .map((item: string) => {
              const [id, title, description, image, display_order] =
                item.split(":");
              return {
                id,
                title,
                description,
                image,
                display_order: parseInt(display_order),
              };
            });
        }

        if (row.why_choose) {
          product.why_choose = row.why_choose.split(",").map((item: string) => {
            const [id, title, description, display_order] = item.split(":");
            return {
              id,
              title,
              description,
              display_order: parseInt(display_order),
            };
          });
        }

        // Extract theme data if available
        const theme: Partial<ProductTheme> = {};
        // List all theme keys from the ProductTheme interface
        const themeKeys: (keyof ProductTheme)[] = [
          "theme_id",
          "product_id",
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
        ]; // Add all keys

        let hasTheme = false;
        for (const key of themeKeys) {
          if (row[key] !== null && row[key] !== undefined) {
            (theme as any)[key] = row[key];
            hasTheme = true;
          }
        }

        if (hasTheme) {
          product.theme = theme;
        } else {
          product.theme = undefined; // Ensure theme is undefined if no theme data
        }

        return product;
      });

      return NextResponse.json(products);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error in /api/products GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // We are no longer using a direct DB connection here,
  // createProduct handles the connection and transaction.

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const redirect_link = formData.get("redirect_link") as string;
    const money_back_days = Number.parseInt(
      formData.get("money_back_days") as string
    );
    const imageFile = formData.get("image") as File;
    const badgeImageFile = formData.get("badge_image") as File;
    const themeData = formData.get("theme") as string;
    const ingredientsData = formData.get("ingredients") as string;
    const whyChooseData = formData.get("why_choose") as string;

    // Generate slug and check for duplicates
    const slug = generateSlug(name);
    const existingProduct = await getProductBySlug(slug);
    if (existingProduct) {
      return NextResponse.json(
        { error: `Product with slug '${slug}' already exists.` },
        { status: 409 } // Conflict
      );
    }

    // Process and prepare data for createProduct
    let imagePath = "";
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const file = {
        buffer,
        originalname: imageFile.name,
        mimetype: imageFile.type,
      } as Express.Multer.File;
      imagePath = await processImage(file, "public/images/products", slug);
    }

    let badgeImagePath = "";
    if (badgeImageFile) {
      const buffer = Buffer.from(await badgeImageFile.arrayBuffer());
      const file = {
        buffer,
        originalname: badgeImageFile.name,
        mimetype: badgeImageFile.type,
      } as Express.Multer.File;
      badgeImagePath = await processImage(
        file,
        "public/images/badges",
        `badge_${slug}`
      );
    }

    const ingredients: Ingredient[] = ingredientsData
      ? JSON.parse(ingredientsData)
      : [];
    const why_choose: WhyChoose[] = whyChooseData
      ? JSON.parse(whyChooseData)
      : [];
    const theme: ProductTheme | undefined = themeData
      ? JSON.parse(themeData)
      : undefined;

    // Process ingredient images and add to ingredients array
    for (let i = 0; i < ingredients.length; i++) {
      const ingredientImageFile = formData.get(`ingredient_image_${i}`) as File;
      if (ingredientImageFile) {
        const buffer = Buffer.from(await ingredientImageFile.arrayBuffer());
        const file = {
          buffer,
          originalname: ingredientImageFile.name,
          mimetype: ingredientImageFile.type,
        } as Express.Multer.File;
        const ingredientImagePath = await processImage(
          file,
          "public/images/ingredients",
          `${slug}_ingredient_${i}`
        );
        ingredients[i].image = ingredientImagePath; // Assuming 'image' field exists on Ingredient
      }
    }

    // Construct the product object for createProduct
    const productData = {
      name,
      description,
      redirect_link,
      generated_link: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/preview/${slug}`,
      product_image: imagePath,
      product_badge: badgeImagePath,
      money_back_days,
      ingredients,
      why_choose,
      theme,
    };

    // Use the refactored createProduct function
    const newProduct = await createProduct(productData as any); // Cast to any temporarily if types are strict

    return NextResponse.json(newProduct, { status: 201 }); // Created
  } catch (error) {
    console.error("Error creating product:", error);
    // Handle specific errors if needed, e.g., database errors
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
