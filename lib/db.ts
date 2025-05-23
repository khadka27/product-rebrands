import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "product_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Initialize database tables if they don't exist
export async function initDatabase() {
  const connection = await pool.getConnection()

  try {
    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(6) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        redirect_link VARCHAR(255) NOT NULL,
        product_image VARCHAR(255),
        product_badge VARCHAR(255),
        money_back_days INT DEFAULT 60,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create ingredients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        display_order INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    // Create why_choose table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS why_choose (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    // Create visits table for tracking
    await connection.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    // Create product_themes table for custom styling
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_themes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL UNIQUE,
        
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
        card_shadow_color VARCHAR(7) DEFAULT '#00000010',
        
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
        shadow_color VARCHAR(7) DEFAULT '#00000020',
        
        -- Custom CSS
        custom_css TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  } finally {
    connection.release()
  }
}

// Execute the database initialization
initDatabase().catch(console.error)

export default pool
