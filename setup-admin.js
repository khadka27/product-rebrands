'use strict';

// Require path module for resolving paths
const path = require('path');

// Set NODE_PATH to include the current directory
process.env.NODE_PATH = path.resolve(__dirname);

// Force Node.js to reload the module cache
require('module').Module._initPaths();

// Now we can require our modules
const { createAdminUser, initDatabase } = require('./lib/db');

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
