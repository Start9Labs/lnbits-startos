# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **It must overwrite the rows, never delete them.** `check_admin_settings` passes every field of `settings_db.dict()` — defaults included — into the live config, so a missing row resolves to `None` rather than falling back to the env value.
- **It must bail before touching the path when no database exists.** Otherwise `sqlite3` creates a stray empty database on the volume during a fresh install.
- **`LND_REST_ENDPOINT` is deleted, not left stale, when LND's address is unresolved.** That binding only appears at LND's first wallet unlock; a stale or fabricated endpoint makes LNbits dial something that does not exist instead of failing its health check honestly.
- **The implementation action deletes the database on a real change, and that is intended.** Wallets are balances against a specific node; carrying them across backends would show funds that are not reachable. Don't soften it into a merge — but don't let it fire when the selection is unchanged either.
- **`HOST` is forced to `0.0.0.0` in `main`, not just seeded**, because the service is reached over the bridge.
