import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
import mysql from "mysql2/promise";

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;
const isMysql = process.env.USE_MYSQL === "true";

let pool;

if (!isMysql) {
  const pgConfig = connectionString
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.SUPABASE_HOST || process.env.DB_HOST || "aws-0-eu-west-1.pooler.supabase.com",
        port: Number(process.env.SUPABASE_PORT || process.env.DB_PORT || 6543),
        database: process.env.SUPABASE_DB || process.env.DB_NAME || "postgres",
        user: process.env.SUPABASE_USER || process.env.DB_USER || "postgres.ubvenobxalkbwmmmsgnk",
        password: process.env.SUPABASE_PASSWORD || process.env.DB_PASSWORD || "Alamir@wow1",
        ssl: { rejectUnauthorized: false },
      };

  const pgPool = new pg.Pool(pgConfig);

  async function executePgQuery(sql, params = [], clientObj = pgPool) {
    let paramIndex = 1;
    // Replace MySQL ? placeholders with PostgreSQL $1, $2, $3...
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const result = await clientObj.query(pgSql, params);

    const rows = result.rows;
    // Add insertId & affectedRows metadata for compatibility with mysql2 response format
    rows.insertId = result.rows[0]?.id || null;
    rows.affectedRows = result.rowCount || 0;

    return [rows, result.fields];
  }

  pool = {
    async execute(sql, params = []) {
      return executePgQuery(sql, params, pgPool);
    },
    async query(sql, params = []) {
      return executePgQuery(sql, params, pgPool);
    },
    async getConnection() {
      const client = await pgPool.connect();
      return {
        async execute(sql, params = []) {
          return executePgQuery(sql, params, client);
        },
        async query(sql, params = []) {
          return executePgQuery(sql, params, client);
        },
        async beginTransaction() {
          await client.query("BEGIN");
        },
        async commit() {
          await client.query("COMMIT");
        },
        async rollback() {
          await client.query("ROLLBACK");
        },
        release() {
          client.release();
        },
      };
    },
  };

  pgPool
    .connect()
    .then((client) => {
      console.log("Connected to PostgreSQL (Supabase)!");
      client.release();
    })
    .catch((err) => {
      console.error("PostgreSQL database connection error:", err.message);
    });

} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "menu_website",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  pool
    .getConnection()
    .then((conn) => {
      console.log("Connected to MySQL!");
      conn.release();
    })
    .catch((err) => {
      console.error("Database connection error", err.stack);
    });
}

export default pool;
