import { z } from '@start9labs/start-sdk'
import { access } from 'fs/promises'
import { shape } from './fileModels/env'
import { sdk } from './sdk'
import { db } from './utils'

type Env = z.infer<typeof shape>

// Minimal structural view of a SubContainer's exec surface, so this helper
// doesn't depend on the full SubContainer generic.
type ExecSub = {
  execFail(
    cmd: string[],
    opts?: { env?: Record<string, string> },
  ): Promise<{ stdout: string | Buffer }>
}

/**
 * Force LNbits' stored Lightning-backend connection settings to match the
 * StartOS-managed `.env`.
 *
 * `VoidWallet` returns early, which is what leaves the Admin UI in charge of an
 * external funding source.
 *
 * With `LNBITS_ADMIN_UI=true`, LNbits persists its funding-source settings
 * (backend class, endpoint, cert, macaroon, CLN rpc) into its own SQLite db
 * (`system_settings`, tag `core`). On every startup those DB values OVERRIDE
 * the environment — see lnbits `check_admin_settings` -> `update_cached_settings`.
 * On StartOS these paths are not user-configurable; they point at mounted
 * dependency volumes, so the DB must always track the `.env`.
 *
 * Without this, an install carried over from the legacy (Embassy / StartOS
 * 0.3.x) package keeps the old macaroon path `/mnt/lnd/admin.macaroon` in its
 * database. That path no longer exists under StartOS 0.4.x (the macaroon now
 * lives at `/mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon`), so LNbits
 * fails to initialize the backend and silently falls back to VoidWallet.
 *
 * We OVERWRITE the rows rather than delete them: a missing row resolves to the
 * field default (`None`) at startup, not the env value, because
 * `check_admin_settings` feeds `settings_db.dict()` — every field, defaults
 * included — to `update_cached_settings`. Values are JSON-encoded to match how
 * LNbits reads them (`json.loads`).
 *
 * Idempotent; runs as a oneshot before the primary daemon.
 */
export async function syncFundingSettings(
  subc: ExecSub,
  env: Env | null,
): Promise<void> {
  if (!env) return

  // Fresh install: LNbits hasn't created its database yet, so there is nothing
  // to reconcile — it will seed `system_settings` from the `.env` on first
  // start. Bail before touching the path so sqlite3 doesn't create a stray
  // empty database on the volume.
  try {
    await access(sdk.volumes.main.subpath('database.sqlite3'))
  } catch {
    return
  }

  const upserts: Record<string, string> = {}
  const deletes: string[] = []

  if (env.LNBITS_BACKEND_WALLET_CLASS === 'LndRestWallet') {
    // The endpoint is only known once LND's bridge address resolves; while it's
    // unresolved, leave the stored row alone rather than writing a dead address.
    if (env.LND_REST_ENDPOINT) upserts.lnd_rest_endpoint = env.LND_REST_ENDPOINT
    upserts.lnd_rest_cert = env.LND_REST_CERT
    upserts.lnd_rest_macaroon = env.LND_REST_MACAROON
    // A stale encrypted macaroon would be tried alongside the plain path; clear
    // it so only the StartOS-managed macaroon file is used.
    deletes.push('lnd_rest_macaroon_encrypted')
  } else if (env.LNBITS_BACKEND_WALLET_CLASS === 'CoreLightningWallet') {
    // LNbits reads `corelightning_rpc` first, then `clightning_rpc`; set both.
    upserts.corelightning_rpc = env.CLIGHTNING_RPC
    upserts.clightning_rpc = env.CLIGHTNING_RPC
  } else if (env.LNBITS_BACKEND_WALLET_CLASS === 'EclairWallet') {
    if (env.ECLAIR_URL) upserts.eclair_url = env.ECLAIR_URL
    if (env.ECLAIR_PASS) upserts.eclair_pass = env.ECLAIR_PASS
  } else if (env.LNBITS_BACKEND_WALLET_CLASS === 'PhoenixdWallet') {
    if (env.PHOENIXD_API_ENDPOINT)
      upserts.phoenixd_api_endpoint = env.PHOENIXD_API_ENDPOINT
    if (env.PHOENIXD_API_PASSWORD)
      upserts.phoenixd_api_password = env.PHOENIXD_API_PASSWORD
  } else {
    return
  }

  // The selected backend is itself editable (not a readonly setting), so a
  // stale or admin-UI-edited `lnbits_backend_wallet_class` would override the
  // env and could point LNbits at the unmounted node. Pin it too, so the whole
  // funding configuration is StartOS-owned.
  upserts.lnbits_backend_wallet_class = env.LNBITS_BACKEND_WALLET_CLASS

  // Single-quote escape for SQL string literals (values are fixed mountpoint
  // paths today, but keep this robust against future changes).
  const sqlStr = (s: string) => `'${s.replace(/'/g, "''")}'`

  const statements = [
    ...Object.entries(upserts).map(
      ([id, value]) =>
        `INSERT INTO system_settings (id, value, tag) VALUES (${sqlStr(
          id,
        )}, ${sqlStr(JSON.stringify(value))}, 'core') ` +
        `ON CONFLICT(id, tag) DO UPDATE SET value = excluded.value;`,
    ),
    ...deletes.map(
      (id) =>
        `DELETE FROM system_settings WHERE id = ${sqlStr(id)} AND tag = 'core';`,
    ),
  ].join(' ')

  // Best-effort: this reconcile is an improvement, never a precondition for
  // running. A sqlite failure (locked db, mid-init schema, fs error) must NOT
  // block startup — that would be worse than the bug we're fixing. On failure
  // we log and let LNbits start with whatever is already in its database (the
  // status quo), so this change can only ever help, never regress boot.
  try {
    // The settings table may not exist yet if a previous start died mid-init.
    const tableCheck = await subc.execFail([
      'sqlite3',
      db,
      "SELECT name FROM sqlite_master WHERE type='table' AND name='system_settings';",
    ])
    if (!tableCheck.stdout.toString().trim()) return

    await subc.execFail(['sqlite3', db, statements])
  } catch (e) {
    console.error(
      'sync-funding-settings: could not reconcile LNbits funding settings; starting anyway',
      e,
    )
  }
}
