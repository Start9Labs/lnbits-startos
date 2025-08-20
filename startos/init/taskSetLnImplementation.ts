import { setLnImplementation } from '../actions/lightningImplementation'
import { sdk } from '../sdk'

export const taskSetLnImplementation = sdk.setupOnInit(
  async (effects, kind) => {
    if (kind === 'install') {
      await sdk.action.createOwnTask(effects, setLnImplementation, 'critical', {
        reason: 'LNbits requires an underlying Lightning node!',
      })
    }
  },
)
