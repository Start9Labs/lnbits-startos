import { envFile } from './fileModels/env'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const configuredLnImplementation = await envFile
    .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
    .const(effects)

  if (configuredLnImplementation === 'LndRestWallet') {
    return {
      lnd: {
        healthChecks: ['primary'],
        kind: 'running',
        versionRange: '>=0.19.2-beta:1-beta.1',
      },
    }
  } else if (configuredLnImplementation === 'CoreLightningWallet') {
    return {
      'c-lightning': {
        healthChecks: ['lightningd'],
        kind: 'running',
        versionRange: '>=25.5.0:1-alpha.1',
      },
    }
  }
  return {}
})
