import { envFile } from './fileModels/env'
import { i18n } from './i18n'
import { sdk } from './sdk'
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

  const lnbitsSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'lnbits' },
    mainMounts.mountDependency({
      dependencyId:
        configuredLnImplementation === 'LndRestWallet' ? 'lnd' : 'c-lightning',
      mountpoint:
        configuredLnImplementation === 'LndRestWallet'
          ? lndMountpoint
          : clnMountpoint,
      readonly: true,
      subpath: null,
      volumeId: 'main',
    }),
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
  return sdk.Daemons.of(effects).addDaemon('primary', {
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
    requires: [],
  })
})
