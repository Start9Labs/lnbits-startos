<p align="center">
  <img src="icon.svg" alt="LNbits Logo" width="21%">
</p>

# LNbits on StartOS

> Everything not listed in this document should behave the same as upstream
> LNbits. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[LNbits](https://github.com/lnbits/lnbits) is an account system and extension platform built on top of a Lightning node. On StartOS it runs against the LND or Core Lightning already on this server, with the connection to that node managed by the package rather than typed in.

- **Upstream repo:** <https://github.com/lnbits/lnbits>
- **Wrapper repo:** <https://github.com/Start9Labs/lnbits-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The image is upstream's with a handful of command-line tools added, since the package drives LNbits' own database directly for two operations.

| Property      | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| Image         | Built from `Dockerfile`, `FROM lnbits/lnbits`                   |
| Architectures | x86_64, aarch64                                                 |
| Command       | `uv run lnbits`                                                 |
| Subcontainer  | `lnbits-sub` — the `primary` daemon, and the one to `attach` to |

The additions are `sqlite3`, `python3`'s bcrypt, `jq`, `yq`, `xxd`, `curl` and `tini`. A short-lived `reset-pass` subcontainer uses the first two for the password action.

One oneshot, `sync-funding-settings`, runs before the daemon — see [File Models](#file-models).

## Volume and Data Layout

One volume, plus a read-only view of the chosen Lightning node's.

| Volume | Mount Point | Purpose                             |
| ------ | ----------- | ----------------------------------- |
| `main` | `/app/data` | `.env`, and LNbits' SQLite database |

The selected node's data directory is mounted **read-only** — `/mnt/lnd` or `/mnt/cln` — which is how LNbits reads LND's macaroon and TLS certificate, or Core Lightning's RPC socket. No credential is stored in this package.

## File Models

One model, and a second store the package has to reconcile against it.

| File   | Format | Modelled               | Written by                                  |
| ------ | ------ | ---------------------- | ------------------------------------------- |
| `.env` | env    | Yes — `FileHelper.env` | Install, every init, and the backend action |

**Enforced** — rewritten to a fixed value whenever the package writes the file: `PORT`, `FORWARDED_ALLOW_IPS`, `LNBITS_DATA_FOLDER`, the Core Lightning RPC path, and LND's certificate and macaroon paths. Those last three point into the read-only dependency mounts and are not yours to change.

`HOST` is additionally forced to all interfaces on every start, so the server is reachable over the service bridge.

**Derived:** `LND_REST_ENDPOINT` is written by `main` from LND's own binding when LND is the backend. While that address is unresolved the key is **deleted** rather than left stale — LNbits then fails its backend connection honestly instead of dialling something that no longer exists.

**Yours:** everything else the file carries — site title and tagline, themes, the reserve-fee settings, which extensions are disabled, the admin UI toggle. Those are seeded once with LNbits' own values and never re-asserted.

### The database overrides the file, which is why a oneshot exists

With the admin UI enabled, **LNbits persists its funding-source settings in its own database and those values override the `.env` at startup.** On StartOS those paths are not user-configurable — they point at mounted dependency volumes — so the database has to be made to track the file rather than the other way round. The `sync-funding-settings` oneshot rewrites those rows before the daemon starts.

It overwrites rather than deletes them, because LNbits feeds every field of its settings row — defaults included — into its live configuration, so a missing row resolves to a default rather than falling back to the environment. On a fresh install, where no database exists yet, it does nothing at all rather than creating a stray empty one.

The case this exists for: an install carried over from the 0.3.x package keeps the old macaroon path in its database. That path no longer exists, so without this LNbits fails to initialise its backend and **silently falls back to a void wallet** rather than reporting an error.

## Dependencies

One at a time, decided by which backend you chose.

| Backend | Dependency    | Kind      | Health check | Mount                 |
| ------- | ------------- | --------- | ------------ | --------------------- |
| LND     | `lnd`         | `running` | `lnd`        | `/mnt/lnd`, read-only |
| CLN     | `c-lightning` | `running` | `lightningd` | `/mnt/cln`, read-only |

Before a backend is chosen there is no dependency at all, and the package's own configuration records a void wallet.

**With LND, the REST binding does not exist until its wallet is first unlocked.** Until then the endpoint stays unset and LNbits' health check is red; once the binding appears the package heals with one restart, and the address then survives later lock and unlock cycles.

## Network Access and Interfaces

One interface, serving the web UI and LNbits' API. Nothing is exported for dependent services.

| Interface | Id   | Type | Port | Description              |
| --------- | ---- | ---- | ---- | ------------------------ |
| Web UI    | `ui` | ui   | 5000 | The LNbits web interface |

The port is bound on the `main` MultiHost and is not masked.

## Installation and First-Run Flow

Install writes a `.env` configured for a **void wallet** — a deliberate placeholder — and raises a `critical` task to choose a real backend.

The order that matters: install and start LND or Core Lightning first, and with LND, unlock its wallet. Then run [Lightning Implementation](#actions).

The super-user account is created by LNbits itself on first visit, not by this package.

## Actions

Two actions, both user-facing.

### Lightning Implementation

Chooses which Lightning node LNbits uses.

- **What it changes:** the backend class and allowed funding sources in `.env`, and through them the package's dependency and its mount.
- **Cost:** seconds, then a restart.
- **This is destructive when changed.** Switching to a different implementation **deletes LNbits' database**, and with it every LNbits account and wallet created against the previous one. The action does this itself, on the reasoning that those wallets are balances on a node that is no longer connected. **Funds are not lost** — they remain on the underlying Lightning node — but the LNbits accounts holding them do not survive.
- **Repeat safety:** re-selecting the same implementation is a no-op; selecting a different one is the destructive path above.

### Reset Password

Generates a new password for the LNbits super user. Run it when locked out.

- **What it changes:** that account's password hash, written directly into LNbits' database.
- **Availability:** only while the service is running.
- **Repeat safety:** safe to re-run; each run generates a fresh password.
- **Outputs:** the new password, masked and copyable. It is not recoverable afterwards.

## Tasks

One task, raised at install.

| Task                     | Severity   | Raised when | Cleared when    |
| ------------------------ | ---------- | ----------- | --------------- |
| Lightning Implementation | `critical` | At install  | The action runs |

`critical` because until a backend is chosen the configured wallet is a void one — LNbits would run, but no wallet in it could send or receive.

## Health Checks

One check, on the daemon.

| Check                     | Method                 | Grace Period |
| ------------------------- | ---------------------- | ------------ |
| `primary` "Web Interface" | Port 5000 is listening | 75 seconds   |

The grace period covers LNbits' startup, which loads its extensions before binding. A failure after that most often means the Lightning backend could not be reached — LND not running, or its wallet never unlocked so there is no REST address. The service logs distinguish those.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. No dump step and nothing excluded.

- **Included:** `.env` with the backend selection, and LNbits' database with every account, wallet, and extension's data.
- **Not included:** anything belonging to the Lightning node. Channels and funds are that package's backup.
- **Restore:** complete on this side, and no task is raised since the backend selection comes back. The same node must be present — and, for LND, unlocked — before LNbits is usable, and the funding-settings oneshot re-points the restored database at the current mount paths on the first start.

## Limitations and Differences

1. **Changing the Lightning implementation deletes the LNbits database.** Accounts and wallets do not survive the switch; funds on the node do.
2. **The connection to the node is not configurable.** Endpoint, certificate, macaroon, and RPC paths are all managed, and LNbits' own settings for them are overwritten before each start.
3. **With LND, nothing works until its wallet has been unlocked at least once**, because the REST binding does not exist before then.
4. **A void wallet is the install-time default**, which is why the backend task is `critical`.
5. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: lnbits
image: ./Dockerfile # FROM lnbits/lnbits, plus sqlite3/jq/yq/xxd/curl/tini
architectures:
  - x86_64
  - aarch64
subcontainers:
  - lnbits-sub # the running daemon
  - reset-pass # temporary; the Reset Password action
volumes:
  main: /app/data
file_models:
  - /app/data/.env
startos_managed_env_vars: [] # LNbits is configured by its .env, not by container env
dependencies: # exactly one, decided by the chosen backend
  - lnd # /mnt/lnd, read-only
  - c-lightning # /mnt/cln, read-only
interfaces:
  ui: { type: ui, port: 5000 }
actions:
  - set-lightning-implementation # destructive when the backend changes
  - reset-password # only-running
tasks:
  - { action: set-lightning-implementation, severity: critical }
health_checks:
  - primary # the daemon's ready check, displayed "Web Interface"
```
