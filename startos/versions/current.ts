import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.6.2:6',
  releaseNotes: {
    en_US:
      'LNbits now trusts forwarded client addresses only from StartOS itself, so another service on this server can no longer make its requests appear to come from a different address.',
    es_ES:
      'LNbits ahora solo confía en las direcciones de cliente reenviadas por el propio StartOS, por lo que otro servicio de este servidor ya no puede hacer que sus solicitudes parezcan provenir de otra dirección.',
    de_DE:
      'LNbits vertraut weitergeleiteten Client-Adressen jetzt nur noch, wenn sie von StartOS selbst stammen. Ein anderer Dienst auf diesem Server kann seine Anfragen daher nicht mehr so erscheinen lassen, als kämen sie von einer anderen Adresse.',
    pl_PL:
      'LNbits ufa teraz przekazanym adresom klientów tylko wtedy, gdy pochodzą od samego StartOS, więc inna usługa na tym serwerze nie może już sprawić, by jej żądania wyglądały na pochodzące z innego adresu.',
    fr_FR:
      "LNbits ne fait désormais confiance aux adresses client transmises que lorsqu'elles proviennent de StartOS lui-même : un autre service de ce serveur ne peut plus faire passer ses requêtes pour venant d'une autre adresse.",
  },
  migrations: {},
})
