import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { envFile } from '../../fileModels/env'
import { envDefaults } from '../../utils'
import { load } from 'js-yaml'
import { readFile, rm } from 'fs/promises'

export const v1_3_1_1 = VersionInfo.of({
  version: '1.2.1:1-beta.3',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      await envFile.write(effects, envDefaults)
      try {
        const configYaml = load(
          await readFile(
            '/media/startos/volumes/main/start9/config.yaml',
            'utf8',
          ),
        ) as { implementation: 'LndRestWallet' | 'CLightningWallet' }

        const configuredImplementation =
          configYaml.implementation === 'CLightningWallet'
            ? 'CoreLightningWallet'
            : 'LndRestWallet'

        console.log('configuredImplementation', configuredImplementation)

        await envFile.merge(effects, {
          LNBITS_BACKEND_WALLET_CLASS: configuredImplementation,
          LNBITS_ALLOWED_FUNDING_SOURCES: configuredImplementation,
        })

        rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      } catch {
        console.log('config.yaml not found')
      }
    },
    down: IMPOSSIBLE,
  },
})
