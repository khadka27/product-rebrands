import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { processImage } from "@/lib/server-utils";
import type { Express } from "express";
import process from "process";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await db.getConnection();

    try {
      const [rows]: any = await connection.query(
        `SELECT p.*, 
          GROUP_CONCAT(DISTINCT i.id, ':', i.title, ':', i.description, ':', i.image, ':', i.display_order) as ingredients,
          GROUP_CONCAT(DISTINCT w.id, ':', w.title, ':', w.description, ':', w.display_order) as why_choose,
          t.* as theme
        FROM products p
        LEFT JOIN ingredients i ON p.id = i.product_id
        LEFT JOIN why_choose w ON p.id = w.product_id
        LEFT JOIN product_themes t ON p.id = t.product_id
        WHERE p.id = ?
        GROUP BY p.id`,
        [params.id]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const product = rows[0];

      // Parse ingredients
      if (product.ingredients) {
        product.ingredients = product.ingredients
          .split(",")
          .map((ing: string) => {
            const [id, title, description, image, display_order] =
              ing.split(":");
            return {
              id,
              title,
              description,
              image,
              display_order: parseInt(display_order),
            };
          });
      } else {
        product.ingredients = [];
      }

      // Parse why choose points
      if (product.why_choose) {
        product.why_choose = product.why_choose.split(",").map((wc: string) => {
          const [id, title, description, display_order] = wc.split(":");
          return {
            id,
            title,
            description,
            display_order: parseInt(display_order),
          };
        });
      } else {
        product.why_choose = [];
      }

      return NextResponse.json(product);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      const imageFile = formData.get("image") as File | null;
      const badgeImageFile = formData.get("badge_image") as File | null;
      const themeData = formData.get("theme") as string;
      const ingredientsData = formData.get("ingredients") as string;
      const whyChooseData = formData.get("why_choose") as string;

      // Get existing product
      const [existingRows]: any = await connection.query(
        "SELECT * FROM products WHERE id = ?",
        [params.id]
      );

      if (existingRows.length === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const existingProduct = existingRows[0];

      // Generate slug if name changed
      const slug =
        name !== existingProduct.name
          ? generateSlug(name)
          : existingProduct.slug;

      // Generate new link if name changed
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const cleanSiteUrl = siteUrl.replace(/\/$/, "");
      const generatedLink =
        name !== existingProduct.name
          ? `${cleanSiteUrl}/product/${slug}`
          : existingProduct.generated_link;

      // Process image if provided
      let imagePath = existingProduct.product_image;
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
      let badgeImagePath = existingProduct.product_badge || "";
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

      // Update product
      await connection.query(
        `UPDATE products 
         SET name = ?, description = ?, slug = ?, redirect_link = ?, 
             generated_link = ?, product_image = ?, product_badge = ?, money_back_days = ?
         WHERE id = ?`,
        [
          name,
          description,
          slug,
          redirect_link,
          generatedLink,
          imagePath,
          badgeImagePath,
          money_back_days,
          params.id,
        ]
      );

      // Process theme if provided
      if (themeData) {
        try {
          const theme = JSON.parse(themeData);
          // Get the product_id from the products table
          const [productRows]: any = await connection.query(
            "SELECT product_id FROM products WHERE id = ?",
            [params.id]
          );

          if (productRows.length > 0) {
            const product_id = productRows[0].product_id;
            await connection.query(
              `INSERT INTO product_themes (product_id, ${Object.keys(
                theme
              ).join(", ")})
               VALUES (?, ${Object.keys(theme)
                 .map(() => "?")
                 .join(", ")})
               ON DUPLICATE KEY UPDATE ${Object.keys(theme)
                 .map((key) => `${key} = ?`)
                 .join(", ")}`,
              [product_id, ...Object.values(theme), ...Object.values(theme)]
            );
          }
        } catch (e) {
          console.error("Error processing theme:", e);
        }
      }

      // Process ingredients if provided
      if (ingredientsData) {
        try {
          // Delete existing ingredients
          await connection.query(
            "DELETE FROM ingredients WHERE product_id = ?",
            [params.id]
          );

          const ingredients = JSON.parse(ingredientsData);

          // Create new ingredients
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
            } else if (
              ingredient.image &&
              typeof ingredient.image === "string"
            ) {
              ingredientImagePath = ingredient.image;
            }

            await connection.query(
              `INSERT INTO ingredients (product_id, title, description, image, display_order)
               VALUES (?, ?, ?, ?, ?)`,
              [
                params.id,
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
          // Delete existing why choose points
          await connection.query(
            "DELETE FROM why_choose WHERE product_id = ?",
            [params.id]
          );

          const whyChoosePoints = JSON.parse(whyChooseData);

          // Create new why choose points
          for (const point of whyChoosePoints) {
            await connection.query(
              `INSERT INTO why_choose (product_id, title, description, display_order)
               VALUES (?, ?, ?, ?)`,
              [params.id, point.title, point.description, point.display_order]
            );
          }
        } catch (e) {
          console.error("Error processing why choose points:", e);
        }
      }

      // Get updated product
      const [updatedRows]: any = await connection.query(
        `SELECT p.*, 
          GROUP_CONCAT(DISTINCT i.id, ':', i.title, ':', i.description, ':', i.image, ':', i.display_order) as ingredients,
          GROUP_CONCAT(DISTINCT w.id, ':', w.title, ':', w.description, ':', w.display_order) as why_choose,
          t.* as theme
        FROM products p
        LEFT JOIN ingredients i ON p.id = i.product_id
        LEFT JOIN why_choose w ON p.id = w.product_id
        LEFT JOIN product_themes t ON p.id = t.product_id
        WHERE p.id = ?
        GROUP BY p.id`,
        [params.id]
      );

      const product = updatedRows[0];

      // Parse ingredients
      if (product.ingredients) {
        product.ingredients = product.ingredients
          .split(",")
          .map((ing: string) => {
            const [id, title, description, image, display_order] =
              ing.split(":");
            return {
              id,
              title,
              description,
              image,
              display_order: parseInt(display_order),
            };
          });
      } else {
        product.ingredients = [];
      }

      // Parse why choose points
      if (product.why_choose) {
        product.why_choose = product.why_choose.split(",").map((wc: string) => {
          const [id, title, description, display_order] = wc.split(":");
          return {
            id,
            title,
            description,
            display_order: parseInt(display_order),
          };
        });
      } else {
        product.why_choose = [];
      }

      return NextResponse.json(product);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await db.getConnection();

    try {
      // Delete product from database
      await connection.query("DELETE FROM products WHERE id = ?", [params.id]);
      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
