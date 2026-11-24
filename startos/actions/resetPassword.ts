import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { authKeyFile, db, mainMounts } from '../utils'

const { InputSpec, Value } = sdk

export const resetPassword = sdk.Action.withInput(
  // id
  'reset-password',

  // metadata
  {
    name: i18n('Reset Password'),
    description: i18n(
      'Reset Password for the super_user in the event of a lost or forgotten password',
    ),
    warning: i18n(
      "The super user's current password stops working. The new password is shown once and cannot be recovered afterwards.",
    ),
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  },

  InputSpec.of({
    signOutAll: Value.toggle({
      name: i18n('Sign Out All Sessions'),
      description: i18n(
        'Also sign out every browser and app signed in to LNbits by replacing the key that signs their sessions, then restart LNbits. Wallet API keys keep working; regenerate any that may have leaked in LNbits. Extensions that use this key break for data made before the change: Zapwall receipts and Tunnel Me Out client notes stop verifying.',
      ),
      default: false,
    }),
  }),

  async () => null,

  // the execution function
  async ({ effects, input }) => {
    const newPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,1-9,+,/',
      len: 22,
    })
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'lnbits' },
      mainMounts,
      'reset-pass',
      async (subc) => {
        const superuserAccountId = await subc.execFail([
          'sqlite3',
          db,
          "select value from system_settings where id = 'super_user';",
        ])

        const newPasswordHash = await subc.execFail([
          '/app/.venv/bin/python',
          '-c',
          `import bcrypt; print(bcrypt.hashpw('${newPassword}'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))`,
        ])

        const currentTime = await subc.execFail(['date', '+%s'])

        await subc.execFail([
          'sqlite3',
          db,
          `update accounts set password_hash = \"${newPasswordHash.stdout.toString().trimEnd()}\", updated_at = ${currentTime.stdout.toString().trimEnd()} where id = ${superuserAccountId.stdout.toString().trimEnd()};`,
        ])

        if (input.signOutAll) {
          await subc.execFail(['rm', '-f', authKeyFile])
        }
      },
    )
    if (input.signOutAll) await effects.restart()
    return {
      version: '1',
      title: i18n('Success'),
      message: input.signOutAll
        ? i18n(
            'The new Super User password is below. Every session was signed out and LNbits is restarting.',
          )
        : i18n(
            'The new Super User password is below. Browsers and apps already signed in stay signed in; run this action with Sign Out All Sessions on to sign them out.',
          ),
      result: {
        type: 'single',
        value: newPassword,
        masked: true,
        copyable: true,
        qr: false,
        launchable: false,
      },
    }
  },
)
