import { setupManifest } from '@start9labs/start-sdk'
import { depClnDescription, depLndDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'lnbits',
  title: 'LNbits',
  license: 'mit',
  packageRepo: 'https://github.com/Start9Labs/lnbits-startos',
  upstreamRepo: 'https://github.com/lnbits/lnbits',
  marketingUrl: 'https://lnbits.com/',
  donationUrl: 'https://demo.lnbits.com/tipjar/DwaUiE4kBX6mUW6pj3X5Kg',
  description: { short, long },
  volumes: ['main'],
  images: {
    lnbits: {
      source: {
        dockerBuild: {},
      },
      arch: ['aarch64', 'x86_64'],
    },
  },
  dependencies: {
    'c-lightning': {
      description: depClnDescription,
      optional: true,
      metadata: {
        title: 'Core Lightning',
        icon: 'https://raw.githubusercontent.com/Start9Labs/cln-startos/refs/heads/master/icon.svg',
      },
    },
    lnd: {
      description: depLndDescription,
      optional: true,
      metadata: {
        title: 'LND',
        icon: 'https://raw.githubusercontent.com/Start9Labs/lnd-startos/refs/heads/master/icon.svg',
      },
    },
  },
})
