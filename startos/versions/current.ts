import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:8',
  releaseNotes: {
    en_US:
      "With Eclair or phoenixd as its funding source, LNbits now receives only the node's API password and can no longer read its seed or other files. Requires Eclair 0.14.6:2 or phoenixd 0.9.2:4.",
    es_ES:
      'Con Eclair o phoenixd como fuente de fondos, LNbits ahora solo recibe la contraseña de API del nodo y ya no puede leer su semilla ni sus demás archivos. Requiere Eclair 0.14.6:2 o phoenixd 0.9.2:4.',
    de_DE:
      'Mit Eclair oder phoenixd als Finanzierungsquelle erhält LNbits jetzt nur noch das API-Passwort des Knotens und kann dessen Seed und übrige Dateien nicht mehr lesen. Erfordert Eclair 0.14.6:2 oder phoenixd 0.9.2:4.',
    pl_PL:
      'Gdy źródłem środków jest Eclair lub phoenixd, LNbits otrzymuje teraz tylko hasło API węzła i nie może już odczytać jego seeda ani innych plików. Wymaga Eclair 0.14.6:2 lub phoenixd 0.9.2:4.',
    fr_FR:
      "Avec Eclair ou phoenixd comme source de financement, LNbits ne reçoit plus que le mot de passe d'API du nœud et ne peut plus lire sa seed ni ses autres fichiers. Nécessite Eclair 0.14.6:2 ou phoenixd 0.9.2:4.",
  },
  migrations: {},
})
