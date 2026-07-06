import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '1.5.4:2',
  releaseNotes: {
    en_US:
      'Internal updates (start-sdk 2.0.x); LNbits now starts even while LND is still starting or locked and reconnects to it automatically instead of failing to start',
    es_ES:
      'Actualizaciones internas (start-sdk 2.0.x); LNbits ahora se inicia incluso mientras LND aún se está iniciando o está bloqueado y se reconecta automáticamente en lugar de fallar al iniciarse',
    de_DE:
      'Interne Aktualisierungen (start-sdk 2.0.x); LNbits startet jetzt auch, während LND noch startet oder gesperrt ist, und verbindet sich automatisch wieder, anstatt den Start abzubrechen',
    pl_PL:
      'Aktualizacje wewnętrzne (start-sdk 2.0.x); LNbits uruchamia się teraz nawet gdy LND wciąż się uruchamia lub jest zablokowany i łączy się z nim automatycznie, zamiast nie wystartować',
    fr_FR:
      'Mises à jour internes (start-sdk 2.0.x); LNbits démarre désormais même pendant que LND démarre encore ou est verrouillé et s’y reconnecte automatiquement au lieu d’échouer au démarrage',
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
