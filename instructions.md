# LNbits

## Documentation

- [LNbits documentation](https://docs.lnbits.org/) — the upstream user and operator guide, including the API reference and extension catalogue.

## What you get on StartOS

- A **Web UI** interface running LNbits, the wallet and accounts system itself plus its built-in admin panel and API.
- An LNbits instance backed by **your own Lightning node** — either LND or Core Lightning, mounted read-only as the funding source.
- Local SQLite storage on the `main` volume — no separate database to provision.

## Getting set up

LNbits posts a critical task after install. You can't start the service until it's done.

1. Install either **LND** or **Core Lightning** first and wait for it to be running and synced. LNbits needs one of them as its funding backend.
2. Run the **Lightning Implementation** task and pick the backend you installed. LNbits records the choice in its environment and starts depending on that node.
3. Start LNbits. Open the **Web UI** interface, then create an account through the LNbits sign-up screen. **The first account you create becomes the super user** (admin) — do this from a trusted device and save the credentials somewhere safe.

## Using LNbits

### Web UI

Day-to-day use happens inside the LNbits Web UI: create wallets, share or invite users to them, send and receive Lightning payments, and install LNbits extensions from the built-in marketplace. The super user manages global settings and other accounts from LNbits' own **Admin UI**, reached from inside the Web UI once you're signed in as that account.

### Actions

- **Lightning Implementation** — switch the funding backend between LND and Core Lightning. **Changing the backend after LNbits has been used wipes the LNbits database**, removing every account and wallet stored on this instance. Funds on the underlying Lightning node are unaffected, but anything that lived only in LNbits (extension data, internal wallets, invoices) is gone. Only use this when you really mean to start over.
- **Reset Password** — generates a new random password for the super user and returns it once, masked and copyable. Use it if you've lost the super user password.

## Limitations

- **Only LND and Core Lightning are supported as funding backends.** Upstream LNbits ships many more (OpenNode, Eclair, LNPay, etc.); on StartOS the choice is restricted to the two Lightning nodes the platform packages.
- **SQLite only.** Upstream supports PostgreSQL and CockroachDB as alternative databases; the StartOS package uses the embedded SQLite database and does not expose that switch.
- **Username and password sign-in only.** Other LNbits auth methods (Google OAuth, etc.) are disabled in this package.
