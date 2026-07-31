import fs from "fs";
import path from "path";
import fileURLToPath from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

async function runSupabaseSetup() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;
  const host = process.env.SUPABASE_HOST || process.env.DB_HOST || "db.ubvenobxalkbwmmmsgnk.supabase.co";
  const port = process.env.SUPABASE_PORT || process.env.DB_PORT || 5432;
  const database = process.env.SUPABASE_DB || process.env.DB_NAME || "postgres";
  const user = process.env.SUPABASE_USER || process.env.DB_USER || "postgres";
  const password = process.env.SUPABASE_PASSWORD || process.env.DB_PASSWORD;

  let clientConfig;

  if (connectionString) {
    clientConfig = {
      connectionString,
      ssl: { rejectUnauthorized: false }
    };
  } else {
    if (!password) {
      console.error("❌ ERROR: Database password is required.");
      console.log("Please set SUPABASE_PASSWORD in your .env file.");
      process.exit(1);
    }
    clientConfig = {
      host,
      port: Number(port),
      database,
      user,
      password,
      ssl: { rejectUnauthorized: false }
    };
  }

  const client = new Client(clientConfig);

  try {
    console.log(`Connecting to Supabase PostgreSQL...`);
    await client.connect();
    console.log("✅ Successfully connected to Supabase!");

    const schemaPath = path.join(process.cwd(), "supabase_schema.sql");
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("Running schema & seed queries...");
    await client.query(sql);
    console.log("🚀 All tables and seed data created successfully on Supabase!");
  } catch (err) {
    console.error("❌ Database setup error:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

runSupabaseSetup();
