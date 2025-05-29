import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { processImage } from "@/lib/server-utils";
import type { Express } from "express";
import process from "process";
import { sql } from "@vercel/postgres";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { rows } = await sql`
      SELECT p.product_id, p.name, p.paragraph, p.bullet_points, p.redirect_link, p.generated_link, p.money_back_days, p.image, p.badge_image,
        pt.*,
        json_agg(DISTINCT i.*) as ingredients,
        json_agg(DISTINCT wc.*) as why_choose
        FROM products p
      LEFT JOIN product_themes pt ON p.product_id = pt.product_id
      LEFT JOIN ingredients i ON p.product_id = i.product_id
      LEFT JOIN why_choose wc ON p.product_id = wc.product_id
      WHERE p.product_id = ${params.id}
      GROUP BY p.product_id, pt.id
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Parse the bullet_points JSON from the database
    const productData = rows[0];
    // Ensure bullet_points is always an array, even if null or empty string from DB
    try {
      productData.bullet_points = productData.bullet_points
        ? JSON.parse(productData.bullet_points)
        : [];
    } catch (e) {
      console.error("Failed to parse bullet_points JSON from DB:", e);
      productData.bullet_points = []; // Default to empty array on parse error
    }

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const paragraph = formData.get("paragraph") as string; // Get paragraph
    const bullet_points_json = formData.get("bullet_points") as string; // Get bullet points JSON string

    console.log("PUT: Received bullet_points_json:", bullet_points_json);

    // Parse bullet points JSON, default to empty array if parsing fails or string is empty/null
    let bullet_points: string[] = [];
    if (bullet_points_json) {
      try {
        bullet_points = JSON.parse(bullet_points_json);
      } catch (e) {
        console.error("Failed to parse bullet_points JSON in PUT:", e);
        // Keep bullet_points as empty array
      }
    }

    console.log("PUT: Parsed bullet_points array:", bullet_points);

    const redirect_link = formData.get("redirect_link") as string;
    const generated_link = formData.get("generated_link") as string;
    const money_back_days = parseInt(formData.get("money_back_days") as string);
    const theme = formData.get("theme") as string;
    const ingredients = formData.get("ingredients") as string;
    const why_choose = formData.get("why_choose") as string;

    // Update product
    await sql`
      UPDATE products
      SET
        name = ${name},
        paragraph = ${paragraph},
        bullet_points = ${JSON.stringify(
          bullet_points
        )}, // Save bullet points as JSON string
        redirect_link = ${redirect_link},
        generated_link = ${generated_link},
        money_back_days = ${money_back_days}
      WHERE product_id = ${params.id}
    `;

    // Update theme
    if (theme) {
      const themeData = JSON.parse(theme);
      await sql`
        UPDATE product_themes
        SET
          primary_bg_color = ${themeData.primary_bg_color},
          secondary_bg_color = ${themeData.secondary_bg_color},
          accent_bg_color = ${themeData.accent_bg_color},
          primary_text_color = ${themeData.primary_text_color},
          secondary_text_color = ${themeData.secondary_text_color},
          accent_text_color = ${themeData.accent_text_color},
          link_color = ${themeData.link_color},
          link_hover_color = ${themeData.link_hover_color},
          primary_button_bg = ${themeData.primary_button_bg},
          primary_button_text = ${themeData.primary_button_text},
          primary_button_hover_bg = ${themeData.primary_button_hover_bg},
          secondary_button_bg = ${themeData.secondary_button_bg},
          secondary_button_text = ${themeData.secondary_button_text},
          secondary_button_hover_bg = ${themeData.secondary_button_hover_bg},
          card_bg_color = ${themeData.card_bg_color},
          card_border_color = ${themeData.card_border_color},
          card_shadow_color = ${themeData.card_shadow_color},
          header_bg_color = ${themeData.header_bg_color},
          header_text_color = ${themeData.header_text_color},
          footer_bg_color = ${themeData.footer_bg_color},
          footer_text_color = ${themeData.footer_text_color},
          font_family = ${themeData.font_family},
          h1_font_size = ${themeData.h1_font_size},
          h1_font_weight = ${themeData.h1_font_weight},
          h2_font_size = ${themeData.h2_font_size},
          h2_font_weight = ${themeData.h2_font_weight},
          h3_font_size = ${themeData.h3_font_size},
          h3_font_weight = ${themeData.h3_font_weight},
          body_font_size = ${themeData.body_font_size},
          body_line_height = ${themeData.body_line_height},
          section_padding = ${themeData.section_padding},
          card_padding = ${themeData.card_padding},
          button_padding = ${themeData.button_padding},
          border_radius_sm = ${themeData.border_radius_sm},
          border_radius_md = ${themeData.border_radius_md},
          border_radius_lg = ${themeData.border_radius_lg},
          border_radius_xl = ${themeData.border_radius_xl},
          max_width = ${themeData.max_width},
          container_padding = ${themeData.container_padding},
          gradient_start = ${themeData.gradient_start},
          gradient_end = ${themeData.gradient_end},
          shadow_color = ${themeData.shadow_color},
          custom_css = ${themeData.custom_css}
        WHERE product_id = ${params.id}
      `;
    }

    // Update ingredients
    if (ingredients) {
      const ingredientsData = JSON.parse(ingredients);
      // First delete existing ingredients
      await sql`DELETE FROM ingredients WHERE product_id = ${params.id}`;

      // Then insert new ingredients
      for (const ingredient of ingredientsData) {
        await sql`
          INSERT INTO ingredients (
            product_id, title, description, image, display_order
          ) VALUES (
            ${params.id}, ${ingredient.title}, ${ingredient.description},
            ${ingredient.image}, ${ingredient.display_order}
          )
        `;
      }
    }

    // Update why choose
    if (why_choose) {
      const whyChooseData = JSON.parse(why_choose);
      // First delete existing why choose
      await sql`DELETE FROM why_choose WHERE product_id = ${params.id}`;

      // Then insert new why choose
      for (const item of whyChooseData) {
        await sql`
          INSERT INTO why_choose (
            product_id, title, description, display_order
          ) VALUES (
            ${params.id}, ${item.title}, ${item.description},
            ${item.display_order}
          )
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const paragraph = formData.get("paragraph") as string; // Get paragraph
    const bullet_points_json = formData.get("bullet_points") as string; // Get bullet points JSON string

    console.log("POST: Received bullet_points_json:", bullet_points_json);

    // Parse bullet points JSON, default to empty array if parsing fails or string is empty/null
    let bullet_points: string[] = [];
    if (bullet_points_json) {
      try {
        bullet_points = JSON.parse(bullet_points_json);
      } catch (e) {
        console.error("Failed to parse bullet_points JSON in POST:", e);
        // Keep bullet_points as empty array
      }
    }

    console.log("POST: Parsed bullet_points array:", bullet_points);

    const redirect_link = formData.get("redirect_link") as string;
    const generated_link = formData.get("generated_link") as string;
    const money_back_days = parseInt(formData.get("money_back_days") as string);
    const theme = formData.get("theme") as string;
    const ingredients = formData.get("ingredients") as string;
    const why_choose = formData.get("why_choose") as string;

    // Insert new product
    const result = await sql`
      INSERT INTO products (
        name, paragraph, bullet_points, redirect_link, generated_link, money_back_days
      ) VALUES (
        ${name}, ${paragraph}, ${JSON.stringify(
      bullet_points
    )}, ${redirect_link}, ${generated_link}, ${money_back_days}
      ) RETURNING product_id;
    `;

    const newProductId = result.rows[0].product_id;

    // Insert theme
    if (theme) {
      const themeData = JSON.parse(theme);
      await sql`
        INSERT INTO product_themes (
          product_id, primary_bg_color, secondary_bg_color, accent_bg_color, primary_text_color, secondary_text_color,
          accent_text_color, link_color, link_hover_color, primary_button_bg, primary_button_text, primary_button_hover_bg,
          secondary_button_bg, secondary_button_text, secondary_button_hover_bg, card_bg_color, card_border_color,
          card_shadow_color, header_bg_color, header_text_color, footer_bg_color, footer_text_color, font_family, h1_font_size,
          h1_font_weight, h2_font_size, h2_font_weight, h3_font_size, h3_font_weight, body_font_size, body_line_height,
          section_padding, card_padding, button_padding, border_radius_sm, border_radius_md, border_radius_lg, border_radius_xl,
          max_width, container_padding, gradient_start, gradient_end, shadow_color, custom_css
        ) VALUES (
          ${newProductId}, ${themeData.primary_bg_color}, ${themeData.secondary_bg_color}, ${themeData.accent_bg_color},
          ${themeData.primary_text_color}, ${themeData.secondary_text_color}, ${themeData.accent_text_color}, ${themeData.link_color},
          ${themeData.link_hover_color}, ${themeData.primary_button_bg}, ${themeData.primary_button_text}, ${themeData.primary_button_hover_bg},
          ${themeData.secondary_button_bg}, ${themeData.secondary_button_text}, ${themeData.secondary_button_hover_bg}, ${themeData.card_bg_color},
          ${themeData.card_border_color}, ${themeData.card_shadow_color}, ${themeData.header_bg_color}, ${themeData.header_text_color},
          ${themeData.footer_bg_color}, ${themeData.footer_text_color}, ${themeData.font_family}, ${themeData.h1_font_size},
          ${themeData.h1_font_weight}, ${themeData.h2_font_size}, ${themeData.h2_font_weight}, ${themeData.h3_font_size}, ${themeData.h3_font_weight},
          ${themeData.body_font_size}, ${themeData.body_line_height}, ${themeData.section_padding}, ${themeData.card_padding},
          ${themeData.button_padding}, ${themeData.border_radius_sm}, ${themeData.border_radius_md}, ${themeData.border_radius_lg},
          ${themeData.border_radius_xl}, ${themeData.max_width}, ${themeData.container_padding}, ${themeData.gradient_start},
          ${themeData.gradient_end}, ${themeData.shadow_color}, ${themeData.custom_css}
        );
      `;
    }

    // Insert ingredients
    if (ingredients) {
      const ingredientsData = JSON.parse(ingredients);
      for (const ingredient of ingredientsData) {
        await sql`
          INSERT INTO ingredients (
            product_id, title, description, image, display_order
          ) VALUES (
            ${newProductId}, ${ingredient.title}, ${ingredient.description},
            ${ingredient.image}, ${ingredient.display_order}
          )
        `;
      }
    }

    // Insert why choose
    if (why_choose) {
      const whyChooseData = JSON.parse(why_choose);
      for (const item of whyChooseData) {
        await sql`
          INSERT INTO why_choose (
            product_id, title, description, display_order
          ) VALUES (
            ${newProductId}, ${item.title}, ${item.description},
            ${item.display_order}
          )
        `;
      }
    }

    return NextResponse.json({ success: true, productId: newProductId });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Delete related records first
    await sql`DELETE FROM product_themes WHERE product_id = ${params.id}`;
    await sql`DELETE FROM ingredients WHERE product_id = ${params.id}`;
    await sql`DELETE FROM why_choose WHERE product_id = ${params.id}`;

    // Then delete the product
    await sql`DELETE FROM products WHERE product_id = ${params.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
