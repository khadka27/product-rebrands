import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST() {
  let connection;
  try {
    console.log("Starting database reset...");
    connection = await db.getConnection();

    // Disable foreign key checks to allow dropping tables
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Drop all tables in correct order
    const tables = [
      "visits",
      "reviews",
      "product_themes",
      "why_choose",
      "ingredients",
      "products",
    ];

    for (const table of tables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} might not exist, continuing...`);
      }
    }

    // Re-enable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // Recreate all tables with proper structure
    console.log("Recreating tables...");

    // Create products table
    await connection.query(`
      CREATE TABLE products (
        product_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        paragraph TEXT,
        bullet_points JSON,
        redirect_link VARCHAR(500),
        generated_link VARCHAR(500),
        product_image VARCHAR(255),
        product_badge VARCHAR(255),
        money_back_days INT DEFAULT 60,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created products table");

    // Create ingredients table
    await connection.query(`
      CREATE TABLE ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Created ingredients table");

    // Create why_choose table
    await connection.query(`
      CREATE TABLE why_choose (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Created why_choose table");

    // Create reviews table WITH avatar column
    await connection.query(`
      CREATE TABLE reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        avatar VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_product_id (product_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Created reviews table with avatar column");

    // Create product_themes table
    await connection.query(`
      CREATE TABLE product_themes (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Created product_themes table");

    // Create visits table
    await connection.query(`
      CREATE TABLE visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Created visits table");

    // Verify the reviews table structure
    const [tableInfo] = (await connection.query("DESCRIBE reviews")) as any;
    console.log("Reviews table structure:", tableInfo);

    return NextResponse.json({
      success: true,
      message: "Database reset successfully with avatar column",
      tablesCreated: [
        "products",
        "ingredients",
        "why_choose",
        "reviews",
        "product_themes",
        "visits",
      ],
      reviewsTableStructure: tableInfo,
    });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      {
        error: "Failed to reset database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to reset the database",
    warning: "This will delete ALL data in the database!",
  });
}
