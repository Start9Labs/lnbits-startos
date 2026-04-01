import { envFile } from '../fileModels/env'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await envFile.merge(effects, {
      LNBITS_BACKEND_WALLET_CLASS: 'VoidWallet',
    })
  } else {
    await envFile.merge(effects, {})
  }
})
