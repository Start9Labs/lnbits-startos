# LNbits

## Documentation

- [Start9 Bitcoin Guides](https://docs.start9.com/bitcoin-guides/) — connecting wallets and dashboards to a Lightning node on StartOS.
- [LNbits documentation](https://docs.lnbits.org/) — the upstream user and operator guide, including the API reference and extension catalogue.

## What you get on StartOS

- A **Web UI** interface running LNbits, the wallet and accounts system itself plus its built-in admin panel and API.
- An LNbits instance backed by **your own Lightning node** — LND, Core Lightning or phoenixd on this server, mounted read-only as the funding source and wired up for you.
- The option to point LNbits somewhere else entirely, and configure that yourself from its Admin UI.
- Local SQLite storage on the `main` volume — no separate database to provision.

## Getting set up

LNbits posts a critical task after install. You can't start the service until it's done.

1. Install **LND**, **Core Lightning** or **phoenixd** first and wait for it to be running and synced. With LND, unlock its wallet at least once — LNbits cannot reach it before that.
2. Run the **Lightning Implementation** task and pick the node you installed. LNbits records the choice in its environment and starts depending on that node.
3. Start LNbits. Open the **Web UI** interface, then create an account through the LNbits sign-up screen. **The first account you create becomes the super user** (admin) — do this from a trusted device and save the credentials somewhere safe.

Not using a node on this server? Pick **None / External** at step 2 instead, skip step 1, and set the funding source up yourself from the Admin UI once you've made the super user account.

## Using LNbits

### Web UI

Day-to-day use happens inside the LNbits Web UI: create wallets, share or invite users to them, send and receive Lightning payments, and install LNbits extensions from the built-in marketplace. The super user manages global settings and other accounts from LNbits' own **Admin UI**, reached from inside the Web UI once you're signed in as that account.

> One exception: when you've picked a node on this server, the **funding source connection** (the node endpoint, certificate, and macaroon under the Admin UI's "Funding" page) is managed by StartOS and re-applied every time the service starts. You don't need to set it, and any change you make there will revert on the next restart. Use the **Lightning Implementation** action to choose your backend instead.

### Using an external funding source

Choosing **None / External** hands the "Funding" page back to you. LNbits' own list of backends opens up there — a node running somewhere other than this server, a phone-friendly service over Nostr Wallet Connect, a third-party custodial account, or the fake wallet for testing — and StartOS stops managing the connection.

What that means in practice:

- **Whatever you pick is yours to run and keep working.** StartOS has no dependency on it, cannot check it, and cannot tell you when it breaks — LNbits will simply fall back to a void wallet, where nothing can send or receive.
- **A custodial service holds your money.** Alby, ZBD, OpenNode, Strike and the like are third parties with your funds; the sovereignty you get from a node on this server does not apply to them.
- **Changing the backend inside the Admin UI does not clear the database.** Wallet balances belong to the node that held them, so after a switch LNbits will show balances it cannot actually spend. Start clean instead.
- **A node using a self-signed certificate cannot be reached.** LNbits needs to trust the certificate, and there is nowhere to put one here — the node needs a publicly issued certificate, or one of the connection methods that doesn't use one.

### Actions

- **Lightning Implementation** — choose which node funds LNbits: LND, Core Lightning or phoenixd on this server, or None / External. **Changing this after LNbits has been used wipes the LNbits database**, removing every account and wallet stored on this instance. Funds on the underlying Lightning node are unaffected, but anything that lived only in LNbits (extension data, internal wallets, invoices) is gone. Only use this when you really mean to start over.
- **Reset Password** — generates a new random password for the super user and returns it once, masked and copyable. Use it if you've lost the super user password.

## Limitations

- **Three Lightning nodes are supported as managed funding backends.** LND, Core Lightning and phoenixd are the ones StartOS packages and can wire up for you. Everything else upstream LNbits supports is reachable only through **None / External**, where the connection is yours to configure and maintain.
- **SQLite only.** Upstream supports PostgreSQL and CockroachDB as alternative databases; the StartOS package uses the embedded SQLite database and does not expose that switch.
- **Username and password sign-in only.** Other LNbits auth methods (Google OAuth, etc.) are disabled in this package.
- **With a node on this server, the connection is managed by StartOS.** The funding source endpoint, certificate, macaroon and password are set for you and re-applied on every start, so editing them in the LNbits Admin UI has no lasting effect. Only **None / External** lifts this.
