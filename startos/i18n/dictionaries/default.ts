export const DEFAULT_LANG = 'en_US'

const dict = {
  'Core Lightning': 0,
  'Could not read the phoenixd http-password': 1,
  'DB has not been initialized': 2,
  Eclair: 3,
  'Eclair has no API password set. Run its Set API Password action first.': 4,
  'Eclair is not yet reachable on the internal network. Ensure Eclair is installed and running.': 5,
  'Existing LN implementation does not match input. Resetting DB...': 6,
  'If the LN implementation is changed after using LNbits this will delete all LNbits accounts and wallets related to the previously configured LN implementation! All LN funds will still be available on the underlying LN implementation.': 7,
  LND: 8,
  'LNbits needs a funding source before it can start!': 9,
  'Lightning Implementation': 10,
  'None / External': 11,
  'Reset Password': 12,
  'Reset Password for the super_user in the event of a lost or forgotten password': 13,
  'Select the Lightning Implementation for LNbits to utilize': 14,
  'Starting LNbits!': 15,
  Success: 16,
  'The Lightning node LNbits draws on for funds. LND, Core Lightning, phoenixd and Eclair are the nodes StartOS packages, and the package wires the connection up for you. "None / External" leaves the funding source to you: pick and configure it from LNbits\' own Admin UI, including nodes elsewhere and third-party custodial services.': 17,
  'The new Super User password is below': 18,
  'The web interface is not ready': 19,
  'The web interface is ready': 20,
  'The web interface of LNbits': 21,
  'Web Interface': 22,
  'Web UI': 23,
  phoenixd: 24,
  'phoenixd is not yet reachable on the internal network. Ensure phoenixd is installed and running.': 25,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
