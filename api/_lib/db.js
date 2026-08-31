const { Pool } = require('pg');

let pool;
let schemaReady;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL nao configurada');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL_DISABLED === 'true' ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 3),
    });
  }
  return pool;
}

async function query(text, params) {
  await ensureSchema();
  return getPool().query(text, params);
}

async function ensureSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const db = getPool();
    await db.query(`
      CREATE TABLE IF NOT EXISTS mp_tokens (
        id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        access_token text NOT NULL,
        refresh_token text,
        token_type text,
        scope text,
        user_id text,
        public_key text,
        live_mode boolean,
        expires_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS mp_oauth_states (
        state text PRIMARY KEY,
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY,
        preference_id text,
        status text NOT NULL DEFAULT 'created',
        total numeric(12,2) NOT NULL,
        currency text NOT NULL DEFAULT 'BRL',
        buyer jsonb NOT NULL,
        address jsonb NOT NULL,
        shipping jsonb NOT NULL,
        payment jsonb,
        mp_payment_id text,
        init_point text,
        sandbox_init_point text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        artwork_code text NOT NULL,
        title text NOT NULL,
        price numeric(12,2) NOT NULL,
        image text,
        quantity integer NOT NULL DEFAULT 1,
        PRIMARY KEY (order_id, artwork_code)
      );

      CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_order_items_artwork ON order_items(artwork_code);
    `);
  })();
  try {
    return await schemaReady;
  } catch (err) {
    schemaReady = null;
    throw err;
  }
}

module.exports = { query, ensureSchema, getPool };
