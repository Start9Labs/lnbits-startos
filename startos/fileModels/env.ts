import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { clnMountpoint, lndMountpoint } from '../utils'

export const shape = z.object({
  HOST: z.literal('lnbits.startos').catch('lnbits.startos'),
  PORT: z.literal('5000').catch('5000'),
  FORWARDED_ALLOW_IPS: z.literal('*').catch('*'),
  DEBUG: z.enum(['true', 'false']).optional().catch('false'),
  AUTH_ALLOWED_METHODS: z.string().catch('username-password'),
  LNBITS_ALLOWED_USERS: z.string().optional().catch(''),
  LNBITS_ADMIN_USERS: z.string().optional().catch(''),
  LNBITS_ADMIN_EXTENSIONS: z.string().optional().catch('ngrok, admin'),
  LNBITS_ADMIN_UI: z.enum(['true', 'false']).optional().catch('true'),
  LNBITS_DEFAULT_WALLET_NAME: z.string().optional().catch('LNbits wallet'),
  LNBITS_HIDE_API: z.enum(['true', 'false']).optional().catch('false'),
  LNBITS_DISABLED_EXTENSIONS: z.string().optional().catch('amilk'),
  LNBITS_DATA_FOLDER: z.literal('./data').catch('./data'),
  LNBITS_FORCE_HTTPS: z.enum(['true', 'false']).optional().catch('false'),
  LNBITS_RESERVE_FEE_MIN: z.string().optional().catch('2000'),
  LNBITS_RESERVE_FEE_PERCENT: z.string().optional().catch('1.0'),
  LNBITS_SITE_TITLE: z.string().optional().catch('LNbits'),
  LNBITS_SITE_TAGLINE: z
    .string()
    .optional()
    .catch('free and open-source self-hosted lightning wallet'),
  LNBITS_SITE_DESCRIPTION: z
    .string()
    .optional()
    .catch('Made for you, hosted by you.'),
  LNBITS_THEME_OPTIONS: z
    .string()
    .optional()
    .catch('classic, bitcoin, freedom, mint, autumn, monochrome, salvador'),
  LNBITS_CUSTOM_LOGO: z.string().optional().catch(''),
  LNBITS_BACKEND_WALLET_CLASS: z
    .enum(['VoidWallet', 'LndRestWallet', 'CoreLightningWallet'])
    .catch('LndRestWallet'),
  LNBITS_ALLOWED_FUNDING_SOURCES: z
    .enum(['LndRestWallet', 'CoreLightningWallet'])
    .catch('LndRestWallet'),
  CLIGHTNING_RPC: z
    .literal(`${clnMountpoint}/bitcoin/lightning-rpc`)
    .catch(`${clnMountpoint}/bitcoin/lightning-rpc`),
  LND_REST_ENDPOINT: z
    .literal('https://lnd.startos:8080/')
    .catch('https://lnd.startos:8080/'),
  LND_REST_CERT: z
    .literal(`${lndMountpoint}/tls.cert`)
    .catch(`${lndMountpoint}/tls.cert`),
  LND_REST_MACAROON: z
    .literal(`${lndMountpoint}/data/chain/bitcoin/mainnet/admin.macaroon`)
    .catch(`${lndMountpoint}/data/chain/bitcoin/mainnet/admin.macaroon`),
})

export const envFile = FileHelper.env(
  { base: sdk.volumes.main, subpath: '/.env' },
  shape,
)
