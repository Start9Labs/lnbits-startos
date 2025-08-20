import { VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { envFile } from '../fileModels/env'
import { envDefaults } from '../utils'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects) => {
    const existingEnv = await envFile.read().once()

    if (!existingEnv) {
      await envFile.write(effects, envDefaults)
    }
  },
})
