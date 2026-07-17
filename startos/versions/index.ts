import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_1_5_5_0 } from './v1.5.5_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_1_5_5_0],
})
