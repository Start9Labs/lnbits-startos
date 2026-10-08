import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:1',
  releaseNotes: {
    en_US: `- Lightning Implementation explains what each of its choices means.
- Reset Password asks for confirmation before it replaces the super user's password.`,
    es_ES: `- Implementación Lightning explica qué significa cada una de sus opciones.
- Restablecer contraseña pide confirmación antes de reemplazar la contraseña del Super Usuario.`,
    de_DE: `- Lightning-Implementierung erklärt, was jede ihrer Optionen bedeutet.
- Passwort zurücksetzen fragt nach einer Bestätigung, bevor es das Passwort des Super-Users ersetzt.`,
    pl_PL: `- Implementacja Lightning wyjaśnia, co oznacza każda z jej opcji.
- Resetuj hasło prosi o potwierdzenie, zanim zastąpi hasło Super Użytkownika.`,
    fr_FR: `- Implémentation Lightning explique ce que signifie chacune de ses options.
- Réinitialiser le mot de passe demande une confirmation avant de remplacer le mot de passe du Super Utilisateur.`,
  },
  migrations: {},
})
