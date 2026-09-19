import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:0',
  releaseNotes: {
    en_US:
      'Updated LNbits to 1.6.2. Fixes PostgreSQL backup handling. [Full release notes](https://github.com/lnbits/lnbits/releases/tag/v1.6.2)',
    es_ES:
      'Actualiza LNbits a la versión 1.6.2. Corrige la gestión de copias de seguridad de PostgreSQL. [Notas de la versión completas](https://github.com/lnbits/lnbits/releases/tag/v1.6.2)',
    de_DE:
      'Aktualisiert LNbits auf Version 1.6.2. Behebt die Verarbeitung von PostgreSQL-Sicherungen. [Vollständige Versionshinweise](https://github.com/lnbits/lnbits/releases/tag/v1.6.2)',
    pl_PL:
      'Aktualizuje LNbits do wersji 1.6.2. Naprawia obsługę kopii zapasowych PostgreSQL. [Pełne informacje o wydaniu](https://github.com/lnbits/lnbits/releases/tag/v1.6.2)',
    fr_FR:
      'Met à jour LNbits vers la version 1.6.2. Corrige la gestion des sauvegardes PostgreSQL. [Notes de version complètes](https://github.com/lnbits/lnbits/releases/tag/v1.6.2)',
  },
  migrations: {},
})
