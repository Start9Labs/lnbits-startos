import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.7.1:2',
  releaseNotes: {
    en_US:
      'Reset Password has a new Sign Out All Sessions option, off by default, that also signs out every browser and app signed in to LNbits.',
    es_ES:
      'Restablecer contraseña tiene una nueva opción, Cerrar todas las sesiones, desactivada por defecto, que también cierra la sesión de todos los navegadores y aplicaciones conectados a LNbits.',
    de_DE:
      'Passwort zurücksetzen hat die neue Option „Alle Sitzungen abmelden“, standardmäßig aus, die zusätzlich alle bei LNbits angemeldeten Browser und Apps abmeldet.',
    pl_PL:
      'Resetuj hasło ma nową opcję Wyloguj wszystkie sesje, domyślnie wyłączoną, która wylogowuje także wszystkie przeglądarki i aplikacje zalogowane do LNbits.',
    fr_FR:
      'Réinitialiser le mot de passe propose une nouvelle option, Déconnecter toutes les sessions, désactivée par défaut, qui déconnecte aussi tous les navigateurs et applications connectés à LNbits.',
  },
  migrations: {},
})
