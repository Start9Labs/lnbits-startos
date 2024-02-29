#!/bin/bash 

set -e

SUPERUSER_ACCOUNT_ID=$(sqlite3 ./data/database.sqlite3 'select super_user from settings;')
DEFAULT_PASS=$(cat /app/data/start9/admin_password.txt)
CURRENT_DATETIME=$(date +%s)
PASS_HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$DEFAULT_PASS'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))")

sqlite3 ./data/database.sqlite3 <<EOF
UPDATE accounts
SET pass = "$PASS_HASH",
  username = 'admin',
  updated_at = '$CURRENT_DATETIME'
WHERE id = "$SUPERUSER_ACCOUNT_ID";
EOF

action_result_complete="    {
    \"version\": \"0\",
    \"message\": \"Superuser Password has been reset to the default password.  You can find this password within Properties.\",
    \"value\": null,
    \"copyable\": false,
    \"qr\": false
}"

echo $action_result_complete