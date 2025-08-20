import { sdk } from './sdk'

export const uiPort = 5000
export const db = '/app/data/database.sqlite3'
export const randomPassword = {
  charset: 'a-z,A-Z,1-9,+,/',
  len: 22,
}

export const mainMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  mountpoint: '/app/data',
  readonly: false,
  subpath: null,
  type: 'directory',
})

export const envDefaults = {
  HOST: 'lnbits.startos',
  PORT: '5000',

  // uvicorn variable, allow https behind a proxy
  FORWARDED_ALLOW_IPS: '*',

  DEBUG: 'false',

  AUTH_ALLOWED_METHODS: 'username-password',
  LNBITS_ALLOWED_USERS: '',
  LNBITS_ADMIN_USERS: '',
  // Extensions only admin can access
  LNBITS_ADMIN_EXTENSIONS: 'ngrok, admin',
  // Enable Admin GUI, available for the first user in LNBITS_ADMIN_USERS if available
  LNBITS_ADMIN_UI: 'true',

  LNBITS_DEFAULT_WALLET_NAME: 'LNbits wallet',

  // Ad space description
  // LNBITS_AD_SPACE_TITLE="Supported by"
  // csv ad space, format "<url>;<img-light>;<img-dark>, <url>;<img-light>;<img-dark>", extensions can choose to honor
  // LNBITS_AD_SPACE="" # csv ad image filepaths or urls, extensions can choose to honor
  LNBITS_HIDE_API: 'false', // Hides wallet api, extensions can choose to honor

  // Disable extensions for all users, use "all" to disable all extensions
  LNBITS_DISABLED_EXTENSIONS: 'amilk',

  // Database: to use SQLite, specify LNBITS_DATA_FOLDER
  //           to use PostgreSQL, specify LNBITS_DATABASE_URL=postgres://...
  //           to use CockroachDB, specify LNBITS_DATABASE_URL=cockroachdb://...
  // for both PostgreSQL and CockroachDB, you'll need to install
  //   psycopg2 as an additional dependency
  LNBITS_DATA_FOLDER: './data',
  // LNBITS_DATABASE_URL="postgres://user:password@host:port/databasename"

  LNBITS_FORCE_HTTPS: 'false',
  // LNBITS_SERVICE_FEE="0.0"
  // value in millisats
  LNBITS_RESERVE_FEE_MIN: '2000',
  // value in percent
  LNBITS_RESERVE_FEE_PERCENT: '1.0',

  // Change theme
  LNBITS_SITE_TITLE: 'LNbits',
  LNBITS_SITE_TAGLINE: 'free and open-source self-hosted lightning wallet',
  LNBITS_SITE_DESCRIPTION: 'Made for you, hosted by you.',
  // Choose from mint, flamingo, freedom, salvador, autumn, monochrome, classic
  LNBITS_THEME_OPTIONS:
    'classic, bitcoin, freedom, mint, autumn, monochrome, salvador',
  LNBITS_CUSTOM_LOGO: '',

  // Choose from LNPayWallet, OpenNodeWallet, LntxbotWallet, ClicheWallet, LnTipsWallet
  //             LndRestWallet, CoreLightningWallet, LNbitsWallet, SparkWallet, FakeWallet, EclairWallet
  LNBITS_BACKEND_WALLET_CLASS: 'LndRestWallet',
  // VoidWallet is just a fallback that works without any actual Lightning capabilities,
  // just so you can see the UI before dealing with this file.

  LNBITS_ALLOWED_FUNDING_SOURCES: 'LndRestWallet',

  // CLightningWallet
  CLIGHTNING_RPC: '/mnt/cln/bitcoin/lightning-rpc',

  // LndRestWallet
  LND_REST_ENDPOINT: 'https://lnd.startos:8080/',
  LND_REST_CERT: '/mnt/lnd/tls.cert',
  LND_REST_MACAROON: '/mnt/lnd/data/chain/bitcoin/mainnet/admin.macaroon',
} as const
