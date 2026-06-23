import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '1.5.4:1',
  releaseNotes: {
    en_US: `**Fixes**

- Reconcile LNbits' saved Lightning backend connection (endpoint, certificate, macaroon / CLN socket) with the StartOS-managed configuration on every start. Fixes installs that fell back to VoidWallet because LNbits' database still pointed at a stale macaroon path.`,
    es_ES: `**Correcciones**

- Reconcilia la conexión del backend Lightning guardada por LNbits (endpoint, certificado, macaroon / socket de CLN) con la configuración gestionada por StartOS en cada arranque. Soluciona las instalaciones que recurrían a VoidWallet porque la base de datos de LNbits apuntaba a una ruta de macaroon obsoleta.`,
    de_DE: `**Korrekturen**

- Gleicht die von LNbits gespeicherte Lightning-Backend-Verbindung (Endpoint, Zertifikat, Macaroon / CLN-Socket) bei jedem Start mit der von StartOS verwalteten Konfiguration ab. Behebt Installationen, die auf VoidWallet zurückfielen, weil die LNbits-Datenbank noch auf einen veralteten Macaroon-Pfad verwies.`,
    pl_PL: `**Poprawki**

- Uzgadnia zapisane przez LNbits połączenie z backendem Lightning (endpoint, certyfikat, macaroon / gniazdo CLN) z konfiguracją zarządzaną przez StartOS przy każdym uruchomieniu. Naprawia instalacje, które przełączały się na VoidWallet, ponieważ baza danych LNbits wskazywała nieaktualną ścieżkę macaroon.`,
    fr_FR: `**Corrections**

- Réaligne la connexion au backend Lightning enregistrée par LNbits (endpoint, certificat, macaroon / socket CLN) avec la configuration gérée par StartOS à chaque démarrage. Corrige les installations qui basculaient sur VoidWallet parce que la base de données de LNbits pointait encore vers un chemin de macaroon obsolète.`,
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
