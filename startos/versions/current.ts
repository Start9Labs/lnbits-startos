import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.5.6:4',
  releaseNotes: {
    en_US: `Adds phoenixd and Eclair as Lightning backends, and a "None / External" option that leaves the funding source to LNbits' own Admin UI — a node elsewhere, a third-party service, or a fake wallet for testing.`,
    es_ES: `Añade phoenixd y Eclair como backends Lightning y una opción «Ninguno / Externo» que deja la fuente de financiación a la propia interfaz de administración de LNbits: un nodo en otro equipo, un servicio de terceros o un monedero falso para pruebas.`,
    de_DE: `Fügt phoenixd und Eclair als Lightning-Backends hinzu sowie die Option „Keiner / Extern“, die die Zahlungsquelle der Admin-Oberfläche von LNbits überlässt — ein Knoten anderswo, ein Drittanbieterdienst oder ein Fake-Wallet zum Testen.`,
    pl_PL: `Dodaje phoenixd i Eclair jako backendy Lightning oraz opcję „Brak / Zewnętrzne”, która pozostawia źródło finansowania panelowi administracyjnemu samego LNbits — węzeł w innym miejscu, usługa zewnętrzna lub fałszywy portfel do testów.`,
    fr_FR: `Ajoute phoenixd et Eclair comme backends Lightning, ainsi qu'une option « Aucun / Externe » qui laisse la source de financement à l'interface d'administration de LNbits — un nœud ailleurs, un service tiers ou un portefeuille factice pour les tests.`,
  },
  migrations: {},
})
