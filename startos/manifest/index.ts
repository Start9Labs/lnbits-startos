import { setupManifest } from '@start9labs/start-sdk'
import { short, long, depClnTitle, depLndTitle } from './i18n'

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
      description: 'Optionally connect RTL to your CLN node.',
      optional: true,
      metadata: {
        title: depClnTitle,
        icon: 'https://github.com/Start9Labs/cln-startos/blob/master/icon.png',
      },
    },
    lnd: {
      description: 'Optionally connect RTL to your LND node.',
      optional: true,
      metadata: {
        title: depLndTitle,
        icon: 'https://github.com/Start9Labs/lnd-startos/blob/master/icon.png',
      },
    },
  },
})
