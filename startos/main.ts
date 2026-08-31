import { manifest as clnManifest } from 'cln-startos/startos/manifest'
import { readFile } from 'fs/promises'
import {
  controlHostId as lndControlHostId,
  restPort as lndRestPort,
} from 'lnd-startos/startos/interfaces'
import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import {
  apiHostId as eclairApiHostId,
  apiPort as eclairApiPort,
} from 'eclair-startos/startos/utils'
import { eclairConf } from 'eclair-startos/startos/fileModels/eclair.conf'
import { manifest as eclairManifest } from 'eclair-startos/startos/manifest'
import { apiHostId as phoenixdApiHostId } from 'phoenixd-startos/startos/interfaces'
import { manifest as phoenixdManifest } from 'phoenixd-startos/startos/manifest'
import { port as phoenixdPort } from 'phoenixd-startos/startos/utils'
import { envFile } from './fileModels/env'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { syncFundingSettings } from './syncFundingSettings'
import {
  clnMountpoint,
  eclairMountpoint,
  lndMountpoint,
  mainMounts,
  phoenixdMountpoint,
  uiPort,
} from './utils'

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

  let mounts = mainMounts

  if (configuredLnImplementation === 'LndRestWallet') {
    mounts = mounts.mountDependency<typeof lndManifest>({
      dependencyId: 'lnd',
      mountpoint: lndMountpoint,
      readonly: true,
      subpath: null,
      volumeId: 'main',
    })
  } else if (configuredLnImplementation === 'CoreLightningWallet') {
    mounts = mounts.mountDependency<typeof clnManifest>({
      dependencyId: 'c-lightning',
      mountpoint: clnMountpoint,
      readonly: true,
      subpath: null,
      volumeId: 'main',
    })
  } else if (configuredLnImplementation === 'EclairWallet') {
    mounts = mounts.mountDependency<typeof eclairManifest>({
      dependencyId: 'eclair',
      mountpoint: eclairMountpoint,
      readonly: true,
      subpath: null,
      volumeId: 'main',
    })
  } else if (configuredLnImplementation === 'PhoenixdWallet') {
    mounts = mounts.mountDependency<typeof phoenixdManifest>({
      dependencyId: 'phoenixd',
      mountpoint: phoenixdMountpoint,
      readonly: true,
      subpath: null,
      volumeId: 'main',
    })
  }

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
      // LND's REST binding (host `control`, internal `restPort`) is published
      // at wallet unlock; its bridge address then persists across lock/unlock,
      // so this `.const()` resolves once LND is installed and first unlocked
      // (one healing restart), then stays stable. While the address is
      // unresolved (LND absent or not yet unlocked) the endpoint stays unset —
      // LNbits fails its backend connection and the health check goes red until
      // LND appears, rather than dialing a fabricated address.
      const lndRest = await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'lnd',
          hostId: lndControlHostId,
          internalPort: lndRestPort,
        })
        .const()
      if (lndRest) {
        env.LND_REST_ENDPOINT = `https://${lndRest}/`
      } else {
        delete env.LND_REST_ENDPOINT
      }
    } else if (configuredLnImplementation === 'PhoenixdWallet') {
      // Unlike LND's, phoenixd's API binding exists from the moment it is
      // installed, so an unresolved address here is a real fault rather than a
      // stage LNbits should wait through.
      const phoenixd = await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'phoenixd',
          hostId: phoenixdApiHostId,
          internalPort: phoenixdPort,
          ssl: false,
        })
        .const()
      if (!phoenixd) {
        throw new Error(
          i18n(
            'phoenixd is not yet reachable on the internal network. Ensure phoenixd is installed and running.',
          ),
        )
      }

      env.PHOENIXD_API_ENDPOINT = `http://${phoenixd}/`
      env.PHOENIXD_API_PASSWORD = await readPhoenixdHttpPassword(
        await lnbitsSub.rootfs,
      )
    } else if (configuredLnImplementation === 'EclairWallet') {
      // Eclair's API binding exists from install, so an unresolved address is a
      // real fault rather than a stage to wait through.
      const eclair = await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'eclair',
          hostId: eclairApiHostId,
          internalPort: eclairApiPort,
          ssl: false,
        })
        .const()
      if (!eclair) {
        throw new Error(
          i18n(
            'Eclair is not yet reachable on the internal network. Ensure Eclair is installed and running.',
          ),
        )
      }

      // Read on every start out of Eclair's own config, so rotating the
      // password there reaches LNbits without the user retyping it.
      const password = await eclairConf
        .withPath(`${await lnbitsSub.rootfs}${eclairMountpoint}/eclair.conf`)
        .read((c) => c['api.password'])
        .const(effects)
      if (!password) {
        throw new Error(
          i18n(
            'Eclair has no API password set. Run its Set API Password action first.',
          ),
        )
      }

      env.ECLAIR_URL = `http://${eclair}`
      env.ECLAIR_PASS = password
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

async function readPhoenixdHttpPassword(rootfs: string): Promise<string> {
  const conf = await readFile(
    `${rootfs}${phoenixdMountpoint}/phoenix.conf`,
    'utf-8',
  )
  const password = conf.match(/^http-password=(.*)$/m)?.[1]?.trim()
  if (!password) {
    throw new Error(i18n('Could not read the phoenixd http-password'))
  }
  return password
}
