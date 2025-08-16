import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { processImage } from "@/lib/server-utils";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const connection = await db.getConnection();

    try {
      // Fetch product
      const [productRows]: any = await connection.query(
        "SELECT * FROM products WHERE product_id = ?",
        [productId]
      );

      if (productRows.length === 0) {
        connection.release();
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const product = productRows[0];

      // Parse bullet_points if it's a JSON string
      if (product.bullet_points && typeof product.bullet_points === "string") {
        try {
          product.bullet_points = JSON.parse(product.bullet_points);
        } catch (e) {
          console.error("Failed to parse bullet_points JSON:", e);
          product.bullet_points = [];
        }
      }

      // Fetch theme
      const [themeRows]: any = await connection.query(
        "SELECT * FROM product_themes WHERE product_id = ?",
        [productId]
      );

      // Fetch ingredients
      const [ingredientsRows]: any = await connection.query(
        "SELECT * FROM ingredients WHERE product_id = ? ORDER BY display_order",
        [productId]
      );

      // Fetch why choose items
      const [whyChooseRows]: any = await connection.query(
        "SELECT * FROM why_choose WHERE product_id = ? ORDER BY display_order",
        [productId]
      );

      // Fetch reviews
      const [reviewsRows]: any = await connection.query(
        "SELECT * FROM reviews WHERE product_id = ? ORDER BY id",
        [productId]
      );

      connection.release();

      return NextResponse.json({
        ...product,
        theme: themeRows[0] || null,
        ingredients: ingredientsRows,
        why_choose: whyChooseRows,
        reviews: reviewsRows,
      });
    } catch (error) {
      connection.release();
      throw error;
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const paragraph = formData.get("paragraph") as string;
    const bullet_points_json = formData.get("bullet_points") as string;
    const redirect_link = formData.get("redirect_link") as string;
    const generated_link = formData.get("generated_link") as string;
    const money_back_days = parseInt(formData.get("money_back_days") as string);

    // Parse bullet points
    let bullet_points: string[] = [];
    if (bullet_points_json) {
      try {
        bullet_points = JSON.parse(bullet_points_json);
      } catch (e) {
        console.error("Failed to parse bullet_points JSON in PUT:", e);
      }
    }

    // Handle image uploads
    let productImagePath = null;
    let badgeImagePath = null;

    const imageFile = formData.get("image") as File;
    const badgeImageFile = formData.get("badge_image") as File;

    if (imageFile && imageFile.size > 0) {
      const fileBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      productImagePath = await processImage(
        { buffer, originalname: imageFile.name } as Express.Multer.File,
        "products",
        `product_${productId}`
      );
    }

    if (badgeImageFile && badgeImageFile.size > 0) {
      const fileBuffer = await badgeImageFile.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);
      badgeImagePath = await processImage(
        { buffer, originalname: badgeImageFile.name } as Express.Multer.File,
        "badges",
        `badge_${productId}`
      );
    }

    const connection = await db.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Get current product to preserve existing images if no new ones uploaded
      const [currentProductRows]: any = await connection.query(
        "SELECT product_image, product_badge FROM products WHERE product_id = ?",
        [productId]
      );

      if (currentProductRows.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const currentProduct = currentProductRows[0];

      // Update product
      await connection.query(
        `UPDATE products 
        SET 
          name = ?,
          paragraph = ?,
          bullet_points = ?,
          redirect_link = ?,
          generated_link = ?,
          money_back_days = ?,
          product_image = ?,
          product_badge = ?,
          updated_at = NOW()
        WHERE product_id = ?`,
        [
          name,
          paragraph,
          JSON.stringify(bullet_points),
          redirect_link,
          generated_link,
          money_back_days,
          productImagePath || currentProduct.product_image,
          badgeImagePath || currentProduct.product_badge,
          productId,
        ]
      );

      // Handle ingredients
      const ingredientsJson = formData.get("ingredients");
      if (ingredientsJson) {
        try {
          const ingredients = JSON.parse(ingredientsJson as string);

          // Delete existing ingredients
          await connection.query(
            "DELETE FROM ingredients WHERE product_id = ?",
            [productId]
          );

          // Insert new ingredients
          for (const ingredient of ingredients) {
            let ingredientImagePath = null;

            // Check if there's a file for this ingredient
            const ingredientImageFile = formData.get(
              `ingredient_image_${ingredient.tempId || ingredient.id}`
            ) as File;
            
            if (ingredientImageFile && ingredientImageFile.size > 0) {
            const fileBuffer = await ingredientImageFile.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);
            ingredientImagePath = await processImage(
              { buffer, originalname: ingredientImageFile.name } as Express.Multer.File,
              "ingredients",
              `ingredient_${productId}_${ingredient.tempId || ingredient.id}`
            );
            } else if (
              ingredient.image_preview &&
              !ingredient.image_preview.startsWith("blob:")
            ) {
              // Keep existing image
              ingredientImagePath = ingredient.image_preview;
            }

            await connection.query(
              `INSERT INTO ingredients (
                product_id,
                title,
                description,
                image,
                display_order
              ) VALUES (?, ?, ?, ?, ?)`,
              [
                productId,
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

      // Handle why_choose
      const whyChooseJson = formData.get("why_choose");
      if (whyChooseJson) {
        try {
          const whyChooseItems = JSON.parse(whyChooseJson as string);

          // Delete existing why_choose items
          await connection.query(
            "DELETE FROM why_choose WHERE product_id = ?",
            [productId]
          );

          // Insert new why_choose items
          for (const item of whyChooseItems) {
            await connection.query(
              `INSERT INTO why_choose (
                product_id,
                title,
                description,
                display_order
              ) VALUES (?, ?, ?, ?)`,
              [productId, item.title, item.description, item.display_order]
            );
          }
        } catch (e) {
          console.error("Error processing why_choose:", e);
        }
      }

      // Handle reviews
      const reviewsJson = formData.get("reviews");
      if (reviewsJson) {
        try {
          const reviews = JSON.parse(reviewsJson as string);
          
          await connection.query("DELETE FROM reviews WHERE product_id = ?", [
            productId,
          ]);

          // Insert new reviews
          for (const review of reviews) {
            let avatarPath = null;

            // Check if there's a file for this review
            const avatarFile = formData.get(
              `review_avatar_${review.tempId || review.id}`
            ) as File;
            
            if (avatarFile && avatarFile.size > 0) {
              const fileBuffer = await avatarFile.arrayBuffer();
              const buffer = Buffer.from(fileBuffer);
              avatarPath = await processImage(
                { buffer, originalname: avatarFile.name } as Express.Multer.File,
                "avatars",
                `avatar_${productId}_${review.tempId || review.id}`
              );
            }

            await connection.query(
              `INSERT INTO reviews (
                product_id,
                name,
                address,
                rating,
                review_text,
                avatar,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                productId,
                review.name,
                review.address,
                review.rating,
                review.review_text,
                avatarPath,
              ]
            );
          }
        } catch (e) {
          console.error("Error processing reviews:", e);
        }
      }

      // Commit the transaction
      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const connection = await db.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // Delete related records first (using correct table names)
      await connection.query(
        "DELETE FROM product_themes WHERE product_id = ?",
        [productId]
      );
      await connection.query("DELETE FROM ingredients WHERE product_id = ?", [
        productId,
      ]);
      await connection.query("DELETE FROM why_choose WHERE product_id = ?", [
        productId,
      ]);
      await connection.query("DELETE FROM reviews WHERE product_id = ?", [
        productId,
      ]);

      // Delete the product
      await connection.query("DELETE FROM products WHERE product_id = ?", [
        productId,
      ]);

      // Commit the transaction
      await connection.commit();
      connection.release();

      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback the transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
