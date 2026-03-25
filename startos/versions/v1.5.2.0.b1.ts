import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

export const v_1_5_2_0_b1 = VersionInfo.of({
  version: '1.5.2:0-beta.1',
  releaseNotes: {
    en_US: 'Update LNbits to v1.5.2',
    es_ES: 'Actualización de LNbits a v1.5.2',
    de_DE: 'Update von LNbits auf v1.5.2',
    pl_PL: 'Aktualizacja LNbits do v1.5.2',
    fr_FR: 'Mise à jour de LNbits vers v1.5.2',
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
