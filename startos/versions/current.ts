import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '1.5.5:0',
  releaseNotes: {
    en_US: `Updated LNbits to 1.5.5.

- Adds Revolut and Square as fiat funding backends.
- Fixes OIDC/SSO login issues.
- Adds extension profiles, letting you save and reuse sets of enabled extensions.
- Improves payment reliability: exponential backoff when polling in-flight payments, multi-path payments over LND, and fewer stalled fiat payment status updates.
- Speeds up the interface with cached exchange rates and faster theming.
- Fixes the CSV export limit.

Full release notes: https://github.com/lnbits/lnbits/releases/tag/v1.5.5`,
    es_ES: `Actualiza LNbits a 1.5.5.

- Añade Revolut y Square como fuentes de financiación en moneda fiat.
- Corrige problemas de inicio de sesión con OIDC/SSO.
- Añade perfiles de extensiones, que permiten guardar y reutilizar conjuntos de extensiones activadas.
- Mejora la fiabilidad de los pagos: espera exponencial al consultar pagos en curso, pagos multiruta a través de LND y menos actualizaciones de estado bloqueadas en pagos fiat.
- Acelera la interfaz con tipos de cambio en caché y temas más rápidos.
- Corrige el límite de exportación a CSV.

Notas de la versión completas: https://github.com/lnbits/lnbits/releases/tag/v1.5.5`,
    de_DE: `Aktualisiert LNbits auf 1.5.5.

- Fügt Revolut und Square als Fiat-Zahlungsquellen hinzu.
- Behebt Anmeldeprobleme mit OIDC/SSO.
- Fügt Erweiterungsprofile hinzu, mit denen sich Sätze aktivierter Erweiterungen speichern und wiederverwenden lassen.
- Verbessert die Zuverlässigkeit von Zahlungen: exponentielles Backoff beim Abfragen laufender Zahlungen, Multipfad-Zahlungen über LND und weniger hängende Statusaktualisierungen bei Fiat-Zahlungen.
- Beschleunigt die Oberfläche durch zwischengespeicherte Wechselkurse und schnelleres Theming.
- Behebt das Limit beim CSV-Export.

Vollständige Versionshinweise: https://github.com/lnbits/lnbits/releases/tag/v1.5.5`,
    pl_PL: `Aktualizuje LNbits do 1.5.5.

- Dodaje Revolut i Square jako źródła finansowania w walucie fiat.
- Naprawia problemy z logowaniem przez OIDC/SSO.
- Dodaje profile rozszerzeń, pozwalające zapisywać i ponownie wykorzystywać zestawy włączonych rozszerzeń.
- Poprawia niezawodność płatności: wykładnicze wydłużanie odstępów przy odpytywaniu płatności w toku, płatności wielościeżkowe przez LND oraz mniej zablokowanych aktualizacji statusu płatności fiat.
- Przyspiesza interfejs dzięki buforowanym kursom wymiany i szybszemu motywowi.
- Naprawia limit eksportu do CSV.

Pełne informacje o wydaniu: https://github.com/lnbits/lnbits/releases/tag/v1.5.5`,
    fr_FR: `Met à jour LNbits vers 1.5.5.

- Ajoute Revolut et Square comme sources de financement en monnaie fiduciaire.
- Corrige les problèmes de connexion OIDC/SSO.
- Ajoute les profils d'extensions, permettant d'enregistrer et de réutiliser des ensembles d'extensions activées.
- Améliore la fiabilité des paiements : temporisation exponentielle lors du suivi des paiements en cours, paiements multi-chemins via LND et moins de mises à jour de statut bloquées sur les paiements fiduciaires.
- Accélère l'interface grâce aux taux de change mis en cache et à un thème plus rapide.
- Corrige la limite d'exportation CSV.

Notes de version complètes : https://github.com/lnbits/lnbits/releases/tag/v1.5.5`,
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
