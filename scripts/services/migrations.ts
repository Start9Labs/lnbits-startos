import { compat, types as T } from "../deps.ts";

export const migration: T.ExpectedExports.migration = compat.migrations
.fromMapping({
    "0.9.7.1": {
        up: compat.migrations.updateConfig(
            (config: any) => {
                return { implementation: config?.wallet.type || 'LndRestWallet' }
            },
            true,
            { version: "0.9.7.1", type: "up" },
        ),
        down: compat.migrations.updateConfig(
            (config: any) => {
                return { wallet: { type: config.implementation || 'LndRestWallet' } };
            },
            true,
            { version: "0.9.7.1", type: "down" },
        ),
  },
},
"0.10",
);
