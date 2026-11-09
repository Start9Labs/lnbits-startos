import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:8',
  releaseNotes: {
    en_US:
      "With LND or Core Lightning as its funding source, LNbits now uses a credential that can only create invoices and make Lightning payments, and with any managed node (LND, Core Lightning, Eclair or phoenixd) it can no longer read the node's seed or other files. Requires LND 0.21.6-beta:2, Core Lightning 26.6.10:2, Eclair 0.14.6:2 or phoenixd 0.9.2:4, whichever is the funding source.",
    es_ES:
      'Con LND o Core Lightning como fuente de fondos, LNbits ahora usa una credencial que solo puede crear facturas y realizar pagos Lightning, y con cualquier nodo gestionado (LND, Core Lightning, Eclair o phoenixd) ya no puede leer la semilla del nodo ni sus demás archivos. Requiere LND 0.21.6-beta:2, Core Lightning 26.6.10:2, Eclair 0.14.6:2 o phoenixd 0.9.2:4, según cuál sea la fuente de fondos.',
    de_DE:
      'Mit LND oder Core Lightning als Finanzierungsquelle verwendet LNbits jetzt eine Berechtigung, die nur Rechnungen erstellen und Lightning-Zahlungen ausführen kann, und mit jedem verwalteten Knoten (LND, Core Lightning, Eclair oder phoenixd) kann es den Seed des Knotens und dessen übrige Dateien nicht mehr lesen. Erfordert LND 0.21.6-beta:2, Core Lightning 26.6.10:2, Eclair 0.14.6:2 oder phoenixd 0.9.2:4, je nach Finanzierungsquelle.',
    pl_PL:
      'Gdy źródłem środków jest LND lub Core Lightning, LNbits używa teraz poświadczenia, które może tylko tworzyć faktury i wykonywać płatności Lightning, a z dowolnym zarządzanym węzłem (LND, Core Lightning, Eclair lub phoenixd) nie może już odczytać seeda węzła ani innych jego plików. Wymaga LND 0.21.6-beta:2, Core Lightning 26.6.10:2, Eclair 0.14.6:2 lub phoenixd 0.9.2:4, zależnie od źródła środków.',
    fr_FR:
      "Avec LND ou Core Lightning comme source de financement, LNbits utilise désormais un identifiant qui ne peut que créer des factures et effectuer des paiements Lightning, et avec tout nœud géré (LND, Core Lightning, Eclair ou phoenixd) il ne peut plus lire la seed du nœud ni ses autres fichiers. Nécessite LND 0.21.6-beta:2, Core Lightning 26.6.10:2, Eclair 0.14.6:2 ou phoenixd 0.9.2:4, selon la source de financement.",
  },
  migrations: {},
})
