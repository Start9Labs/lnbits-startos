import { setupManifest } from '@start9labs/start-sdk'
import { short, long } from './i18n'

export const manifest = setupManifest({
  id: 'lnbits',
  title: 'LNbits',
  license: 'mit',
  wrapperRepo: 'https://github.com/Start9Labs/lnbits-startos',
  upstreamRepo: 'https://github.com/lnbits/lnbits',
  supportSite: 'https://github.com/lnbits/lnbits/issues',
  marketingSite: 'https://lnbits.com/',
  donationUrl: 'https://demo.lnbits.com/tipjar/DwaUiE4kBX6mUW6pj3X5Kg',
  docsUrl:
    'https://github.com/Start9Labs/lnbits-startos/blob/master/instructions.md',
  description: { short, long },
  volumes: ['main'],
  images: {
    lnbits: {
      source: {
        dockerBuild: {},
      },
    },
  },
  dependencies: {
    'c-lightning': {
      description: 'Optionally connect LNbits to your CLN node.',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/cln-startos/releases/download/v25.12.0_1-beta.1/c-lightning.s9pk',
    },
    lnd: {
      description: 'Optionally connect LNbits to your LND node.',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/lnd-startos/releases/download/v0.20.0-beta.1-beta.2/lnd.s9pk',
    },
  },
})
