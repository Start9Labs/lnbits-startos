import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.0:0',
  releaseNotes: {
    en_US: `Updated LNbits to 1.6.0.

- Adds sandboxed WASM extensions, wallet Lightning Addresses, and a built-in Electrum block explorer.
- Improves WebSocket performance and hardens payment handling and Markdown sanitization.

[Full release notes](https://github.com/lnbits/lnbits/releases/tag/v1.6.0)`,
    es_ES: `Actualiza LNbits a la versión 1.6.0.

- Añade extensiones WASM aisladas, direcciones Lightning para monederos y un explorador de bloques Electrum integrado.
- Mejora el rendimiento de WebSocket y refuerza la gestión de pagos y la sanitización de Markdown.

[Notas de la versión completas](https://github.com/lnbits/lnbits/releases/tag/v1.6.0)`,
    de_DE: `Aktualisiert LNbits auf Version 1.6.0.

- Fügt isolierte WASM-Erweiterungen, Lightning-Adressen für Wallets und einen integrierten Electrum-Block-Explorer hinzu.
- Verbessert die WebSocket-Leistung und härtet die Zahlungsabwicklung sowie die Markdown-Bereinigung.

[Vollständige Versionshinweise](https://github.com/lnbits/lnbits/releases/tag/v1.6.0)`,
    pl_PL: `Aktualizuje LNbits do wersji 1.6.0.

- Dodaje izolowane rozszerzenia WASM, adresy Lightning dla portfeli oraz wbudowaną przeglądarkę bloków Electrum.
- Poprawia wydajność WebSocket oraz wzmacnia obsługę płatności i oczyszczanie Markdown.

[Pełne informacje o wydaniu](https://github.com/lnbits/lnbits/releases/tag/v1.6.0)`,
    fr_FR: `Met à jour LNbits vers la version 1.6.0.

- Ajoute des extensions WASM isolées, des adresses Lightning pour les portefeuilles et un explorateur de blocs Electrum intégré.
- Améliore les performances WebSocket et renforce le traitement des paiements ainsi que la sanitisation du Markdown.

[Notes de version complètes](https://github.com/lnbits/lnbits/releases/tag/v1.6.0)`,
  },
  migrations: {},
})
