import { Pool, PoolClient } from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Create a connection pool with PostgreSQL configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME,
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 30000, // how long to wait for a connection
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false, // Enable SSL for cloud databases
});

// Test the connection with detailed error handling
console.log("Database connection configuration:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  hasPassword: !!process.env.DB_PASSWORD,
});

// Test the connection immediately
pool.connect()
  .then(async (client: PoolClient) => {
    console.log("Database connection successful");
    try {
      // Test the connection with a simple query
      const result = await client.query("SELECT 1 as test");
      console.log("Test query result:", result.rows);

      client.release();
      console.log("Connection released successfully");

      // Initialize database and tables
      await initializeDatabase();
    } catch (error) {
      console.error("Error during connection test:", error);
      throw error;
    }
  })
  .catch((err: any) => {
    console.error("Error connecting to the database:", err);
    console.error("Connection details:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
    });

    // Additional error information
    if (err.code === "ENOTFOUND") {
      console.error(
        "DNS resolution failed. Please check if the hostname is correct and your DNS settings."
      );
    } else if (err.code === "ETIMEDOUT") {
      console.error(
        "Connection timed out. Please check if the database is accessible and the port is correct."
      );
      console.error("Trying to connect to:", {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        timeout: "30 seconds",
      });
      console.error("Possible solutions:");
      console.error("1. Check if the database host is correct");
      console.error("2. Try a different port (5432 is default for PostgreSQL)");
      console.error("3. Check if your IP is whitelisted");
      console.error("4. Check if the database service is running");
    } else if (err.code === "ECONNREFUSED") {
      console.error(
        "Connection refused. Please check if the database is running and accessible."
      );
    } else if (err.code === "28P01") {
      console.error("Access denied. Please check your username and password.");
    } else if (err.code === "3D000") {
      console.error(
        `Database '${process.env.DB_NAME}' does not exist. Please create it first.`
      );
    }
  });

// Initialize database tables if they don't exist
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log("Initializing database...");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Users table created or already exists");

    // Check if admin user exists
    const userResult = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [process.env.ADMIN_USERNAME]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      // Create admin user if it doesn't exist
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "admin123",
        10
      );
      await client.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
        process.env.ADMIN_USERNAME || "admin",
        hashedPassword,
      ]);
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }

  // Create all other required tables
  await initDatabase();
}

// Add test data if tables are empty
export async function addTestData() {
  const client = await pool.connect();
  try {
    console.log("Adding test data...");
    await client.query(`
      INSERT INTO products (
        product_id, name, slug, paragraph, bullet_points, redirect_link, generated_link, product_image
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
    `, [
      'TEST001',
      'Test Product',
      'test-product',
      'This is a test product description paragraph.',
      JSON.stringify(["Point 1", "Point 2", "Point 3"]),
      'https://example.com/redirect',
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/preview/test-product`,
      'test-product.jpg'
    ]);
    console.log("Test data added successfully");
  } catch (error) {
    console.error("Error adding test data:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Drop all tables
export async function dropTables() {
  const client = await pool.connect();
  try {
    console.log("Dropping tables...");
    await client.query("DROP TABLE IF EXISTS reviews CASCADE");
    await client.query("DROP TABLE IF EXISTS visits CASCADE");
    await client.query("DROP TABLE IF EXISTS product_themes CASCADE");
    await client.query("DROP TABLE IF EXISTS why_choose CASCADE");
    await client.query("DROP TABLE IF EXISTS ingredients CASCADE");
    await client.query("DROP TABLE IF EXISTS products CASCADE");
    console.log("Tables dropped successfully");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize database tables
export async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log("Creating database tables...");

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        paragraph TEXT,
        bullet_points JSONB,
        redirect_link VARCHAR(500),
        generated_link VARCHAR(500),
        product_image VARCHAR(255),
        product_badge VARCHAR(255),
        money_back_days INTEGER DEFAULT 60,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create trigger for updated_at on products table
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create ingredients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);

    // Create trigger for updated_at on ingredients table
    await client.query(`
      DROP TRIGGER IF EXISTS update_ingredients_updated_at ON ingredients;
      CREATE TRIGGER update_ingredients_updated_at
        BEFORE UPDATE ON ingredients
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create why_choose table
    await client.query(`
      CREATE TABLE IF NOT EXISTS why_choose (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);

    // Create trigger for updated_at on why_choose table
    await client.query(`
      DROP TRIGGER IF EXISTS update_why_choose_updated_at ON why_choose;
      CREATE TRIGGER update_why_choose_updated_at
        BEFORE UPDATE ON why_choose
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);

    // Create index for product_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)
    `);

    // Create trigger for updated_at on reviews table
    await client.query(`
      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
      CREATE TRIGGER update_reviews_updated_at
        BEFORE UPDATE ON reviews
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create product_themes table
    await client.query(`
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
      )
    `);

    // Create trigger for updated_at on product_themes table
    await client.query(`
      DROP TRIGGER IF EXISTS update_product_themes_updated_at ON product_themes;
      CREATE TRIGGER update_product_themes_updated_at
        BEFORE UPDATE ON product_themes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create visits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating database tables:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Provide a getConnection method for compatibility with existing code
export default {
  async getConnection(): Promise<PoolClient> {
    return await pool.connect();
  },
  async query(text: string, params?: any[]): Promise<any> {
    return await pool.query(text, params);
  },
  pool
};