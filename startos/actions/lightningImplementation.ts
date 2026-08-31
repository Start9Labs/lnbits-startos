import { access, rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  implementation: Value.select({
    name: i18n('Lightning Implementation'),
    description: i18n(
      'The Lightning node LNbits draws on for funds. LND, Core Lightning and phoenixd are the nodes StartOS packages, and the package wires the connection up for you. "None / External" leaves the funding source to you: pick and configure it from LNbits\' own Admin UI, including nodes elsewhere and third-party custodial services.',
    ),
    values: {
      LndRestWallet: i18n('LND'),
      CoreLightningWallet: i18n('Core Lightning'),
      PhoenixdWallet: i18n('phoenixd'),
      VoidWallet: i18n('None / External'),
    },
    default: undefined as any,
  }),
})

export const setLnImplementation = sdk.Action.withInput(
  // id
  'set-lightning-implementation',

  // metadata
  {
    name: i18n('Lightning Implementation'),
    description: i18n(
      'Select the Lightning Implementation for LNbits to utilize',
    ),
    warning: i18n(
      'If the LN implementation is changed after using LNbits this will delete all LNbits accounts and wallets related to the previously configured LN implementation! All LN funds will still be available on the underlying LN implementation.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const imp = await envFile
      .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
      .const(effects)

    if (!imp) return

    return {
      implementation: imp,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const configuredLnImplementation = await envFile
      .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
      .const(effects)

    try {
      await access(sdk.volumes.main.subpath('database.sqlite3'))
      if (configuredLnImplementation !== input.implementation) {
        console.log(
          i18n(
            'Existing LN implementation does not match input. Resetting DB...',
          ),
        )
        await rm('/media/startos/volumes/main/database.sqlite3')
      }
    } catch (error) {
      console.log(i18n('DB has not been initialized'))
    }

    await envFile.merge(effects, {
      LNBITS_BACKEND_WALLET_CLASS: input.implementation,
    })

    // Pinning the allowed list locks the Admin UI to the managed node; removing it
    // hands the choice back, LNbits falling through to its own set of every funding
    // source it supports. Removal takes a rewrite because `merge` cannot drop a key,
    // and blanking would not do: LNbits reads an empty list as nothing allowed.
    const env = await envFile.read().const(effects)
    if (env) {
      if (input.implementation === 'VoidWallet') {
        delete env.LNBITS_ALLOWED_FUNDING_SOURCES
      } else {
        env.LNBITS_ALLOWED_FUNDING_SOURCES = input.implementation
      }
      await envFile.write(effects, env)
    }
  },
)
