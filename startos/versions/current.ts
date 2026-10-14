import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:3',
  releaseNotes: {
    en_US:
      'If its Lightning node is not ready, LNbits waits for it and opens on its own once the node responds.',
    es_ES:
      'Si su nodo Lightning no está listo, LNbits lo espera y se abre por sí solo en cuanto el nodo responde.',
    de_DE:
      'Ist sein Lightning-Knoten nicht bereit, wartet LNbits auf ihn und öffnet sich von selbst, sobald der Knoten antwortet.',
    pl_PL:
      'Jeśli jego węzeł Lightning nie jest gotowy, LNbits czeka na niego i otwiera się sam, gdy tylko węzeł odpowie.',
    fr_FR:
      "Si son nœud Lightning n'est pas prêt, LNbits l'attend et s'ouvre de lui-même dès que le nœud répond.",
  },
  migrations: {},
})
