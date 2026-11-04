import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:5',
  releaseNotes: {
    en_US:
      'With Core Lightning as its funding source, LNbits waits for Core Lightning to be ready before it starts.',
    es_ES:
      'Con Core Lightning como fuente de fondos, LNbits espera a que Core Lightning esté listo antes de iniciarse.',
    de_DE:
      'Mit Core Lightning als Finanzierungsquelle wartet LNbits, bis Core Lightning bereit ist, bevor es startet.',
    pl_PL:
      'Gdy źródłem środków jest Core Lightning, LNbits czeka, aż Core Lightning będzie gotowy, zanim się uruchomi.',
    fr_FR:
      'Avec Core Lightning comme source de financement, LNbits attend que Core Lightning soit prêt avant de démarrer.',
  },
  migrations: {},
})
