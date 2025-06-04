'use strict';

// Required modules
const path = require('path');
const fs = require('fs');

// Constants
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_EMAIL = 'admin@example.com';

// Helper to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Helper to check if MySQL is installed and get connection details
function getMySQLConnectionDetails() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'product_management';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

  return { host, user, password, database, port };
}

// Main setup function
async function main() {
  try {
    console.log('Starting admin user setup...');
    
    // Try to require mysql2 directly
    let mysql;
    try {
      mysql = require('mysql2/promise');
      console.log('Successfully loaded mysql2 module');
    } catch (error) {
      console.error('Failed to load mysql2 module:', error.message);
      console.log('Please ensure mysql2 is installed: npm install mysql2');
      process.exit(1);
    }

    // Get database connection details
    const { host, user, password, database, port } = getMySQLConnectionDetails();
    console.log(`Using database: ${database} at ${host}:${port}`);

    // Create a connection pool
    const pool = mysql.createPool({
      host,
      user,
      password,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
    console.log(`Database ${database} created or already exists`);

    // Use the database
    await connection.query(`USE ${database}`);
    console.log(`Using database: ${database}`);

    // Create users table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    // Hash function for password security
    function hashPassword(password) {
      const crypto = require('crypto');
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return `${salt}:${hash}`;
    }

    // Get admin credentials from environment variables or use defaults
    const adminUsername = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;

    // Check if admin user already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [adminUsername]
    );

    if (existingUsers.length > 0) {
      console.log(`Admin user '${adminUsername}' already exists`);
    } else {
      // Hash the password
      const hashedPassword = hashPassword(adminPassword);

      // Create the admin user
      await connection.query(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [adminUsername, hashedPassword, adminEmail, 'admin']
      );
      console.log(`Admin user '${adminUsername}' created successfully`);
    }

    // Release the connection
    connection.release();
    await pool.end();

    console.log('Admin setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during admin setup:', error);
    process.exit(1);
  }
}

// Run the main function
main();
