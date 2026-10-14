import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 5000
export const db = '/app/data/database.sqlite3'

export const lndMountpoint = '/mnt/lnd'
export const clnMountpoint = '/mnt/cln'
export const phoenixdMountpoint = '/mnt/phoenixd'
export const eclairMountpoint = '/mnt/eclair'

// LNbits' back-off overflows a float past 1023 retries.
export const fundingSourceMaxRetries = 1023
// Must stay below the ~17 h those retries take.
export const waitingRestartMs = 12 * 60 * 60_000
// LNbits retries its node about once a minute.
export const nodeConnectMs = 3 * 60_000

export const fundingNodes = {
  // `lnd` passes before LND answers RPCs; `sync-progress` leaves `starting` once it does.
  LndRestWallet: {
    packageId: 'lnd',
    name: 'LND',
    check: 'sync-progress',
    ready: ['success', 'loading'],
  },
  CoreLightningWallet: {
    packageId: 'c-lightning',
    name: 'Core Lightning',
    check: 'lightningd',
    ready: ['success'],
  },
  EclairWallet: {
    packageId: 'eclair',
    name: 'Eclair',
    check: 'eclair',
    ready: ['success'],
  },
  PhoenixdWallet: {
    packageId: 'phoenixd',
    name: 'phoenixd',
    check: 'primary',
    ready: ['success'],
  },
} as const

export type FundingNode = (typeof fundingNodes)[keyof typeof fundingNodes]

export async function nodeIsReady(effects: T.Effects, node: FundingNode) {
  const [dep] = await sdk.checkDependencies(effects, {
    packageIds: [node.packageId],
  })
  const result = dep?.healthChecks[node.check]?.result
  return (
    !!dep?.isRunning && (node.ready as readonly string[]).includes(result ?? '')
  )
}

export const mainMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  mountpoint: '/app/data',
  readonly: false,
  subpath: null,
  type: 'directory',
})
