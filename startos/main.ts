import { manifest as clnManifest } from 'cln-startos/startos/manifest'
import { FileHelper } from '@start9labs/start-sdk'
import { clnrestPort } from 'cln-startos/startos/utils'
import { readFile, writeFile } from 'fs/promises'
import {
  controlHostId as lndControlHostId,
  restPort as lndRestPort,
} from 'lnd-startos/startos/interfaces'
import { manifest as lndManifest } from 'lnd-startos/startos/manifest'
import {
  apiHostId as eclairApiHostId,
  apiPort as eclairApiPort,
} from 'eclair-startos/startos/utils'
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
  clnrestHostId,
  eclairMountpoint,
  fundingNodes,
  fundingSourceMaxRetries,
  lndMountpoint,
  mainMounts,
  nodeConnectMs,
  nodeIsReady,
  phoenixdMountpoint,
  uiPort,
  waitingRestartMs,
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
  const node =
    configuredLnImplementation && configuredLnImplementation !== 'VoidWallet'
      ? fundingNodes[configuredLnImplementation]
      : null
  let nodeAddressPending = false

  let mounts = mainMounts

  if (configuredLnImplementation === 'LndRestWallet') {
    mounts = mounts.mountDependency<typeof lndManifest>({
      dependencyId: 'lnd',
      mountpoint: lndMountpoint,
      readonly: true,
      subpath: 'payments',
      volumeId: 'public',
    })
  } else if (configuredLnImplementation === 'CLNRestWallet') {
    mounts = mounts.mountDependency<typeof clnManifest>({
      dependencyId: 'c-lightning',
      mountpoint: clnMountpoint,
      readonly: true,
      subpath: 'payments',
      volumeId: 'public',
    })
  } else if (configuredLnImplementation === 'EclairWallet') {
    mounts = mounts.mountDependency<typeof eclairManifest>({
      dependencyId: 'eclair',
      mountpoint: eclairMountpoint,
      readonly: true,
      subpath: 'api',
      volumeId: 'public',
    })
  } else if (configuredLnImplementation === 'PhoenixdWallet') {
    mounts = mounts.mountDependency<typeof phoenixdManifest>({
      dependencyId: 'phoenixd',
      mountpoint: phoenixdMountpoint,
      readonly: true,
      subpath: 'full',
      volumeId: 'public',
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
    if (node) env.FUNDING_SOURCE_MAX_RETRIES = String(fundingSourceMaxRetries)

    if (configuredLnImplementation === 'LndRestWallet') {
      // Resolves at LND's first unlock and survives later lock and unlock.
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
        nodeAddressPending = true
      }
    } else if (configuredLnImplementation === 'CLNRestWallet') {
      // Absent until Core Lightning enables CLNRest and mints the rune; each appearing restarts main.
      const clnrest = await sdk.host
        .getBridgeAddress(effects, {
          packageId: 'c-lightning',
          hostId: clnrestHostId,
          internalPort: clnrestPort,
          ssl: true,
        })
        .const()
      const rune = (
        await FileHelper.string(
          `${await lnbitsSub.rootfs}${clnMountpoint}/rune`,
        )
          .read()
          .const(effects)
      )?.trim()
      await writeFile(
        sdk.volumes.main.subpath('startos-root-ca.pem'),
        await sdk.getRootCa(effects),
      )
      if (clnrest && rune) {
        env.CLNREST_URL = `https://${clnrest}`
        env.CLNREST_READONLY_RUNE = rune
        env.CLNREST_INVOICE_RUNE = rune
        env.CLNREST_PAY_RUNE = rune
      } else {
        nodeAddressPending = true
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

      const password = (
        await FileHelper.string(
          `${await lnbitsSub.rootfs}${eclairMountpoint}/password`,
        )
          .read()
          .const(effects)
      )?.trim()
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
  const gracePeriod = 75_000
  let closedSince: number | null = null
  let nodeReadySince: number | null = null

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
      exec: {
        fn: async (_, abort) => {
          // Core Lightning refusing LNbits sends it to VoidWallet, unretried.
          while (
            configuredLnImplementation === 'CLNRestWallet' &&
            !abort.aborted &&
            (nodeAddressPending ||
              !(await nodeIsReady(effects, fundingNodes.CLNRestWallet)))
          )
            await new Promise((r) => setTimeout(r, 5_000))
          return {
            command: ['uv', '--offline', 'run', '--no-sync', 'lnbits'],
            env: env || {},
          }
        },
      },
      ready: {
        display: i18n('Web Interface'),
        gracePeriod,
        fn: async () => {
          const web = await sdk.healthCheck.checkPortListening(
            effects,
            uiPort,
            {
              successMessage: i18n('The web interface is ready'),
              errorMessage: i18n('The web interface is not ready'),
            },
          )
          if (!node) return web
          const waiting = {
            result: 'loading' as const,
            message: i18n('Waiting for ${node}', { node: i18n(node.name) }),
          }
          if (web.result === 'success') {
            closedSince = nodeReadySince = null
            return nodeAddressPending ? waiting : web
          }
          const now = Date.now()
          closedSince ??= now
          if (now - closedSince < gracePeriod) return web
          if (now - closedSince > waitingRestartMs) {
            closedSince = now
            sdk.restart(effects).catch(console.error)
          }
          if (!(await nodeIsReady(effects, node))) {
            nodeReadySince = null
            return waiting
          }
          nodeReadySince ??= now
          return now - nodeReadySince < nodeConnectMs ? waiting : web
        },
      },
      requires: ['sync-funding-settings'],
    })
})

async function readPhoenixdHttpPassword(rootfs: string): Promise<string> {
  const password = (
    await readFile(`${rootfs}${phoenixdMountpoint}/http-password`, 'utf-8')
  ).trim()
  if (!password) {
    throw new Error(i18n('Could not read the phoenixd http-password'))
  }
  return password
}
