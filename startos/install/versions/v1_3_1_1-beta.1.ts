import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v1_3_1_1_beta1 = VersionInfo.of({
  version: '1.3.1:1-beta.1',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    down: IMPOSSIBLE,
  },
})
