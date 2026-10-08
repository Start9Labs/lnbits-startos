import { T } from '@start9labs/start-sdk'
import { envFile } from './fileModels/env'
import {
  depClnDescription,
  depEclairDescription,
  depLndDescription,
  depPhoenixdDescription,
} from './manifest/i18n'
import { sdk } from './sdk'

const configured =
  (
    backend:
      | 'LndRestWallet'
      | 'CoreLightningWallet'
      | 'EclairWallet'
      | 'PhoenixdWallet',
  ) =>
  async ({ effects }: { effects: T.Effects }) =>
    (await envFile
      .read((e) => e.LNBITS_BACKEND_WALLET_CLASS === backend)
      .const(effects)) === true

export const dependencies = sdk.Dependencies.of()
  .addDependency(
    sdk.Dependency.optional('lnd', {
      description: depLndDescription,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
      },
      versionRange: '>=0.21.1-beta:4',
      kind: 'running',
      healthChecks: ['lnd'],
      enabled: configured('LndRestWallet'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('c-lightning', {
      description: depClnDescription,
      metadata: {
        title: 'Core Lightning',
        icon: 'https://raw.githubusercontent.com/Start9Labs/cln-startos/refs/heads/master/icon.svg',
      },
      versionRange: '>=26.6.6:1',
      kind: 'running',
      healthChecks: ['lightningd'],
      enabled: configured('CoreLightningWallet'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('eclair', {
      description: depEclairDescription,
      metadata: {
        title: 'Eclair',
        icon: 'https://raw.githubusercontent.com/Start9Labs/eclair-startos/refs/heads/master/icon.png',
      },
      versionRange: '>=0.14.2:0',
      kind: 'running',
      healthChecks: ['eclair'],
      enabled: configured('EclairWallet'),
    }),
  )
  .addDependency(
    sdk.Dependency.optional('phoenixd', {
      description: depPhoenixdDescription,
      metadata: {
        title: 'phoenixd',
        icon: 'https://raw.githubusercontent.com/Start9-Community/phoenixd-startos/refs/heads/master/icon.svg',
      },
      versionRange: '>=0.8.0:1',
      kind: 'running',
      healthChecks: ['primary'],
      enabled: configured('PhoenixdWallet'),
    }),
  )
