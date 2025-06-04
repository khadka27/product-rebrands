import pool, { createAdminUser } from './lib/db';

// Function to list all users in the database
async function listUsers() {
  try {
    const connection = await pool.getConnection();
    
    try {
      console.log('Listing all users in the database:');
      const [rows] = await connection.query<any[]>('SELECT id, username, email, role, created_at FROM users');
      
      if (rows.length === 0) {
        console.log('No users found in the database');
      } else {
        console.table(rows);
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

// Function to test user creation and listing
async function testUserManagement() {
  try {
    console.log('Testing user management...');
    
    // Create admin user if it doesn't exist
    await createAdminUser();
    
    // List all users
    await listUsers();
    
    console.log('User management test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during user management test:', error);
    process.exit(1);
  }
}

// Run the test
testUserManagement();
