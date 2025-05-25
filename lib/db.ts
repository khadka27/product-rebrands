import mysql from "mysql2/promise";

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "product_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
        product_id VARCHAR(6) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        redirect_link VARCHAR(255) NOT NULL,
        generated_link VARCHAR(255),
        product_image VARCHAR(255),
        product_badge VARCHAR(255),
        money_back_days INT DEFAULT 60,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Products table created/verified");

    // Create ingredients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(6) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        display_order INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Ingredients table created/verified");

    // Create why_choose table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS why_choose (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(6) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Why Choose table created/verified");

    // Create visits table for tracking
    await connection.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(6) NOT NULL,
        visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Visits table created/verified");

    // Create product_themes table for custom styling
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_themes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(6) NOT NULL UNIQUE,
        
        -- Background Colors
        primary_bg_color VARCHAR(7) DEFAULT '#ffffff',
        secondary_bg_color VARCHAR(7) DEFAULT '#f8fafc',
        accent_bg_color VARCHAR(7) DEFAULT '#e2e8f0',
        
        -- Text Colors
        primary_text_color VARCHAR(7) DEFAULT '#1a202c',
        secondary_text_color VARCHAR(7) DEFAULT '#4a5568',
        accent_text_color VARCHAR(7) DEFAULT '#2d3748',
        link_color VARCHAR(7) DEFAULT '#3182ce',
        link_hover_color VARCHAR(7) DEFAULT '#2c5282',
        
        -- Button Colors
        primary_button_bg VARCHAR(7) DEFAULT '#3182ce',
        primary_button_text VARCHAR(7) DEFAULT '#ffffff',
        primary_button_hover_bg VARCHAR(7) DEFAULT '#2c5282',
        secondary_button_bg VARCHAR(7) DEFAULT '#e2e8f0',
        secondary_button_text VARCHAR(7) DEFAULT '#2d3748',
        secondary_button_hover_bg VARCHAR(7) DEFAULT '#cbd5e0',
        
        -- Card/Section Colors
        card_bg_color VARCHAR(7) DEFAULT '#ffffff',
        card_border_color VARCHAR(7) DEFAULT '#e2e8f0',
        card_shadow_color VARCHAR(7) DEFAULT '#000000',
        
        -- Header Colors
        header_bg_color VARCHAR(7) DEFAULT '#2d3748',
        header_text_color VARCHAR(7) DEFAULT '#ffffff',
        
        -- Footer Colors
        footer_bg_color VARCHAR(7) DEFAULT '#1a202c',
        footer_text_color VARCHAR(7) DEFAULT '#e2e8f0',
        
        -- Typography
        font_family VARCHAR(100) DEFAULT 'Inter, sans-serif',
        h1_font_size VARCHAR(10) DEFAULT '2.5rem',
        h1_font_weight VARCHAR(10) DEFAULT '700',
        h2_font_size VARCHAR(10) DEFAULT '2rem',
        h2_font_weight VARCHAR(10) DEFAULT '600',
        h3_font_size VARCHAR(10) DEFAULT '1.5rem',
        h3_font_weight VARCHAR(10) DEFAULT '600',
        body_font_size VARCHAR(10) DEFAULT '1rem',
        body_line_height VARCHAR(10) DEFAULT '1.6',
        
        -- Spacing
        section_padding VARCHAR(10) DEFAULT '3rem',
        card_padding VARCHAR(10) DEFAULT '1.5rem',
        button_padding VARCHAR(20) DEFAULT '0.75rem 1.5rem',
        
        -- Border Radius
        border_radius_sm VARCHAR(10) DEFAULT '0.375rem',
        border_radius_md VARCHAR(10) DEFAULT '0.5rem',
        border_radius_lg VARCHAR(10) DEFAULT '0.75rem',
        border_radius_xl VARCHAR(10) DEFAULT '1rem',
        
        -- Layout
        max_width VARCHAR(10) DEFAULT '1200px',
        container_padding VARCHAR(20) DEFAULT '1rem',
        
        -- Special Effects
        gradient_start VARCHAR(7) DEFAULT '#667eea',
        gradient_end VARCHAR(7) DEFAULT '#764ba2',
        shadow_color VARCHAR(7) DEFAULT '#000000',
        
        -- Custom CSS
        custom_css TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    console.log("Product Themes table created/verified");

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
    // Check if we have any products
    const [productCount] = await connection.query<any[]>(
      "SELECT COUNT(*) as count FROM products"
    );
    console.log("Current product count:", productCount[0].count);

    if (productCount[0].count === 0) {
      console.log("Adding test data...");

      // Insert test product
      const [result] = await connection.query<any[]>(
        `INSERT INTO products (product_id, name, slug, description, redirect_link, product_image) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "TEST01",
          "Test Product",
          "test-product",
          "Test product description",
          "https://example.com",
          "/placeholder.svg",
        ]
      );

      const productId = (result as any).insertId;
      console.log("Created product with ID:", productId);

      // Insert test ingredients
      const [ingredientResult] = await connection.query<any[]>(
        `INSERT INTO ingredients (product_id, title, description, image, display_order) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          productId,
          "Test Ingredient 1",
          "Description for ingredient 1",
          "/placeholder.svg",
          1,
        ]
      );
      console.log("Added ingredient:", ingredientResult);

      // Insert test why_choose points
      const [whyChooseResult] = await connection.query<any[]>(
        `INSERT INTO why_choose (product_id, title, description, display_order) 
         VALUES (?, ?, ?, ?)`,
        [productId, "Test Benefit 1", "Description for benefit 1", 1]
      );
      console.log("Added why_choose point:", whyChooseResult);

      // Verify data was inserted
      const [ingredients] = await connection.query<any[]>(
        "SELECT * FROM ingredients WHERE product_id = ?",
        [productId]
      );
      console.log("Verification - Ingredients:", ingredients);

      const [whyChoose] = await connection.query<any[]>(
        "SELECT * FROM why_choose WHERE product_id = ?",
        [productId]
      );
      console.log("Verification - Why Choose:", whyChoose);

      console.log("Test data added successfully");
    } else {
      console.log("Products already exist, skipping test data insertion");
    }
  } catch (error) {
    console.error("Error adding test data:", error);
  } finally {
    connection.release();
  }
}

// Initialize database and add test data
initDatabase()
  .then(() => {
    console.log("Database initialization completed");
    return addTestData();
  })
  .then(() => {
    console.log("Test data addition completed");
  })
  .catch((err) => {
    console.error("Error during database setup:", err);
  });

export default pool;
