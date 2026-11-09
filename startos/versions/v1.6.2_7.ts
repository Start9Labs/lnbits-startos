import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { readFile, writeFile } from 'fs/promises'
import { sdk } from '../sdk'

export const v_1_6_2_7 = VersionInfo.of({
  version: '1.6.2:7',
  releaseNotes: {
    en_US:
      "With LND or Core Lightning as its funding source, LNbits now uses a credential that can only create invoices and make Lightning payments, and can no longer read the node's seed or other files. Requires LND 0.21.6-beta:2 or Core Lightning 26.6.10:2.",
    es_ES:
      'Con LND o Core Lightning como fuente de fondos, LNbits ahora usa una credencial que solo puede crear facturas y realizar pagos Lightning, y ya no puede leer la semilla del nodo ni sus demás archivos. Requiere LND 0.21.6-beta:2 o Core Lightning 26.6.10:2.',
    de_DE:
      'Mit LND oder Core Lightning als Finanzierungsquelle verwendet LNbits jetzt eine Berechtigung, die nur Rechnungen erstellen und Lightning-Zahlungen ausführen kann, und kann den Seed des Knotens und dessen übrige Dateien nicht mehr lesen. Erfordert LND 0.21.6-beta:2 oder Core Lightning 26.6.10:2.',
    pl_PL:
      'Gdy źródłem środków jest LND lub Core Lightning, LNbits używa teraz poświadczenia, które może tylko tworzyć faktury i wykonywać płatności Lightning, i nie może już odczytać seeda węzła ani innych jego plików. Wymaga LND 0.21.6-beta:2 lub Core Lightning 26.6.10:2.',
    fr_FR:
      'Avec LND ou Core Lightning comme source de financement, LNbits utilise désormais un identifiant qui ne peut que créer des factures et effectuer des paiements Lightning, et ne peut plus lire la seed du nœud ni ses autres fichiers. Nécessite LND 0.21.6-beta:2 ou Core Lightning 26.6.10:2.',
  },
  migrations: {
    up: async () => {
      // Read raw: the env model maps the retired class to its fallback.
      const path = sdk.volumes.main.subpath('.env')
      const env = await readFile(path, 'utf-8').catch(() => null)
      if (env === null) return
      await writeFile(
        path,
        env
          .replace(
            /^(LNBITS_BACKEND_WALLET_CLASS|LNBITS_ALLOWED_FUNDING_SOURCES)=("?)CoreLightningWallet\2$/gm,
            '$1=$2CLNRestWallet$2',
          )
          .replace(/^CLIGHTNING_RPC=.*\n?/m, ''),
      )
    },
    down: IMPOSSIBLE,
  },
})
