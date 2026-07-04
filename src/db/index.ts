import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

// Helper to parse connection string into Postgres Connection Object options
function getDatabaseConfig() {
  const url = process.env.NEON_DATABASE_URL || 
              process.env.DATABASE_URL || 
              process.env.POSTGRES_URL || 
              process.env.POSTGRES_PRISMA_URL || 
              '';
  
  if (url) {
    const config: pg.PoolConfig = {
      connectionString: url,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 15000,
      max: process.env.VERCEL ? 1 : 10,
    };
    
    // Neon connections typically require SSL
    if (url.includes('neon.tech') || url.includes('sslmode=require')) {
      config.ssl = { rejectUnauthorized: false };
    }
    
    return config;
  }

  // Fallback to standard environment variable objects
  const host = process.env.SQL_HOST || process.env.PGHOST || 'localhost';
  const user = process.env.SQL_USER || process.env.PGUSER;
  const password = process.env.SQL_PASSWORD || process.env.PGPASSWORD;
  const database = process.env.SQL_DB_NAME || process.env.PGDATABASE;
  const port = parseInt(process.env.PGPORT || '5432', 10);

  const config: pg.PoolConfig = {
    host,
    user,
    password,
    database,
    port,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 15000,
    max: process.env.VERCEL ? 1 : 10,
  };

  if (host.includes('neon.tech')) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

const poolConfig = getDatabaseConfig();

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL pool client:', err);
});

export const db = drizzle(pool, { schema });
