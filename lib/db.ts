import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

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
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  multipleStatements: true,
  dateStrings: true,
  timezone: "Z",
});

// Test the connection with more detailed error handling
console.log("Attempting database connection with config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3307,
});

pool
  .getConnection()
  .then(async (connection) => {
    console.log("Database connection successful");
    connection.release();

    // Initialize database and tables
    await initializeDatabase();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
    console.error("Connection details:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3307,
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
        port: process.env.DB_PORT || 3307,
        timeout: "30 seconds",
      });
      console.error("Possible solutions:");
      console.error("1. Check if the database host is correct");
      console.error("2. Try a different port (3306 or 3307)");
      console.error("3. Check if your IP is whitelisted");
      console.error("4. Check if the database service is running");
    } else if (err.code === "ECONNREFUSED") {
      console.error(
        "Connection refused. Please check if the database is running and accessible."
      );
    }
  });

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Create database if it doesn't exist
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await pool.query(`USE ${process.env.DB_NAME}`);
    console.log(`Using database ${process.env.DB_NAME}`);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created or already exists");

    // Check if admin user exists
    const [users] = await pool.query<any[]>(
      "SELECT * FROM users WHERE username = ?",
      [process.env.ADMIN_USERNAME]
    );

    if (!users || users.length === 0) {
      // Create admin user if it doesn't exist
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "admin123",
        10
      );
      await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [
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
