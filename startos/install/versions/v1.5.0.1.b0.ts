import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { envFile } from '../../fileModels/env'
import { sdk } from '../../sdk'

export const v_1_5_0_1_b0 = VersionInfo.of({
  version: '1.5.0:1-beta.0',
  releaseNotes: {
    en_US: 'Update to StartOS SDK beta.59',
    es_ES: 'Actualización a StartOS SDK beta.59',
    de_DE: 'Update auf StartOS SDK beta.59',
    pl_PL: 'Aktualizacja do StartOS SDK beta.59',
    fr_FR: 'Mise à jour vers StartOS SDK beta.59',
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
