# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `lnbits`.** LNbits needs a Lightning backend, chosen by the `set-lightning-implementation` action: **LND** (REST) or **Core Lightning** (Unix socket). Both are optional dependencies; the mount and dependency declaration switch on `LNBITS_BACKEND_WALLET_CLASS` in the `.env`.
- **LND's REST endpoint is reached over the LXC bridge**, not `.startos` DNS. `main.ts` resolves it through `sdk.host.getBridgeAddress` against LND's `control` host on `restPort`, importing `controlHostId`/`restPort` from `lnd-startos/startos/interfaces` — treat those as a small API (if LND renames them, update here). The helper's `.const()` reads the binding's derived bridge address — never `net.assignedPort`/`assignedSslPort`, which are raw metadata whose population depends on whether the dependency terminates its own TLS or hands the port to the OS proxy (LND does the latter for REST, which leaves `assignedPort` null). Pass `ssl: true` for LND's REST binding; that holds under either arrangement. The address persists across LND lock/unlock, so main resolves it once LND is installed and first unlocked (one healing restart), then stays stable and never restarts on LND update/lock churn; while the address is unresolved (LND absent or not yet unlocked) the endpoint is left unset, so LNbits fails its backend connection into a red health check rather than dialing a fabricated address. CLN is instead reached through a mounted Unix socket (`/mnt/cln/bitcoin/lightning-rpc`), so it needs no bridge lookup. `HOST` binds `0.0.0.0`.
- **`sync-funding-settings` oneshot** rewrites LNbits' saved funding-source settings in its own SQLite DB to match the StartOS-managed `.env` on every start (LNbits' Admin UI otherwise lets the DB override the env). See `startos/syncFundingSettings.ts`.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach lnbits -n lnbits-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `lnbits-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
