import { sdk } from '../sdk'
import { db, mainMounts, randomPassword } from '../utils'
import { utils } from '@start9labs/start-sdk'

export const resetPassword = sdk.Action.withoutInput(
  // id
  'reset-password',

  // metadata
  async ({ effects }) => ({
    name: 'Reset Password',
    description:
      'Reset Password for the super_user in the event of a lost or forgotten password',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  // the execution function
  async ({ effects }) => {
    const newPassword = utils.getDefaultString(randomPassword)
    const res = await sdk.SubContainer.withTemp(
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
          'python3',
          '-c',
          `import bcrypt; print(bcrypt.hashpw('${newPassword}'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))`,
        ])

        const currentTime = await subc.execFail(['date', '+%s'])

        await subc.execFail([
          'sqlite3',
          db,
          `update accounts set password_hash = \"${newPasswordHash.stdout.toString().trimEnd()}\", updated_at = ${currentTime.stdout.toString().trimEnd()} where id = ${superuserAccountId.stdout.toString().trimEnd()};`,
        ])

        return await subc.execFail([
          'sqlite3',
          db,
          `select username from accounts where id = ${superuserAccountId.stdout.toString().trimEnd()};`,
        ])
      },
    )
    return {
      version: '1',
      title: 'Success',
      message: `The new Super User password for '${res.stdout}' is below`,
      result: {
        type: 'single',
        value: newPassword,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
