import { setupManifest } from '@start9labs/start-sdk'

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
  description: {
    short: 'Free and open-source lightning-network wallet/accounts system.',
    long: 'A very simple Python server that sits on top of any funding source, and can be used as an accounts system, extendable platform, development stack, fallback wallet or even instant wallet for LN demonstrations',
  },
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
      s9pk: 'https://github.com/Start9Labs/cln-startos/releases/download/v25.12.0.1-beta.0/c-lightning.s9pk',
    },
    lnd: {
      description: 'Optionally connect RTL to your LND node.',
      optional: true,
      s9pk: 'https://github.com/Start9Labs/lnd-startos/releases/download/v0.20.0-beta.1-beta.1/lnd.s9pk',
    },
  },
})
