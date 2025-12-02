import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { envFile } from '../fileModels/env'
import { envDefaults } from '../utils'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    await envFile.write(effects, {
      ...envDefaults,
      LNBITS_BACKEND_WALLET_CLASS: 'VoidWallet',
    })
  },
})
