import { sdk } from './sdk'

export const uiPort = 5000
export const db = '/app/data/database.sqlite3'

export const lndMountpoint = '/mnt/lnd'
export const clnMountpoint = '/mnt/cln'

export const mainMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  mountpoint: '/app/data',
  readonly: false,
  subpath: null,
  type: 'directory',
})
