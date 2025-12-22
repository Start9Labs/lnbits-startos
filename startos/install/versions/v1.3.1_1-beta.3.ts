import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { envFile } from '../../fileModels/env'
import { envDefaults } from '../../utils'
import { load } from 'js-yaml'
import { readFile, rm } from 'fs/promises'

export const v1_3_1_1 = VersionInfo.of({
  version: '1.3.1:1-beta.3',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      const raw = await readFile(
        '/media/startos/volumes/main/start9/config.yaml',
        'utf8',
      ).catch(console.log)

      if (raw) {
        const configYaml = load(raw) as {
          implementation: 'LndRestWallet' | 'CLightningWallet'
        }

        const configuredImplementation =
          configYaml.implementation === 'CLightningWallet'
            ? 'CoreLightningWallet'
            : 'LndRestWallet'

        await envFile.write(effects, {
          ...envDefaults,
          LNBITS_BACKEND_WALLET_CLASS: configuredImplementation,
          LNBITS_ALLOWED_FUNDING_SOURCES: configuredImplementation,
        })
      }

      rm('/media/startos/volumes/main/start9', {
        recursive: true,
      }).catch(console.error)
    },
    down: IMPOSSIBLE,
  },
})
