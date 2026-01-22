import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { processImage } from "@/lib/server-utils";

// Normalize image paths to ensure they start with a leading slash
const normalizePath = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.replace(/^\/+/, "");
  return `/${trimmed}`;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const awaitedParams = await context.params;
  try {
    const productId = awaitedParams.id;
    const connection = await db.getConnection();

    try {
      // Fetch product - try by product_id first (as string), then by slug
      let productResult = await connection.query(
        "SELECT * FROM products WHERE product_id = $1",
        [productId],
      );

      // If not found by ID, try by slug
      if (productResult.rows.length === 0) {
        productResult = await connection.query(
          "SELECT * FROM products WHERE slug = $1",
          [productId],
        );
      }

      if (productResult.rows.length === 0) {
        connection.release();
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const product = productResult.rows[0];

      // Use the actual product_id from the database for all subsequent queries
      const actualProductId = product.product_id;

      // Normalize image paths
      product.product_image = normalizePath(product.product_image);
      product.product_badge = normalizePath(product.product_badge);

      // Parse bullet_points if it's a JSON string (for backward compatibility)
      if (product.bullet_points && typeof product.bullet_points === "string") {
        try {
          product.bullet_points = JSON.parse(product.bullet_points);
        } catch (e) {
          console.error("Failed to parse bullet_points JSON:", e);
          product.bullet_points = [];
        }
      }

      // Fetch related data using the actual product_id from database
      const themeResult = await connection.query(
        "SELECT * FROM product_themes WHERE product_id = $1",
        [actualProductId],
      );

      const ingredientsResult = await connection.query(
        "SELECT * FROM ingredients WHERE product_id = $1 ORDER BY display_order",
        [actualProductId],
      );

      const whyChooseResult = await connection.query(
        "SELECT * FROM why_choose WHERE product_id = $1 ORDER BY display_order",
        [actualProductId],
      );

      const reviewsResult = await connection.query(
        "SELECT * FROM reviews WHERE product_id = $1 ORDER BY id",
        [actualProductId],
      );

      connection.release();

      // Normalize ingredient and review image paths
      const normalizedIngredients = ingredientsResult.rows.map((ing) => ({
        ...ing,
        image: normalizePath(ing.image),
      }));

      const normalizedReviews = reviewsResult.rows.map((rev) => ({
        ...rev,
        avatar: normalizePath(rev.avatar),
      }));

      return NextResponse.json({
        ...product,
        theme: themeResult.rows[0] || null,
        ingredients: normalizedIngredients,
        why_choose: whyChooseResult.rows,
        reviews: normalizedReviews,
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const awaitedParams = await context.params;
  try {
    let productId = awaitedParams.id;
    const formData = await request.formData();

    // Debug: log incoming params and formData keys
    console.log("[PUT /api/products/[id]] Incoming params:", awaitedParams);
      console.log("[PUT /api/products/[id]] Incoming params:", awaitedParams);
      console.error("[PUT /api/products/[id]] Product not found for id:", productId, "params:", awaitedParams);
    console.log("[PUT /api/products/[id]] productId:", productId);
    console.log(
      "[PUT /api/products/[id]] formData keys:",
      Array.from(formData.keys()),
    );

    // First, resolve slug to product_id if necessary
    const resolveConnection = await db.getConnection();
    let productNotFound = false;
    let actualProductId: string | null = null;

    try {
      // Try by product_id first (as string)
      let productResult = await resolveConnection.query(
        "SELECT product_id FROM products WHERE product_id = $1",
        [productId],
      );
      console.log(
        "[PUT /api/products/[id]] Lookup by product_id result:",
        productResult.rows,
      );

      if (productResult.rows.length > 0) {
        actualProductId = productResult.rows[0].product_id;
      }

      // If not found by product_id, try by slug
      if (!actualProductId) {
        productResult = await resolveConnection.query(
          "SELECT product_id FROM products WHERE slug = $1",
          [productId],
        );
        console.log(
          "[PUT /api/products/[id]] Lookup by slug result:",
          productResult.rows,
        );

        if (productResult.rows.length > 0) {
          actualProductId = productResult.rows[0].product_id;
        } else {
          // Product not found by ID or slug
          productNotFound = true;
        }
      }
      console.log(
        "[PUT /api/products/[id]] Resolved actualProductId:",
        actualProductId,
      );
    } catch (error) {
      console.error("Error resolving product ID:", error);
    } finally {
      resolveConnection.release();
    }

    if (productNotFound || !actualProductId) {
      console.error(
        "[PUT /api/products/[id]] Product not found for id:",
        productId,
        "params:",
        awaitedParams,
      );
      return NextResponse.json(
        { error: "Product not found", debug: { productId, awaitedParams } },
        { status: 404 },
      );
    }

    // Use the resolved product ID for all subsequent operations
    productId = actualProductId;

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
    const existingImagePath = formData.get("image_existing") as string;
    const existingBadgeImagePath = formData.get(
      "badge_image_existing",
    ) as string;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const file = {
        buffer,
        originalname: imageFile.name,
        mimetype: imageFile.type,
      } as Express.Multer.File;
      productImagePath = await processImage(
        file,
        "public/images/products",
        `product_${productId}`,
      );
    } else if (existingImagePath) {
      // Use existing image path if no new image uploaded
      productImagePath = normalizePath(existingImagePath);
    }

    if (badgeImageFile && badgeImageFile.size > 0) {
      const buffer = Buffer.from(await badgeImageFile.arrayBuffer());
      const file = {
        buffer,
        originalname: badgeImageFile.name,
        mimetype: badgeImageFile.type,
      } as Express.Multer.File;
      badgeImagePath = await processImage(
        file,
        "public/images/badges",
        `badge_${productId}`,
      );
    } else if (existingBadgeImagePath) {
      // Use existing badge image path if no new image uploaded
      badgeImagePath = normalizePath(existingBadgeImagePath);
    }

    const connection = await db.getConnection();

    try {
      // Start transaction
      await connection.query("BEGIN");

      // Get current product to preserve existing images if no new ones uploaded
      const currentProductResult = await connection.query(
        "SELECT product_image, product_badge FROM products WHERE product_id = $1",
        [productId],
      );

      if (currentProductResult.rows.length === 0) {
        await connection.query("ROLLBACK");
        connection.release();
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const currentProduct = currentProductResult.rows[0];

      // Update product
      await connection.query(
        `UPDATE products 
        SET 
          name = $1,
          paragraph = $2,
          bullet_points = $3,
          redirect_link = $4,
          generated_link = $5,
          money_back_days = $6,
          product_image = $7,
          product_badge = $8
        WHERE product_id = $9`,
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
        ],
      );

      // Handle ingredients
      const ingredientsJson = formData.get("ingredients");
      if (ingredientsJson) {
        try {
          const ingredients = JSON.parse(ingredientsJson as string);

          // Delete existing ingredients
          await connection.query(
            "DELETE FROM ingredients WHERE product_id = $1",
            [productId],
          );

          // Insert new ingredients
          for (const [index, ingredient] of ingredients.entries()) {
            let ingredientImagePath = null;

            // Check if there's a file for this ingredient
            const ingredientImageFile = formData.get(
              `ingredient_image_${index}`,
            ) as File;
            const existingIngredientImage = formData.get(
              `ingredient_image_${index}_existing`,
            ) as string;

            if (ingredientImageFile && ingredientImageFile.size > 0) {
              const buffer = Buffer.from(
                await ingredientImageFile.arrayBuffer(),
              );
              const file = {
                buffer,
                originalname: ingredientImageFile.name,
                mimetype: ingredientImageFile.type,
              } as Express.Multer.File;
              ingredientImagePath = await processImage(
                file,
                "public/images/ingredients",
                `ingredient_${productId}_${index}`,
              );
            } else if (existingIngredientImage) {
              // Use existing ingredient image path
              ingredientImagePath = normalizePath(existingIngredientImage);
            } else if (
              ingredient.image_preview &&
              !ingredient.image_preview.startsWith("blob:")
            ) {
              // Keep existing image (fallback)
              ingredientImagePath = normalizePath(ingredient.image_preview);
            }

            await connection.query(
              `INSERT INTO ingredients (
                product_id,
                title,
                description,
                image,
                display_order
              ) VALUES ($1, $2, $3, $4, $5)`,
              [
                productId,
                ingredient.title,
                ingredient.description,
                ingredientImagePath,
                ingredient.display_order,
              ],
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
            "DELETE FROM why_choose WHERE product_id = $1",
            [productId],
          );

          // Insert new why_choose items
          for (const item of whyChooseItems) {
            await connection.query(
              `INSERT INTO why_choose (
                product_id,
                title,
                description,
                display_order
              ) VALUES ($1, $2, $3, $4)`,
              [productId, item.title, item.description, item.display_order],
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

          // Delete existing reviews
          await connection.query("DELETE FROM reviews WHERE product_id = $1", [
            productId,
          ]);

          // Insert new reviews
          for (const [index, review] of reviews.entries()) {
            let avatarPath = null;

            // Check if there's a file for this review
            const avatarFile = formData.get(`review_avatar_${index}`) as File;
            const existingAvatarPath = formData.get(
              `review_avatar_${index}_existing`,
            ) as string;

            if (avatarFile && avatarFile.size > 0) {
              const buffer = Buffer.from(await avatarFile.arrayBuffer());
              const file = {
                buffer,
                originalname: avatarFile.name,
                mimetype: avatarFile.type,
              } as Express.Multer.File;
              avatarPath = await processImage(
                file,
                "public/images/avatars",
                `avatar_${productId}_${index}`,
              );
            } else if (existingAvatarPath) {
              // Use existing avatar path
              avatarPath = normalizePath(existingAvatarPath);
            } else if (
              review.avatar_preview &&
              !review.avatar_preview.startsWith("blob:")
            ) {
              // Keep existing avatar (fallback)
              avatarPath = normalizePath(review.avatar_preview);
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
              ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
              [
                productId,
                review.name,
                review.address,
                review.rating,
                review.review_text,
                avatarPath,
              ],
            );
          }
        } catch (e) {
          console.error("Error processing reviews:", e);
        }
      }

      // Commit the transaction
      await connection.query("COMMIT");
      connection.release();

      // Revalidate the preview page to clear cache and show updated images
      console.log("🔄 Revalidating preview page cache for product:", productId);

      // Get the product slug to revalidate the correct path
      const slugResult = await db.getConnection();
      try {
        const slugQuery = await slugResult.query(
          "SELECT slug FROM products WHERE product_id = $1",
          [productId],
        );

        if (slugQuery.rows.length > 0) {
          const slug = slugQuery.rows[0].slug;
          revalidatePath(`/preview/${slug}`);
          console.log(`✅ Revalidated preview page: /preview/${slug}`);
        }
      } catch (slugError) {
        console.error("Error getting slug for revalidation:", slugError);
      } finally {
        slugResult.release();
      }

      return NextResponse.json({
        success: true,
        message: "Product updated successfully",
      });
    } catch (error) {
      // Rollback the transaction on error
      await connection.query("ROLLBACK");
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const awaitedParams = await context.params;
  try {
    let productId = awaitedParams.id;

    const connection = await db.getConnection();

    try {
      let actualProductId: string | null = null;

      // First, resolve slug to product_id if necessary
      let productResult = await connection.query(
        "SELECT product_id FROM products WHERE product_id = $1",
        [productId],
      );

      if (productResult.rows.length > 0) {
        actualProductId = productResult.rows[0].product_id;
      }

      // If not found by ID, try by slug
      if (!actualProductId) {
        productResult = await connection.query(
          "SELECT product_id FROM products WHERE slug = $1",
          [productId],
        );

        if (productResult.rows.length > 0) {
          actualProductId = productResult.rows[0].product_id;
        } else {
          connection.release();
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 },
          );
        }
      }

      // Start transaction
      await connection.query("BEGIN");

      // Delete related records first (using correct table names)
      await connection.query(
        "DELETE FROM product_themes WHERE product_id = $1",
        [actualProductId],
      );
      await connection.query("DELETE FROM ingredients WHERE product_id = $1", [
        actualProductId,
      ]);
      await connection.query("DELETE FROM why_choose WHERE product_id = $1", [
        actualProductId,
      ]);
      await connection.query("DELETE FROM reviews WHERE product_id = $1", [
        actualProductId,
      ]);

      // Delete the product
      await connection.query("DELETE FROM products WHERE product_id = $1", [
        actualProductId,
      ]);

      // Commit the transaction
      await connection.query("COMMIT");
      connection.release();

      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback the transaction on error
      await connection.query("ROLLBACK");
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
