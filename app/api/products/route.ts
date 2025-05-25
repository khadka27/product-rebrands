import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { generateProductId, processImage } from "@/lib/server-utils";
import type { Express } from "express";
import { getProductStats } from "@/lib/models/product";

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
      const [rows] = await connection.query<any[]>(`
        SELECT p.*, 
          GROUP_CONCAT(DISTINCT i.id, ':', i.title, ':', i.description, ':', i.image, ':', i.display_order) as ingredients,
          GROUP_CONCAT(DISTINCT w.id, ':', w.title, ':', w.description, ':', w.display_order) as why_choose,
          t.*
        FROM products p
        LEFT JOIN ingredients i ON p.id = i.product_id
        LEFT JOIN why_choose w ON p.id = w.product_id
        LEFT JOIN product_themes t ON p.id = t.product_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);

      return NextResponse.json(rows);
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
  try {
    const connection = await db.getConnection();
    try {
      // Parse form data
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

      // Generate slug and product ID
      const slug = generateSlug(name);
      const generatedProductId = generateProductId();

      // Generate the product link
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const cleanSiteUrl = siteUrl.replace(/\/$/, "");
      const generatedLink = `${cleanSiteUrl}/preview/${slug}`;

      // Process product image if provided
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

      // Process badge image if provided
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

      // Create product
      const [result] = await connection.query(
        `INSERT INTO products (product_id, name, slug, description, redirect_link, generated_link, product_image, product_badge, money_back_days)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedProductId,
          name,
          slug,
          description,
          redirect_link,
          generatedLink,
          imagePath,
          badgeImagePath,
          money_back_days,
        ]
      );

      const insertedId = (result as any).insertId;

      // Process theme if provided
      if (themeData) {
        try {
          const theme = JSON.parse(themeData);
          await connection.query(
            `INSERT INTO product_themes (product_id, ${Object.keys(theme).join(
              ", "
            )})
             VALUES (?, ${Object.keys(theme)
               .map(() => "?")
               .join(", ")})`,
            [insertedId, ...Object.values(theme)]
          );
        } catch (e) {
          console.error("Error processing theme:", e);
        }
      }

      // Process ingredients if provided
      if (ingredientsData) {
        try {
          const ingredients = JSON.parse(ingredientsData);
          for (let i = 0; i < ingredients.length; i++) {
            const ingredient = ingredients[i];
            const ingredientImageFile = formData.get(
              `ingredient_image_${i}`
            ) as File;

            let ingredientImagePath = "";
            if (ingredientImageFile) {
              const buffer = Buffer.from(
                await ingredientImageFile.arrayBuffer()
              );
              const file = {
                buffer,
                originalname: ingredientImageFile.name,
                mimetype: ingredientImageFile.type,
              } as Express.Multer.File;

              ingredientImagePath = await processImage(
                file,
                "public/images/ingredients",
                `${slug}_ingredient_${i}`
              );
            }

            await connection.query(
              `INSERT INTO ingredients (product_id, title, description, image, display_order)
               VALUES (?, ?, ?, ?, ?)`,
              [
                insertedId,
                ingredient.title,
                ingredient.description,
                ingredientImagePath,
                ingredient.display_order,
              ]
            );
          }
        } catch (e) {
          console.error("Error processing ingredients:", e);
        }
      }

      // Process why choose points if provided
      if (whyChooseData) {
        try {
          const whyChoosePoints = JSON.parse(whyChooseData);
          for (const point of whyChoosePoints) {
            await connection.query(
              `INSERT INTO why_choose (product_id, title, description, display_order)
               VALUES (?, ?, ?, ?)`,
              [insertedId, point.title, point.description, point.display_order]
            );
          }
        } catch (e) {
          console.error("Error processing why choose points:", e);
        }
      }

      // Get the created product
      const [rows] = await connection.query<any[]>(
        `SELECT p.*, 
          GROUP_CONCAT(DISTINCT i.id, ':', i.title, ':', i.description, ':', i.image, ':', i.display_order) as ingredients,
          GROUP_CONCAT(DISTINCT w.id, ':', w.title, ':', w.description, ':', w.display_order) as why_choose,
          t.*
        FROM products p
        LEFT JOIN ingredients i ON p.id = i.product_id
        LEFT JOIN why_choose w ON p.id = w.product_id
        LEFT JOIN product_themes t ON p.id = t.product_id
        WHERE p.id = ?
        GROUP BY p.id`,
        [insertedId]
      );

      return NextResponse.json(rows[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
