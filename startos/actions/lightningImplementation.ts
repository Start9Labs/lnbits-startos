import { access, rm } from 'fs/promises'
import { envFile } from '../fileModels/env'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  implementation: Value.select({
    name: i18n('Lightning Implementation'),
    description: i18n(
      'The underlying Lightning implementation, currently LND or Core Lightning (CLN)',
    ),
    values: {
      LndRestWallet: i18n('LND'),
      CoreLightningWallet: i18n('Core Lightning'),
    },
    default: undefined as any,
  }),
})

export const setLnImplementation = sdk.Action.withInput(
  // id
  'set-lightning-implementation',

  // metadata
  async ({ effects }) => ({
    name: i18n('Lightning Implementation'),
    description: i18n(
      'Select the Lightning Implementation for LNbits to utilize',
    ),
    warning: i18n(
      'If the LN implementation is changed after using LNBits this will delete all LNBits accounts and wallets related to the previously configured LN implementation! All LN funds will still be available on the underlying LN implementation.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const imp = await envFile
      .read((e) => e.LNBITS_BACKEND_WALLET_CLASS)
      .const(effects)

    if (!imp || imp === 'VoidWallet') return

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
      await access('/media/startos/volumes/main/database.sqlite3')
      if (configuredLnImplementation !== input.implementation) {
        console.log(
          i18n('Existing LN implementation does not match input. Resetting DB...'),
        )
        await rm('/media/startos/volumes/main/database.sqlite3')
      }
    } catch (error) {
      console.log(i18n('DB has not been initialized'))
    }

    await envFile.merge(effects, {
      LNBITS_BACKEND_WALLET_CLASS: input.implementation,
      LNBITS_ALLOWED_FUNDING_SOURCES: input.implementation,
    })
  },
)
