import { envFile } from './fileModels/env'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const configuredLnImplementation = await envFile
    .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
    .const(effects)

  if (configuredLnImplementation === 'LndRestWallet') {
    return {
      lnd: {
        kind: 'running',
        versionRange: '>=0.20.0-beta:2-beta.0',
        healthChecks: ['lnd'],
      },
    }
  } else if (configuredLnImplementation === 'CoreLightningWallet') {
    return {
      'c-lightning': {
        healthChecks: ['lightningd'],
        kind: 'running',
        versionRange: '>=25.12.1:2-beta.0',
      },
    }
  }
  return {}
})
