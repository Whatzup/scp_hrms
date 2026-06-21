import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

// Helper to parse connection string into Postgres Connection Object options
function getDatabaseConfig() {
  const url = process.env.DATABASE_URL || '';
  
  if (url) {
    try {
      // postgresql://[user]:[password]@[host]:[port]/[database]
      const match = url.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
      if (match) {
        const [, user, password, host, port, database] = match;
        const config: pg.PoolConfig = {
          host,
          user: decodeURIComponent(user),
          password: decodeURIComponent(password),
          database,
          port: port ? parseInt(port, 10) : 5432,
          connectionTimeoutMillis: 15000,
        };
        
        // Neon connections typically require SSL
        if (url.includes('neon.tech') || url.includes('sslmode=require')) {
          config.ssl = { rejectUnauthorized: false };
        }
        
        return config;
      }
    } catch (e) {
      console.error('Failed to parse database connection URL:', e);
    }
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
