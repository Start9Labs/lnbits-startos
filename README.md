<p align="center">
  <img src="icon_readme.png" alt="LNbits Logo" width="21%">
</p>

# LNbits on StartOS

> **Upstream docs:** <https://docs.lnbits.org/>
>
> Everything not listed in this document should behave the same as upstream
> LNbits v1.4.2. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

A free and open-source lightning-network wallet/accounts system. See the [upstream repo](https://github.com/lnbits/lnbits) for general LNbits documentation.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property | Value |
|----------|-------|
| Image | Custom Dockerfile based on `lnbits/lnbits:v1.4.2` |
| Architectures | x86_64, aarch64 |
| Entrypoint | `uv run lnbits` |

The custom Dockerfile adds `sqlite3`, `tini`, `yq`, `xxd`, `curl`, `jq`, and `bcrypt` (Python) on top of the upstream image. These are used for the reset password action and other utilities.

## Volume and Data Layout

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `main` | `/app/data` | All LNbits data (database, configuration) |

StartOS-specific files on the `main` volume:

| File | Purpose |
|------|---------|
| `.env` | LNbits environment configuration (managed by StartOS) |
| `store.json` | Not used (no store.json in this package) |

The Lightning node volume is mounted read-only depending on the configured backend:

| Backend | Mount Point | Files Used |
|---------|-------------|------------|
| LND | `/mnt/lnd` | `tls.cert`, `data/chain/bitcoin/mainnet/admin.macaroon` |
| CLN | `/mnt/cln` | `bitcoin/lightning-rpc` (Unix socket) |

## Installation and First-Run Flow

1. On install, StartOS creates a **critical task** prompting the user to select a Lightning implementation (LND or Core Lightning)
2. The `.env` file is written with the selected backend configuration
3. On first start, LNbits creates its SQLite database and presents a web UI for account creation
4. The first user to register becomes the **super user** (admin)

## Configuration Management

LNbits is configured via environment variables in the `.env` file, managed by StartOS.

| StartOS-Managed | Details |
|-----------------|---------|
| Lightning backend | LND (REST) or Core Lightning (Unix socket) |

Most LNbits settings are configurable through the **Admin UI** within LNbits itself (`LNBITS_ADMIN_UI=true`). StartOS manages the backend connection; everything else is configured through the LNbits web interface.

Settings **not** managed by StartOS (hardcoded):

| Setting | Value | Reason |
|---------|-------|--------|
| `HOST` | `lnbits.startos` | StartOS service networking |
| `PORT` | `5000` | Fixed internal port |
| `FORWARDED_ALLOW_IPS` | `*` | Required for HTTPS behind StartOS proxy |
| `LNBITS_DATA_FOLDER` | `./data` | Maps to the mounted volume |
| `LND_REST_ENDPOINT` | `https://lnd.startos:8080/` | StartOS service networking |
| `LND_REST_CERT` / `LND_REST_MACAROON` | Paths in `/mnt/lnd` | Mounted dependency volume |
| `CLIGHTNING_RPC` | `/mnt/cln/bitcoin/lightning-rpc` | Mounted dependency volume |
| `AUTH_ALLOWED_METHODS` | `username-password` | Only username/password auth |
| `LNBITS_ALLOWED_FUNDING_SOURCES` | Matches selected backend | Restricted to configured implementation |

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose |
|-----------|------|----------|---------|
| Web UI | 5000 | HTTP | LNbits web interface and API |

## Actions (StartOS UI)

| Action | Purpose | Availability | Inputs |
|--------|---------|-------------|--------|
| **Lightning Implementation** | Select LND or Core Lightning as the backend | Any | Select: LND or CLN |
| **Reset Password** | Reset the super user password to a random value | Running only | None |

**Warning:** Changing the Lightning implementation after initial use **deletes the LNbits database** (all accounts and wallets). Funds remain on the underlying Lightning node.

## Backups and Restore

**Backed up:** The entire `main` volume (database, `.env` configuration).

**Restore behavior:** Standard restore — the database and configuration are restored as-is. The configured Lightning backend must be available.

## Health Checks

| Check | Method | Messages |
|-------|--------|----------|
| **Web Interface** | Port listening (5000), 75s grace period | Ready: "The web interface is ready" |

## Dependencies

| Dependency | Required | Version | Purpose |
|------------|----------|---------|---------|
| Core Lightning | Optional | `>=25.12:1-beta.1` | Lightning backend (if selected) |
| LND | Optional | `>=0.20.0-beta:1-beta.2` | Lightning backend (if selected) |

One of the two Lightning implementations must be selected and running. The dependency is determined at runtime based on the configured `LNBITS_BACKEND_WALLET_CLASS`.

## Limitations and Differences

1. **Only LND and Core Lightning backends supported** — upstream supports many funding sources (LNPayWallet, OpenNodeWallet, EclairWallet, etc.); StartOS restricts to `LndRestWallet` and `CoreLightningWallet`
2. **SQLite only** — upstream supports PostgreSQL and CockroachDB; StartOS uses the embedded SQLite database
3. **Username/password auth only** — `AUTH_ALLOWED_METHODS` is set to `username-password`; other methods (e.g., Google OAuth) are not available
4. **Switching backends deletes the database** — changing from LND to CLN (or vice versa) removes the existing LNbits database
5. **Custom Docker image** — adds sqlite3 CLI, bcrypt, and other tools not in the upstream image

## What Is Unchanged from Upstream

- All LNbits extensions and the extension marketplace
- Wallet and account management
- Admin UI functionality
- API endpoints
- Invoice and payment handling
- LNURL support
- Theme customization (via Admin UI)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: lnbits
upstream_version: 1.4.2
image: custom Dockerfile (based on lnbits/lnbits:v1.4.2)
architectures: [x86_64, aarch64]
volumes:
  main: /app/data
ports:
  ui: 5000
dependencies:
  - c-lightning (optional, >=25.12:1-beta.1)
  - lnd (optional, >=0.20.0-beta:1-beta.2)
startos_managed_env_vars:
  - LNBITS_BACKEND_WALLET_CLASS
  - LNBITS_ALLOWED_FUNDING_SOURCES
actions:
  - set-lightning-implementation
  - reset-password
health_checks:
  - port_listening: 5000
backup_volumes:
  - main
```
