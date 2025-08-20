import { cwd } from 'process'
import { envFile } from './fileModels/env'
import { sdk } from './sdk'
import { mainMounts, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects, started }) => {
  /**
   * ======================== Setup (optional) ========================
   *
   * In this section, we fetch any resources or run any desired preliminary commands.
   */
  console.info('Starting LNbits!')

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
          ? '/mnt/lnd'
          : '/mnt/cln',
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
  return sdk.Daemons.of(effects, started).addDaemon('primary', {
    subcontainer: lnbitsSub,
    exec: { command: ['poetry', 'run', 'lnbits'], env: env || {} },
    ready: {
      display: 'Web Interface',
      gracePeriod: 75_000,
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: 'The web interface is ready',
          errorMessage: 'The web interface is not ready',
        }),
    },
    requires: [],
  })
})
