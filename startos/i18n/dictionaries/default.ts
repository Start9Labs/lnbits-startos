export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting LNbits!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of LNbits': 5,

  // actions/lightningImplementation.ts
  'Lightning Implementation': 6,
  'The underlying Lightning implementation, currently LND or Core Lightning (CLN)': 7,
  'LND': 8,
  'Core Lightning': 9,
  'Select the Lightning Implementation for LNbits to utilize': 10,
  'If the LN implementation is changed after using LNBits this will delete all LNBits accounts and wallets related to the previously configured LN implementation! All LN funds will still be available on the underlying LN implementation.': 11,
  'Existing LN implementation does not match input. Resetting DB...': 17,
  'DB has not been initialized': 18,

  // actions/resetPassword.ts
  'Reset Password': 12,
  'Reset Password for the super_user in the event of a lost or forgotten password': 13,
  'Success': 14,
  'The new Super User password is below': 15,

  // init/taskSetLnImplementation.ts
  'LNbits requires an underlying Lightning node!': 16,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
