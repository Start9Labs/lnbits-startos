import { access, rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  implementation: Value.select({
    name: 'Lightning Implementation',
    description:
      'The underlying Lightning implementation, currently LND or Core Lightning (CLN)',
    values: {
      LndRestWallet: 'LND',
      CoreLightningWallet: 'Core Lightning',
    },
    default: 'LndRestWallet',
  }),
})

export const setLnImplementation = sdk.Action.withInput(
  // id
  'set-lightning-implementation',

  // metadata
  async ({ effects }) => ({
    name: 'Lightning Implementation',
    description: 'Select the Lightning Implementation for LNbits to utilize',
    warning:
      'If the LN implementation is changed after using LNBits this will delete all LNBits accounts and wallets related to the previously configured LN implementation! All LN funds will still be available on the underlying LN implementation.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const configuredLnImplementation = await envFile
      .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
      .const(effects)

    if (!configuredLnImplementation) return

    return {
      implementation: configuredLnImplementation,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const configuredLnImplementation = await envFile
      .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
      .const(effects)

    try {
      await access('/media/startos/volumes/main/database.sqlite3')
      if (configuredLnImplementation !== input.implementation) {
        console.log(
          'existing LN implementation does not match input. Resetting DB...',
        )
        await rm('/media/startos/volumes/main/database.sqlite3')
      }
    } catch (error) {
      console.log('DB has not been initialized')
    }

    await envFile.merge(effects, {
      LNBITS_BACKEND_WALLET_CLASS: input.implementation,
      LNBITS_ALLOWED_FUNDING_SOURCES: input.implementation,
    })
  },
)
