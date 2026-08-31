import { setLnImplementation } from '../actions/lightningImplementation'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSetLnImplementation = sdk.setupOnInit(
  async (effects, kind) => {
    if (kind === 'install') {
      await sdk.action.createOwnTask(effects, setLnImplementation, 'critical', {
        reason: i18n('LNbits needs a funding source before it can start!'),
      })
    }
  },
)
