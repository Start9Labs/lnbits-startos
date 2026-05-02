import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

export const v_1_5_3_2 = VersionInfo.of({
  version: '1.5.3:2',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 1.3.3)',
    es_ES: 'Actualizaciones internas (start-sdk 1.3.3)',
    de_DE: 'Interne Aktualisierungen (start-sdk 1.3.3)',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 1.3.3)',
    fr_FR: 'Mises à jour internes (start-sdk 1.3.3)',
  },
  migrations: {
    up: async ({ effects }) => {
      // get old config.yaml
      const configYaml:
        | {
            implementation: 'LndRestWallet' | 'CLightningWallet'
          }
        | undefined = await sdk.volumes.main
        .readFile('start9/config.yaml', 'utf-8')
        .then((c) => c.toString('utf-8'))
        .then(YAML.parse, () => undefined)

      if (configYaml) {
        const configuredImplementation =
          configYaml.implementation === 'CLightningWallet'
            ? 'CoreLightningWallet'
            : 'LndRestWallet'

        await envFile.merge(effects, {
          LNBITS_BACKEND_WALLET_CLASS: configuredImplementation,
          LNBITS_ALLOWED_FUNDING_SOURCES: configuredImplementation,
        })

        rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      }
    },
    down: IMPOSSIBLE,
  },
})
