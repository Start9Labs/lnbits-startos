import { compat, types as T } from "../deps.ts";

export const migration: T.ExpectedExports.migration = compat.migrations
.fromMapping({
    "0.9.7.1": {
        up: compat.migrations.updateConfig(
            (config) => {
                const implementation = config?.wallet.type === 'CLightningWallet' ? 'cln' : 'lnd'
                return { implementation }
            },
            true,
            { version: "0.9.7.1", type: "up" },
        ),
        down: compat.migrations.updateConfig(
            (config) => {
                const implementation = config.implementation === 'cln' ? 'CLightningWallet' : 'LndRestWallet'
                return { wallet: { type: implementation } };
            },
            true,
            { version: "0.9.7.1", type: "down" },
        ),
  },
},
"0.9.7.1",
);
