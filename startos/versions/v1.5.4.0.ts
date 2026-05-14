import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

export const v_1_5_4_0 = VersionInfo.of({
  version: '1.5.4:0',
  releaseNotes: {
    en_US: `**Bumps**

- LNbits → 1.5.4
- start-sdk → 1.5.0`,
    es_ES: `**Actualizaciones**

- LNbits → 1.5.4
- start-sdk → 1.5.0`,
    de_DE: `**Aktualisierungen**

- LNbits → 1.5.4
- start-sdk → 1.5.0`,
    pl_PL: `**Aktualizacje**

- LNbits → 1.5.4
- start-sdk → 1.5.0`,
    fr_FR: `**Mises à jour**

- LNbits → 1.5.4
- start-sdk → 1.5.0`,
  },
  migrations: {
    up: async ({ effects }) => {
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
