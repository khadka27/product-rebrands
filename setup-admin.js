'use strict';

// Require path module for resolving paths
const path = require('path');
const fs = require('fs');

// Helper to check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Dynamically determine the location of the db.js file
function resolveDbModule() {
  const possiblePaths = [
    // Try direct import first
    './lib/db',
    // Try CommonJS compiled version
    './lib/db.js',
    // Try from project root
    path.join(__dirname, 'lib', 'db'),
    path.join(__dirname, 'lib', 'db.js'),
    // Try from dist directory
    path.join(__dirname, 'dist', 'lib', 'db'),
    path.join(__dirname, 'dist', 'lib', 'db.js')
  ];

  for (const modulePath of possiblePaths) {
    try {
      // Try requiring the module
      const dbModule = require(modulePath);
      console.log(`Successfully loaded database module from: ${modulePath}`);
      return dbModule;
    } catch (error) {
      // Continue to next path if this one fails
      console.log(`Failed to load from ${modulePath}: ${error.code}`);
    }
  }

  throw new Error('Could not find db module in any expected location');
}

// Try to load the database module
let dbModule;
try {
  dbModule = resolveDbModule();
} catch (error) {
  console.error('Failed to load database module:', error.message);
  process.exit(1);
}

const { createAdminUser, initDatabase } = dbModule;

async function setupAdmin() {
  try {
    // Get admin credentials from environment variables or use defaults
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    console.log(`Setting up admin user: ${adminUsername}`);
    
    // Ensure database is initialized first
    await initDatabase();
    
    // Create admin user
    await createAdminUser(adminUsername, adminPassword, adminEmail);
    
    console.log('Admin user setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdmin();
