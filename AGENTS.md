# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **It must overwrite the rows, never delete them.** `check_admin_settings` passes every field of `settings_db.dict()` — defaults included — into the live config, so a missing row resolves to `None` rather than falling back to the env value.
- **It must bail before touching the path when no database exists.** Otherwise `sqlite3` creates a stray empty database on the volume during a fresh install.
- **`LND_REST_ENDPOINT` is deleted, not left stale, when LND's address is unresolved.** That binding only appears at LND's first wallet unlock; a stale or fabricated endpoint makes LNbits dial something that does not exist instead of failing its health check honestly.
- **The implementation action deletes the database on a real change, and that is intended.** Wallets are balances against a specific node; carrying them across backends would show funds that are not reachable. Don't soften it into a merge — but don't let it fire when the selection is unchanged either.
- **`HOST` is forced to `0.0.0.0` in `main`, not just seeded**, because the service is reached over the bridge.
