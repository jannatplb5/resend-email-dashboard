const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log("Connecting to Supabase PostgreSQL...");
  const client = new Client({
    connectionString: process.env.DB_POSTGRES_URL.split('?')[0],
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Create the email_logs table
    console.log("Creating email_logs table if not exists...");
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS email_logs (
        id TEXT PRIMARY KEY,
        resend_id TEXT,
        direction TEXT,
        to_address TEXT,
        from_address TEXT,
        subject TEXT,
        body TEXT,
        html_content TEXT,
        status TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivered_at TIMESTAMP WITH TIME ZONE,
        opened_at TIMESTAMP WITH TIME ZONE
      );
    `;
    await client.query(createTableQuery);

    console.log("Table setup completed successfully.");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await client.end();
  }
}

setupDatabase();
