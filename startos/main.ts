import { manifest as clnManifest } from 'cln-startos/startos/manifest'
import {
  controlHostId as lndControlHostId,
  lndconnectRestId,
} from 'lnd-startos/startos/interfaces'
import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import { envFile } from './fileModels/env'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { syncFundingSettings } from './syncFundingSettings'
import { clnMountpoint, lndMountpoint, mainMounts, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  console.info(i18n('Starting LNbits!'))

  const configuredLnImplementation = await envFile
    .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
    .const(effects)

  const mounts =
    configuredLnImplementation === 'LndRestWallet'
      ? mainMounts.mountDependency<typeof lndManifest>({
          dependencyId: 'lnd',
          mountpoint: lndMountpoint,
          readonly: true,
          subpath: null,
          volumeId: 'main',
        })
      : mainMounts.mountDependency<typeof clnManifest>({
          dependencyId: 'c-lightning',
          mountpoint: clnMountpoint,
          readonly: true,
          subpath: null,
          volumeId: 'main',
        })

  const lnbitsSub = sdk.SubContainer.of(
    effects,
    { imageId: 'lnbits' },
    mounts,
    'lnbits-sub',
  )

  const env = await envFile.read().const(effects)

  if (env) {
    // `.startos` DNS is retired in StartOS 0.4.x; containers reach the network
    // over the LXC bridge. Bind uvicorn to all interfaces, and resolve LND's
    // REST endpoint to its bridge address rather than the dead `lnd.startos`.
    env.HOST = '0.0.0.0'

    if (configuredLnImplementation === 'LndRestWallet') {
      const lndRestUrl = await sdk.host
        .get(
          effects,
          { hostId: lndControlHostId, packageId: 'lnd' },
          (host) => {
            const iface =
              host &&
              Object.values(host.bindings)
                .flatMap((b) => Object.values(b.interfaces))
                .find((i) => i.id === lndconnectRestId)
            const h = iface?.addressInfo
              .filter({
                kind: 'bridge',
                predicate: (h) => h.ssl && h.metadata.kind === 'ipv4',
              })
              .hostnames[0]
            return h && `https://${h.hostname}:${h.port}/`
          },
        )
        .const()
      if (!lndRestUrl)
        throw new Error(
          i18n(
            'LND is not yet reachable on the internal network. It may still be starting.',
          ),
        )
      env.LND_REST_ENDPOINT = lndRestUrl
    }
  }

  /**
   * ======================== Daemons ========================
   *
   * In this section, we create one or more daemons that define the service runtime.
   *
   * Each daemon defines its own health check, which can optionally be exposed to the user.
   */
  return sdk.Daemons.of(effects)
    .addOneshot('sync-funding-settings', {
      subcontainer: lnbitsSub,
      // LNbits' Admin UI persists the backend connection settings in its own
      // database and lets them override the `.env` on startup. Re-apply the
      // StartOS-managed paths before LNbits starts so the configured node — not
      // a stale/legacy value — is always used. See syncFundingSettings.ts.
      exec: {
        fn: async () => {
          await syncFundingSettings(lnbitsSub, env)
          return null
        },
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: lnbitsSub,
      exec: { command: ['uv', 'run', 'lnbits'], env: env || {} },
      ready: {
        display: i18n('Web Interface'),
        gracePeriod: 75_000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['sync-funding-settings'],
    })
})
