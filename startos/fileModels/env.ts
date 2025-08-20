import { matches, FileHelper } from '@start9labs/start-sdk'
const { object, string } = matches

import { envDefaults } from '../utils'
import { literal, literals } from 'ts-matches'

const {
  HOST,
  PORT,
  FORWARDED_ALLOW_IPS,
  DEBUG,
  AUTH_ALLOWED_METHODS,
  LNBITS_ALLOWED_USERS,
  LNBITS_ADMIN_USERS,
  LNBITS_ADMIN_EXTENSIONS,
  LNBITS_ADMIN_UI,
  LNBITS_DEFAULT_WALLET_NAME,
  LNBITS_HIDE_API,
  LNBITS_DISABLED_EXTENSIONS,
  LNBITS_DATA_FOLDER,
  LNBITS_FORCE_HTTPS,
  LNBITS_RESERVE_FEE_MIN,
  LNBITS_RESERVE_FEE_PERCENT,
  LNBITS_SITE_TITLE,
  LNBITS_SITE_TAGLINE,
  LNBITS_SITE_DESCRIPTION,
  LNBITS_THEME_OPTIONS,
  LNBITS_CUSTOM_LOGO,
  LNBITS_BACKEND_WALLET_CLASS,
  LNBITS_ALLOWED_FUNDING_SOURCES,
  CLIGHTNING_RPC,
  LND_REST_ENDPOINT,
  LND_REST_CERT,
  LND_REST_MACAROON,
} = envDefaults

const shape = object({
  HOST: literal(HOST).onMismatch(HOST),
  PORT: literal(PORT).onMismatch(PORT),

  // uvicorn variable, allow https behind a proxy
  FORWARDED_ALLOW_IPS:
    literal(FORWARDED_ALLOW_IPS).onMismatch(FORWARDED_ALLOW_IPS),

  DEBUG: literals('true', 'false').optional().onMismatch(DEBUG),

  AUTH_ALLOWED_METHODS: string.onMismatch(AUTH_ALLOWED_METHODS),

  LNBITS_ALLOWED_USERS: string.optional().onMismatch(LNBITS_ALLOWED_USERS),
  LNBITS_ADMIN_USERS: string.optional().onMismatch(LNBITS_ADMIN_USERS),
  // Extensions only admin can access
  LNBITS_ADMIN_EXTENSIONS: string
    .optional()
    .onMismatch(LNBITS_ADMIN_EXTENSIONS),
  // Enable Admin GUI, available for the first user in LNBITS_ADMIN_USERS if available
  LNBITS_ADMIN_UI: literals('true', 'false')
    .optional()
    .onMismatch(LNBITS_ADMIN_UI),

  LNBITS_DEFAULT_WALLET_NAME: string
    .optional()
    .onMismatch(LNBITS_DEFAULT_WALLET_NAME),

  // Ad space description
  // LNBITS_AD_SPACE_TITLE="Supported by"
  // csv ad space, format "<url>;<img-light>;<img-dark>, <url>;<img-light>;<img-dark>", extensions can choose to honor
  // LNBITS_AD_SPACE="" # csv ad image filepaths or urls, extensions can choose to honor
  LNBITS_HIDE_API: literals('true', 'false')
    .optional()
    .onMismatch(LNBITS_HIDE_API), // Hides wallet api, extensions can choose to honor

  // Disable extensions for all users, use "all" to disable all extensions
  LNBITS_DISABLED_EXTENSIONS: string
    .optional()
    .onMismatch(LNBITS_DISABLED_EXTENSIONS),

  // Database: to use SQLite, specify LNBITS_DATA_FOLDER
  //           to use PostgreSQL, specify LNBITS_DATABASE_URL=postgres://...
  //           to use CockroachDB, specify LNBITS_DATABASE_URL=cockroachdb://...
  // for both PostgreSQL and CockroachDB, you'll need to install
  //   psycopg2 as an additional dependency
  LNBITS_DATA_FOLDER:
    literal(LNBITS_DATA_FOLDER).onMismatch(LNBITS_DATA_FOLDER),
  // LNBITS_DATABASE_URL="postgres://user:password@host:port/databasename"

  LNBITS_FORCE_HTTPS: literals('true', 'false')
    .optional()
    .onMismatch(LNBITS_FORCE_HTTPS),
  // LNBITS_SERVICE_FEE="0.0"
  // value in millisats
  LNBITS_RESERVE_FEE_MIN: string.optional().onMismatch(LNBITS_RESERVE_FEE_MIN),
  // value in percent
  LNBITS_RESERVE_FEE_PERCENT: string
    .optional()
    .onMismatch(LNBITS_RESERVE_FEE_PERCENT),

  // Change theme
  LNBITS_SITE_TITLE: string.optional().onMismatch(LNBITS_SITE_TITLE),
  LNBITS_SITE_TAGLINE: string.optional().onMismatch(LNBITS_SITE_TAGLINE),
  LNBITS_SITE_DESCRIPTION: string
    .optional()
    .onMismatch(LNBITS_SITE_DESCRIPTION),
  // Choose from mint, flamingo, freedom, salvador, autumn, monochrome, classic
  LNBITS_THEME_OPTIONS: string.optional().onMismatch(LNBITS_THEME_OPTIONS),
  LNBITS_CUSTOM_LOGO: string.optional().onMismatch(LNBITS_CUSTOM_LOGO),

  // Choose from LNPayWallet, OpenNodeWallet, LntxbotWallet, ClicheWallet, LnTipsWallet
  //             LndRestWallet, CoreLightningWallet, LNbitsWallet, SparkWallet, FakeWallet, EclairWallet
  LNBITS_BACKEND_WALLET_CLASS: literals(
    'LndRestWallet',
    'CoreLightningWallet',
  ).onMismatch(LNBITS_BACKEND_WALLET_CLASS),
  // VoidWallet is just a fallback that works without any actual Lightning capabilities,
  // just so you can see the UI before dealing with this file.

  LNBITS_ALLOWED_FUNDING_SOURCES: literals(
    'LndRestWallet',
    'CoreLightningWallet',
  ).onMismatch(LNBITS_ALLOWED_FUNDING_SOURCES),

  // CLightningWallet
  CLIGHTNING_RPC: literal(CLIGHTNING_RPC).onMismatch(CLIGHTNING_RPC),

  // LndRestWallet
  LND_REST_ENDPOINT: literal(LND_REST_ENDPOINT).onMismatch(LND_REST_ENDPOINT),
  LND_REST_CERT: literal(LND_REST_CERT).onMismatch(LND_REST_CERT),
  LND_REST_MACAROON: literal(LND_REST_MACAROON).onMismatch(LND_REST_MACAROON),
})

export const envFile = FileHelper.env('/media/startos/volumes/main/.env', shape)
