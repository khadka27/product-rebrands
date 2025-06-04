import mysql from "mysql2/promise";

// Create a connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "product_management",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "product_management",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
  connectTimeout: 60000, // Increase connection timeout to 60 seconds
});

// Test the connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connection successful");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

// Initialize database tables if they don't exist
export async function initDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Starting database initialization...");

    // Create database if it doesn't exist
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS ${
        process.env.DB_NAME || "product_management"
      }
    `);
    console.log("Database created/verified");

    // Use the database
    await connection.query(`
      USE ${process.env.DB_NAME || "product_management"}
    `);
    console.log("Using database:", process.env.DB_NAME || "product_management");

    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        paragraph TEXT,
        bullet_points JSON,
        redirect_link VARCHAR(255) NOT NULL,
        generated_link VARCHAR(255) NOT NULL UNIQUE,
        money_back_days INT DEFAULT 0,
        product_image VARCHAR(255),
        product_badge VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Products table created/verified");

    // Create ingredients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image VARCHAR(255),
        display_order INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Ingredients table created/verified");

    // Create why_choose table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS why_choose (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        display_order INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Why Choose table created/verified");

    // Create product_themes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_themes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        theme VARCHAR(50),
        primary_bg_color VARCHAR(7) DEFAULT '#ffffff',
        secondary_bg_color VARCHAR(7) DEFAULT '#f8fafc',
        accent_bg_color VARCHAR(7) DEFAULT '#e2e8f0',
        primary_text_color VARCHAR(7) DEFAULT '#1a202c',
        secondary_text_color VARCHAR(7) DEFAULT '#4a5568',
        accent_text_color VARCHAR(7) DEFAULT '#2d3748',
        link_color VARCHAR(7) DEFAULT '#3182ce',
        link_hover_color VARCHAR(7) DEFAULT '#2c5282',
        primary_button_bg VARCHAR(7) DEFAULT '#3182ce',
        primary_button_text VARCHAR(7) DEFAULT '#ffffff',
        primary_button_hover_bg VARCHAR(7) DEFAULT '#2c5282',
        secondary_button_bg VARCHAR(7) DEFAULT '#e2e8f0',
        secondary_button_text VARCHAR(7) DEFAULT '#2d3748',
        secondary_button_hover_bg VARCHAR(7) DEFAULT '#cbd5e0',
        card_bg_color VARCHAR(7) DEFAULT '#ffffff',
        card_border_color VARCHAR(7) DEFAULT '#e2e8f0',
        card_shadow_color VARCHAR(7) DEFAULT '#000000',
        header_bg_color VARCHAR(7) DEFAULT '#2d3748',
        header_text_color VARCHAR(7) DEFAULT '#ffffff',
        footer_bg_color VARCHAR(7) DEFAULT '#1a202c',
        footer_text_color VARCHAR(7) DEFAULT '#e2e8f0',
        font_family VARCHAR(100) DEFAULT 'Inter, sans-serif',
        h1_font_size VARCHAR(10) DEFAULT '2.5rem',
        h1_font_weight VARCHAR(10) DEFAULT '700',
        h2_font_size VARCHAR(10) DEFAULT '2rem',
        h2_font_weight VARCHAR(10) DEFAULT '600',
        h3_font_size VARCHAR(10) DEFAULT '1.5rem',
        h3_font_weight VARCHAR(10) DEFAULT '600',
        body_font_size VARCHAR(10) DEFAULT '1rem',
        body_line_height VARCHAR(10) DEFAULT '1.6',
        section_padding VARCHAR(10) DEFAULT '3rem',
        card_padding VARCHAR(10) DEFAULT '1.5rem',
        button_padding VARCHAR(20) DEFAULT '0.75rem 1.5rem',
        border_radius_sm VARCHAR(10) DEFAULT '0.375rem',
        border_radius_md VARCHAR(10) DEFAULT '0.5rem',
        border_radius_lg VARCHAR(10) DEFAULT '0.75rem',
        border_radius_xl VARCHAR(10) DEFAULT '1rem',
        max_width VARCHAR(10) DEFAULT '1200px',
        container_padding VARCHAR(20) DEFAULT '1rem',
        gradient_start VARCHAR(7) DEFAULT '#667eea',
        gradient_end VARCHAR(7) DEFAULT '#764ba2',
        shadow_color VARCHAR(7) DEFAULT '#000000',
        custom_css TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Product Themes table created/verified");

    // Create visits table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Visits table created/verified");

    // Verify tables exist
    const [tables] = await connection.query<any[]>("SHOW TABLES");
    console.log("Existing tables:", tables);

    // Check if we have any data
    const [productCount] = await connection.query<any[]>(
      "SELECT COUNT(*) as count FROM products"
    );
    console.log("Current product count:", productCount[0].count);

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Add test data if tables are empty
export async function addTestData() {
  const connection = await pool.getConnection();
  try {
    console.log("Adding test data...");
    await connection.query(`
      INSERT INTO products (
        product_id, name, slug, paragraph, bullet_points, redirect_link, generated_link, product_image
      ) VALUES (
        'TEST001',
        'Test Product',
        'test-product',
        'This is a test product description paragraph.',
        '["Point 1", "Point 2", "Point 3"]',
        'https://example.com/redirect',
        '${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/preview/test-product',
        'test-product.jpg'
      )
    `);
    console.log("Test data added successfully");
  } catch (error) {
    console.error("Error adding test data:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Initialize database and add test data
initDatabase()
  .then(() => {
    console.log("Database initialization completed");
  })
  .catch((err) => {
    console.error("Error during database setup:", err);
  });

// Drop all tables
export async function dropTables() {
  const connection = await pool.getConnection();
  try {
    console.log("Dropping tables...");
    await connection.query("DROP TABLE IF EXISTS visits");
    await connection.query("DROP TABLE IF EXISTS product_themes");
    await connection.query("DROP TABLE IF EXISTS why_choose");
    await connection.query("DROP TABLE IF EXISTS ingredients");
    await connection.query("DROP TABLE IF EXISTS products");
    console.log("Tables dropped successfully");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
