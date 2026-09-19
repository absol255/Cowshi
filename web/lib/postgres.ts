import type { Pool, PoolClient } from "pg";
import { createSeed } from "./seed";
import type { Admin, Store, User } from "./types";

// Postgres persistence
// --------------------
// Bettors and admins live in real tables that match models.py:
//   users  (id, username, macho_bucks, created_at, bank_account_number)   <- models.User
//   admins (id, username, password_hash)                                  <- models.Admin
// If those tables already exist (for example created by the Flask app) they are used as they are.
// Everything else (events, markets, orders, positions, trades) is kept as one JSON document in
// the cowshi_state table. Each save is one transaction: it checks the document's version, then
// writes the document and any changed users/admins together, so they can't drift apart.

export type Snapshot = { store: Store; version: number };

export interface Backend {
  load(): Promise<Snapshot>;
  /** `prev` is the store as it was loaded. Returns false when someone else saved first. */
  save(next: Store, prev: Store, expectedVersion: number): Promise<boolean>;
}

const HOUSE = "market_maker";
const round2 = (n: number) => Math.round(n * 100) / 100;

type Doc = Omit<Store, "users" | "admins">;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id BIGSERIAL PRIMARY KEY,
     username VARCHAR(64) NOT NULL,
     macho_bucks NUMERIC NOT NULL DEFAULT 0,
     created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'utc'),
     bank_account_number BIGINT DEFAULT 999
   )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username)",
  `CREATE TABLE IF NOT EXISTS admins (
     id BIGSERIAL PRIMARY KEY,
     username VARCHAR(64) NOT NULL,
     password_hash VARCHAR(256) NOT NULL,
     CONSTRAINT admins_username_key UNIQUE (username)
   )`,
  `CREATE TABLE IF NOT EXISTS cowshi_state (
     id integer PRIMARY KEY,
     version bigint NOT NULL DEFAULT 0,
     data jsonb NOT NULL
   )`,
];

export function normalizeDatabaseUrl(raw: string): string {
  let url = raw.startsWith("postgres://") ? `postgresql://${raw.slice("postgres://".length)}` : raw;
  // TLS is configured on the pool, so drop sslmode to avoid differences between driver versions.
  url = url.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
  return url;
}

function userFromRow(r: Record<string, unknown>): User {
  return {
    id: Number(r.id),
    username: String(r.username),
    macho_bucks: Number(r.macho_bucks),
    // models.User defaults this to 999 when it wasn't set.
    bank_account_number: r.bank_account_number === null ? 999 : Number(r.bank_account_number),
    created_at: r.created_at ? String(r.created_at) : new Date().toISOString(),
  };
}

const USER_COLUMNS = `id::text AS id, username, macho_bucks::float8 AS macho_bucks,
  to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at, bank_account_number::text AS bank_account_number`;

async function inTransaction<T>(pool: Pool, isolation: string, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(`BEGIN ISOLATION LEVEL ${isolation}`);
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export function postgresBackend(rawUrl: string): Backend {
  const url = normalizeDatabaseUrl(rawUrl);
  const local = /localhost|127\.0\.0\.1/.test(url);
  let ready: Promise<Pool> | undefined;

  const getPool = (): Promise<Pool> => {
    ready ??= (async () => {
      const { Pool } = await import("pg");
      // Set DATABASE_SSL=no-verify only if your provider uses a certificate Node can't verify.
      const ssl = local ? undefined : process.env.DATABASE_SSL === "no-verify" ? { rejectUnauthorized: false } : true;
      const pool = new Pool({ connectionString: url, max: 1, ssl });
      for (const statement of SCHEMA) await pool.query(statement);
      return pool;
    })().catch((error) => {
      ready = undefined; // try again on the next request instead of caching the failure
      throw error;
    });
    return ready;
  };

  /** One consistent read of the document plus both account tables. Null when it isn't set up yet. */
  const readAll = async (pool: Pool): Promise<Snapshot | null> =>
    inTransaction(pool, "REPEATABLE READ READ ONLY", async (c) => {
      const doc = await c.query("SELECT version, data FROM cowshi_state WHERE id = 1");
      const users = await c.query(`SELECT ${USER_COLUMNS} FROM users ORDER BY id`);
      const admins = await c.query("SELECT id::text AS id, username, password_hash FROM admins ORDER BY id");
      const row = doc.rows[0] as { version: string; data: Doc } | undefined;
      const house = users.rows.some((r: { username: string }) => r.username === HOUSE);
      if (!row || !house) return null;
      const store: Store = {
        next_id: row.data.next_id ?? 0,
        events: row.data.events ?? [],
        markets: row.data.markets ?? [],
        orders: row.data.orders ?? [],
        positions: row.data.positions ?? [],
        trades: row.data.trades ?? [],
        users: users.rows.map(userFromRow),
        admins: admins.rows.map(
          (r: Record<string, unknown>): Admin => ({
            id: Number(r.id),
            username: String(r.username),
            password_hash: String(r.password_hash),
          }),
        ),
      };
      return { store, version: Number(row.version) };
    });

  /** First-run setup. Existing users and admins are never touched. */
  const initialise = async (pool: Pool) => {
    const seed = createSeed();
    const seedHouse = seed.users.find((u) => u.username === HOUSE)!;
    await inTransaction(pool, "READ COMMITTED", async (c) => {
      await c.query(
        `INSERT INTO users (id, username, macho_bucks, created_at, bank_account_number)
         SELECT COALESCE(MAX(id), 0) + 1, $1::varchar, $2::numeric, $3::timestamp, $4::bigint FROM users
         ON CONFLICT (username) DO NOTHING`,
        [HOUSE, seedHouse.macho_bucks, seedHouse.created_at, seedHouse.bank_account_number],
      );
      const hasDoc = (await c.query("SELECT 1 FROM cowshi_state WHERE id = 1")).rowCount === 1;
      if (!hasDoc) {
        const bettors = (await c.query("SELECT COUNT(*)::int AS n FROM users WHERE username <> $1", [HOUSE])).rows[0].n;
        if (bettors === 0) {
          for (const u of seed.users.filter((x) => x.username !== HOUSE)) {
            await c.query(
              `INSERT INTO users (id, username, macho_bucks, created_at, bank_account_number)
               SELECT COALESCE(MAX(id), 0) + 1, $1::varchar, $2::numeric, $3::timestamp, $4::bigint FROM users`,
              [u.username, u.macho_bucks, u.created_at, u.bank_account_number],
            );
          }
        }
        const admins = (await c.query("SELECT COUNT(*)::int AS n FROM admins")).rows[0].n;
        if (admins === 0) {
          const a = seed.admins[0];
          await c.query(
            `INSERT INTO admins (id, username, password_hash)
             SELECT COALESCE(MAX(id), 0) + 1, $1::varchar, $2::varchar FROM admins`,
            [a.username, a.password_hash],
          );
        }
        const houseId = Number((await c.query("SELECT id::text AS id FROM users WHERE username = $1", [HOUSE])).rows[0].id);
        const withDemo = process.env.SEED_DEMO_MARKETS !== "false";
        const doc: Doc = withDemo
          ? {
              next_id: seed.next_id,
              events: seed.events,
              markets: seed.markets,
              orders: seed.orders.map((o) => (o.user_id === seedHouse.id ? { ...o, user_id: houseId } : o)),
              positions: [],
              trades: [],
            }
          : { next_id: 0, events: [], markets: [], orders: [], positions: [], trades: [] };
        await c.query(
          "INSERT INTO cowshi_state (id, version, data) VALUES (1, 0, $1::jsonb) ON CONFLICT (id) DO NOTHING",
          [JSON.stringify(doc)],
        );
      }
      await syncSequences(c);
    });
  };

  return {
    async load() {
      const pool = await getPool();
      for (let attempt = 0; attempt < 3; attempt++) {
        const snapshot = await readAll(pool);
        if (snapshot) return snapshot;
        // Another instance may be setting up at the same moment; if so it wins and we just re-read.
        await initialise(pool).catch(() => undefined);
      }
      throw new Error("Could not set up the Cowshi database tables");
    },

    async save(next, prev, expectedVersion) {
      const pool = await getPool();
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { users: _users, admins: _admins, ...doc } = next;
        void _users;
        void _admins;
        const bumped = await client.query(
          "UPDATE cowshi_state SET data = $1::jsonb, version = version + 1 WHERE id = 1 AND version = $2",
          [JSON.stringify(doc), expectedVersion],
        );
        if (bumped.rowCount !== 1) {
          await client.query("ROLLBACK");
          return false;
        }

        const before = new Map(prev.users.map((u) => [u.id, u]));
        for (const u of next.users) {
          const old = before.get(u.id);
          if (!old) {
            await client.query(
              `INSERT INTO users (id, username, macho_bucks, created_at, bank_account_number)
               VALUES ($1, $2, $3, $4, $5)`,
              [u.id, u.username, round2(u.macho_bucks), u.created_at, u.bank_account_number],
            );
          } else if (old.macho_bucks !== u.macho_bucks || old.bank_account_number !== u.bank_account_number) {
            await client.query("UPDATE users SET macho_bucks = $2, bank_account_number = $3 WHERE id = $1", [
              u.id,
              round2(u.macho_bucks),
              u.bank_account_number,
            ]);
          }
        }

        const beforeAdmins = new Map(prev.admins.map((a) => [a.id, a]));
        for (const a of next.admins) {
          const old = beforeAdmins.get(a.id);
          if (!old) {
            await client.query("INSERT INTO admins (id, username, password_hash) VALUES ($1, $2, $3)", [
              a.id,
              a.username,
              a.password_hash,
            ]);
          } else if (old.password_hash !== a.password_hash) {
            await client.query("UPDATE admins SET password_hash = $2 WHERE id = $1", [a.id, a.password_hash]);
          }
        }

        await syncSequences(client);
        await client.query("COMMIT");
        return true;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        // A duplicate username means someone else added it first; retry on fresh data.
        if ((error as { code?: string }).code === "23505") return false;
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

/** Keep the id sequences ahead of the ids we insert, so the Flask side can keep inserting too. */
async function syncSequences(c: PoolClient) {
  for (const table of ["users", "admins"]) {
    await c.query(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM ${table}), 1))
       WHERE pg_get_serial_sequence('${table}', 'id') IS NOT NULL`,
    );
  }
}
