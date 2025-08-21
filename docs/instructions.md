# LNbits

LNbits core is a powerful wallet accounts system and extendable platform that you can use to create secure sub-wallets sitting on top of a funding source such as LND or CLN (installed separately from the marketplace). This allows you to be an "Uncle Jim" to friends and family or to organize or limit access to funds. Extremely extensible, it can also provide a wide range of other features like connecting bolt cards or ATMs. See also [LNbits.com](https://LNbits.com/).

## Getting Started
### The Lightning Network

Bitcoin's Lightning Network is a second-layer scaling solution designed to enable faster and cheaper transactions on top of the Bitcoin blockchain. It allows users to create off-chain payment channels, which can facilitate multiple transactions without needing to record each one on the main blockchain.

Before installing and using LNbits you should read and understand the extensive documentation for either [LND](https://github.com/Start9Labs/lnd-startos/blob/master/docs/instructions.md) or [CLN](https://github.com/Start9Labs/cln-startos/blob/master/docs/instructions.md), at least one of which you must install prior to using LNbits.


### First Use

You'll need to first select an underlying Lightning Network implementation (see above) prior to starting the service for the first time.

**NOTE:** If the LN implementation is changed after using LNBits this will delete all LNBits accounts and wallets related to the previously configured LN implementation! All LN funds will still be available on the underlying LN implementation.

Once ready, and you start the service and launch the Web UI you will be prompted to set up a *Superuser account*. This is your principle admin account with full rights. As you are the administrator you may use the superuser account as you main account or you can later create additional accounts ranging from admin level to ordinary users. You can reset this password if you forget it in StartOS from `LNbits > Actions > Reset Password`.

### Funding

LNbits sits on top of your chosen Lightning Network funding source, but only has access to the funds you main available to it. This means if you have channels on your LN implementation with a total of 500,000 sats of liquidity on your side, you can add up to that amount on LNbits. You can do this in two ways:-

1. Create an invoice in LNbits and pay yourself from the same wallet that is funding your LNbits instance
2. Manually choose to add funds by clicking on a wallet and then the "Credit/Debit" button.

Adding 1000 sats to a wallet by either means does not alter the balance of the underling Lightning Network implementation. But should you create an invoice in LNbits and pay it from an outside source, again say 1000 sats, your underlying LN implementation would handle the process, liquidity on your LN implementation would increment by 1000 sats and the same 1000 sats would be credited to the LNbits wallet.

**NOTE:** You could spend 100% of your liquidity on your LN implementation through some other integration method and have no funds to spend, yet LNbits and any users would be unaware. LNbits is merely an accounting system on top of your LN implementation. Remember: All wallets are ultimately bound by the capacity of your LN node. If one wallet is allocated 1000 sats but your underlying node only has 900 sats of outbound capacity, payments will simply fail.


## Backups

When your server backs up LNbits, it takes a copy of your settings, your user accounts and their sub-wallets. It does NOT back up and funds, just the accounting for individual users. Actual funds remain on the underlying LN implementation (i.e. LND or CLN).


## Interacting with LNbits and connecting wallets

LNbits wallets can be used as real wallets and have wallet software manage them. This is incredibly useful and powerful, allowing you to safely segregate funds or to only carry access to small amounts of your LN channel capacity in person.

- [Alby Browser Extension](wallet-integrations/alby-extension.md)
- [BlueWallet](wallet-integrations/bluewallet.md)
- [Zeus](wallet-integrations/zeus.md)