import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:2',
  releaseNotes: {
    en_US:
      'Restarting LNbits while it is still starting stops every process of the previous run.',
    es_ES:
      'Reiniciar LNbits mientras aún se está iniciando detiene todos los procesos de la ejecución anterior.',
    de_DE:
      'Ein Neustart von LNbits, während es noch startet, beendet alle Prozesse des vorherigen Laufs.',
    pl_PL:
      'Ponowne uruchomienie LNbits w trakcie uruchamiania zatrzymuje wszystkie procesy poprzedniego uruchomienia.',
    fr_FR:
      "Redémarrer LNbits pendant son démarrage arrête tous les processus de l'exécution précédente.",
  },
  migrations: {},
})
