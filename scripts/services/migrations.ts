import { compat, types as T } from "../deps.ts";

export const migration: T.ExpectedExports.migration =
  compat.migrations.fromMapping(
    {
      "0.9.7.2": {
        up: compat.migrations.updateConfig(
          (config: any) => {
            return { implementation: config?.wallet.type || "LndRestWallet" };
          },
          true,
          { version: "0.9.7.2", type: "up" }
        ),
        down: compat.migrations.updateConfig(
          (config: any) => {
            return {
              wallet: { type: config.implementation || "LndRestWallet" },
            };
          },
          true,
          { version: "0.9.7.2", type: "down" }
        ),
      },
      "1.0.0": {
        up: compat.migrations.updateConfig((config: any) => {
          return config
        }, true, {
          version: "1.0.0",
          type: "up",
        }),
        down: () => {
          throw new Error("Cannot downgrade");
        },
      },
    },
    "1.0.0"
  );
