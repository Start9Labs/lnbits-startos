import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../install/versionGraph'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { taskSetLnImplementation } from './taskSetLnImplementation'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  setDependencies,
  actions,
  taskSetLnImplementation,
)

export const uninit = sdk.setupUninit(versionGraph)
