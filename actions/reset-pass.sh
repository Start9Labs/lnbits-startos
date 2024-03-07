#!/bin/bash 

set -e

SUPERUSER_ACCOUNT_ID=$(sqlite3 ./data/database.sqlite3 'select super_user from settings;')
ADMIN_PASS=$(cat /dev/urandom | base64 | head -c 24)
echo "$ADMIN_PASS" > /app/data/start9/admin_password.txt
CURRENT_DATETIME=$(date +%s)
PASS_HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$ADMIN_PASS'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))")

sqlite3 ./data/database.sqlite3 <<EOF
UPDATE accounts
SET pass = "$PASS_HASH",
  username = 'admin',
  updated_at = '$CURRENT_DATETIME'
WHERE id = "$SUPERUSER_ACCOUNT_ID";
EOF

action_result_complete="    {
    \"version\": \"0\",
    \"message\": \"Superuser Password has been reset to a newly generated random password available in Properties.\",
    \"value\": null,
    \"copyable\": false,
    \"qr\": false
}"

echo $action_result_complete