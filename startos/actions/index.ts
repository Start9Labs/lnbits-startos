import { sdk } from '../sdk'
import { setLnImplementation } from './lightningImplementation'
import { resetPassword } from './resetPassword'

export const actions = sdk.Actions.of()
  .addAction(setLnImplementation)
  .addAction(resetPassword)
