import { manifest as clnManifest } from 'cln-startos/startos/manifest'
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

  const lnbitsSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'lnbits' },
    mounts,
    'lnbits-sub',
  )

  const env = await envFile.read().const(effects)

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
