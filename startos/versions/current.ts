import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.7.1:3',
  releaseNotes: {
    en_US:
      'Maintenance release: removes unused tools from the service image. LNbits itself is unchanged.',
    es_ES:
      'Versión de mantenimiento: elimina herramientas no utilizadas de la imagen del servicio. LNbits no cambia.',
    de_DE:
      'Wartungsversion: entfernt ungenutzte Werkzeuge aus dem Dienst-Image. LNbits selbst bleibt unverändert.',
    pl_PL:
      'Wydanie konserwacyjne: usuwa nieużywane narzędzia z obrazu usługi. Samo LNbits pozostaje bez zmian.',
    fr_FR:
      'Version de maintenance : supprime des outils inutilisés de l’image du service. LNbits lui-même est inchangé.',
  },
  migrations: {},
})
