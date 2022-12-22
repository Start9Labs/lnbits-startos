// To utilize the default config system built, this file is required. It defines the *structure* of the configuration file. These structured options display as changeable UI elements within the "Config" section of the service details page in the Embassy UI.

import { compat, types as T } from "../deps.ts";

export const getConfig: T.ExpectedExports.getConfig = compat.getConfig({
  "tor-address": {
    "name": "Tor Address",
    "description": "The Tor address of the network interface",
    "type": "pointer",
    "subtype": "package",
    "package-id": "lnbits",
    "target": "tor-address",
    "interface": "main",
  },
  "lan-address": {
    "name": "LAN Address",
    "description": "The LAN address of the network interface",
    "type": "pointer",
    "subtype": "package",
    "package-id": "lnbits",
    "target": "lan-address",
    "interface": "main",
  },
  "wallet": {
    "type": "union",
    "name": "Lightning Implementation",
    "description": "LNBits Lightning Implementation",
    "tag": {
        "id": "type",
        "name": "Select Lightning Node",
        "variant-names": {
            "LndRestWallet": "Lightning Network Daemon",
            "CLightningWallet": "Core Lightning",
        },
        "description":
            "The LN node to connect to",
        },
    "default": "LndRestWallet",
    "variants": {
      "LndRestWallet": {},
      "CLightningWallet":{},
    }
  }
});
