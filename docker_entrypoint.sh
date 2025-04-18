#!/bin/bash

set -e

# Handle termination signals
_term() {
    echo "Received termination signal!"
    kill -TERM "$lnbits_process" 2>/dev/null
}

export LND_PATH="/mnt/lnd/admin.macaroon"
export CLN_PATH="/mnt/c-lightning/"
export TOR_ADDRESS=$(yq e '.tor-address' /app/data/start9/config.yaml)
export LAN_ADDRESS=$(yq e '.lan-address' /app/data/start9/config.yaml)
export LNBITS_BACKEND_WALLET_CLASS=$(yq e '.implementation' /app/data/start9/config.yaml)
export FILE="/app/data/database.sqlite3"
MACAROON_HEADER=""

sed -i 's|LNBITS_BACKEND_WALLET_CLASS=.*|LNBITS_BACKEND_WALLET_CLASS='$LNBITS_BACKEND_WALLET_CLASS'|' /app/.env
sed -i 's|LNBITS_ALLOWED_FUNDING_SOURCES=.*|LNBITS_ALLOWED_FUNDING_SOURCES="'$LNBITS_BACKEND_WALLET_CLASS'"|' /app/.env

if [ $LNBITS_BACKEND_WALLET_CLASS == "LndRestWallet" ]; then
    MACAROON_HEADER="Grpc-Metadata-macaroon: $(xxd -ps -u -c 1000 /mnt/lnd/admin.macaroon)"
    if ! [ -f $LND_PATH ]; then
        echo "ERROR: Cannot find LND macaroon."
        exit 1
    fi
elif [ $LNBITS_BACKEND_WALLET_CLASS == "CLightningWallet" ]; then
    if ! [ -d $CLN_PATH ]; then
        echo "ERROR: Cannot find Core Lightning path."
        exit 1
    fi
fi

configurator() {
    while true; do {
        # Properties Page showing password to be used for login
        if [ -f $FILE ]; then
            SUPERUSER_ACCOUNT=$(sqlite3 ./data/database.sqlite3 "select value from system_settings where id = 'super_user';")
            SUPERUSER_ACCOUNT_URL_PROP="https://$LAN_ADDRESS/wallet?usr=$SUPERUSER_ACCOUNT"
            SUPERUSER_ACCOUNT_URL_TOR="http://$TOR_ADDRESS/wallet?usr=$SUPERUSER_ACCOUNT"
            ADMIN_PASS=$(cat /app/data/start9/admin_password.txt)
            PUBLIC_UI=$(sqlite3 ./data/database.sqlite3 "select value from system_settings where id = 'lnbits_public_node_ui';")
            USER_ID_ONLY=$(sqlite3 ./data/database.sqlite3 "select value from system_settings where id = 'auth_allowed_methods';" | jq 'any(index("user-id-only"))')

            echo 'version: 2' >/app/data/start9/stats.yaml
            echo 'data:' >>/app/data/start9/stats.yaml

            # Admin Credentials
            echo "  Superuser Username: " >>/app/data/start9/stats.yaml
            echo '    type: string' >>/app/data/start9/stats.yaml
            echo '    value: admin' >>/app/data/start9/stats.yaml
            echo '    description: LNBits Superuser Account Username' >>/app/data/start9/stats.yaml
            echo '    copyable: true' >>/app/data/start9/stats.yaml
            echo '    masked: false' >>/app/data/start9/stats.yaml
            echo '    qr: false' >>/app/data/start9/stats.yaml
            echo "  Superuser Default Password: " >>/app/data/start9/stats.yaml
            echo '    type: string' >>/app/data/start9/stats.yaml
            echo "    value: $ADMIN_PASS" >>/app/data/start9/stats.yaml
            echo '    description: LNBits Superuser Account Password' >>/app/data/start9/stats.yaml
            echo '    copyable: true' >>/app/data/start9/stats.yaml
            echo '    masked: true' >>/app/data/start9/stats.yaml
            echo '    qr: false' >>/app/data/start9/stats.yaml

            # Node UI
            if [ "$PUBLIC_UI" == "true" ]; then
                echo "  Public Node UI:" >>/app/data/start9/stats.yaml
                echo '    type: string' >>/app/data/start9/stats.yaml
                echo "    value: \"http://$TOR_ADDRESS/node/public\"" >>/app/data/start9/stats.yaml
                echo '    description: The URL of your LNbits Public Node UI. Share this URL with others so they can see basic information about your LN node.' >>/app/data/start9/stats.yaml
                echo '    copyable: true' >>/app/data/start9/stats.yaml
                echo '    masked: false' >>/app/data/start9/stats.yaml
                echo '    qr: true' >>/app/data/start9/stats.yaml
            fi
            
            if [ "$USER_ID_ONLY" == "true" ]; then
              echo "  Superuser Account: " >>/app/data/start9/stats.yaml
              echo '    type: string' >>/app/data/start9/stats.yaml
              echo "    value: \"$SUPERUSER_ACCOUNT_URL_PROP\"" >>/app/data/start9/stats.yaml
              echo '    description: LNBits Superuser Account' >>/app/data/start9/stats.yaml
              echo '    copyable: true' >>/app/data/start9/stats.yaml
              echo '    masked: true' >>/app/data/start9/stats.yaml
              echo '    qr: true' >>/app/data/start9/stats.yaml
              echo "  (Tor) Superuser Account: " >>/app/data/start9/stats.yaml
              echo '    type: string' >>/app/data/start9/stats.yaml
              echo "    value: \"$SUPERUSER_ACCOUNT_URL_TOR\"" >>/app/data/start9/stats.yaml
              echo '    description: LNBits Superuser Account' >>/app/data/start9/stats.yaml
              echo '    copyable: true' >>/app/data/start9/stats.yaml
              echo '    masked: true' >>/app/data/start9/stats.yaml
              echo '    qr: true' >>/app/data/start9/stats.yaml

              sqlite3 ./data/database.sqlite3 'select id from accounts;' >account.res
              mapfile -t LNBITS_ACCOUNTS <account.res
              # Iterate over the indices of the array in reverse order
              for i in $(seq $((${#LNBITS_ACCOUNTS[@]} - 1)) -1 0); do {
                  # Access the array element at the current index
                  USER_ID=${LNBITS_ACCOUNTS[$i]}
                  # get wallets for this user account
                  sqlite3 ./data/database.sqlite3 'select id from wallets where user="'$USER_ID'";' >wallet.res
                  mapfile -t LNBITS_WALLETS <wallet.res
                  # Iterate over the indices of the array in reverse order
                  for j in $(seq $((${#LNBITS_WALLETS[@]} - 1)) -1 0); do {
                      # Access the array element at the current index

                      export WALLET_ID=${LNBITS_WALLETS[$j]}
                      export ACCOUNT_URL_PROP="https://$LAN_ADDRESS/wallet?usr=$USER_ID&wal=$WALLET_ID"
                      export ACCOUNT_URL_TOR="http://$TOR_ADDRESS/wallet?usr=$USER_ID&wal=$WALLET_ID"
                      export LNBITS_WALLET_NAME=$(sqlite3 ./data/database.sqlite3 'select name from wallets where id="'$WALLET_ID'";')
                      export LNBITS_WALLET_DELETED=$(sqlite3 ./data/database.sqlite3 'select deleted from wallets where id="'$WALLET_ID'";')

                      if ! [ "$SUPERUSER_ACCOUNT" = "$USER_ID" ] && [ $LNBITS_WALLET_DELETED = 0 ]; then
                          echo "  LNBits Account $USER_ID - Wallet $LNBITS_WALLET_NAME: " >>/app/data/start9/stats.yaml
                          echo '    type: string' >>/app/data/start9/stats.yaml
                          echo "    value: \"$ACCOUNT_URL_PROP\"" >>/app/data/start9/stats.yaml
                          echo '    description: LNBits Account' >>/app/data/start9/stats.yaml
                          echo '    copyable: true' >>/app/data/start9/stats.yaml
                          echo '    masked: true' >>/app/data/start9/stats.yaml
                          echo '    qr: true' >>/app/data/start9/stats.yaml
                          echo "  (Tor) LNBits Account $USER_ID - Wallet $LNBITS_WALLET_NAME: " >>/app/data/start9/stats.yaml
                          echo '    type: string' >>/app/data/start9/stats.yaml
                          echo "    value: \"$ACCOUNT_URL_TOR\"" >>/app/data/start9/stats.yaml
                          echo '    description: LNBits Account' >>/app/data/start9/stats.yaml
                          echo '    copyable: true' >>/app/data/start9/stats.yaml
                          echo '    masked: true' >>/app/data/start9/stats.yaml
                          echo '    qr: true' >>/app/data/start9/stats.yaml
                      fi
                  }; done
              }; done
            fi
        else
            echo 'No existing database found.'
        fi
        sleep 10
    }; done
}

printf "\n\n [i] Starting LNBits...\n\n"

if [ "$CONFIG_LN_IMPLEMENTATION" = "LndRestWallet" ]; then
    until curl --silent --fail --cacert /mnt/lnd/tls.cert --header "$MACAROON_HEADER" https://lnd.embassy:8080/v1/getinfo &>/dev/null
    do
        echo "LND Server is unreachable. Are you sure the LND service is running?" 
        sleep 5
    done
fi

poetry run lnbits --port $LNBITS_PORT --host $LNBITS_HOST &
lnbits_process=$!

until (
  sqlite3 ./data/database.sqlite3 'PRAGMA table_info(system_settings);' 2>/dev/null | grep -q "value"
); do
  echo "Waiting for migrations to complete..."
  sleep 10
done

if [ -f $FILE ]; then
    echo "Checking if underlying LN implementation has changed..."
    EXISTING_CONFIG_LN_IMPLEMENTATION=$(sqlite3 ./data/database.sqlite3 "select value from system_settings where id = 'lnbits_backend_wallet_class';")
    echo "LNBITS_BACKEND_WALLET_CLASS: $LNBITS_BACKEND_WALLET_CLASS"
    echo "EXISTING_CONFIG_LN_IMPLEMENTATION: $EXISTING_CONFIG_LN_IMPLEMENTATION"

    if [ "\"$LNBITS_BACKEND_WALLET_CLASS\"" != "$EXISTING_CONFIG_LN_IMPLEMENTATION" ]; then
        echo "Configured LN implementation is not the same as the existing LN implementation"
        echo "Deleting previous LN implementation data"
        rm $FILE
        rm /app/data/start9/stats.yaml
    else
        echo "Looking for existing accounts and wallets..."
        sqlite3 ./data/database.sqlite3 'select id from accounts;' >>account.res
        mapfile -t LNBITS_ACCOUNTS <account.res
        echo "Found ${#LNBITS_ACCOUNTS[*]} existing LNBits account(s)."
    fi
    # Create flag for Auth Initilization
    if ! [ -f '/app/data/start9/auth_initialized' ]; then
      touch /app/data/start9/auth_initialized
    fi
else
    echo "No existing database found. Starting LNbits with a new database using $LNBITS_BACKEND_WALLET_CLASS"
fi

# Set Auth to username-password for fresh installs
if ! [ -f '/app/data/start9/auth_initialized' ]; then
  sqlite3 ./data/database.sqlite3 <<EOF
  update system_settings
  set value = '["username-password"]'
  where id = 'auth_allowed_methods';
EOF
  touch /app/data/start9/auth_initialized
fi

SUPERUSER_ACCOUNT_ID=$(sqlite3 ./data/database.sqlite3 "select value from system_settings where id = 'super_user';")
SUPERUSER_NAME=$(sqlite3 ./data/database.sqlite3 "select username from accounts where id = $SUPERUSER_ACCOUNT_ID;")

# Initialize Admin Auth
if [ "$SUPERUSER_NAME" == "" ]; then
  OLD_SUPERUSER_EXTRA=$(sqlite3 ./data/database.sqlite3 "select extra from accounts where id = $SUPERUSER_ACCOUNT_ID;")
  CURRENT_DATETIME=$(date +%s)
  ADMIN_PASS=$(cat /dev/urandom | base64 | head -c 24)
  touch /app/data/start9/admin_password.txt
  echo "$ADMIN_PASS" > /app/data/start9/admin_password.txt
  PASS_HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$ADMIN_PASS'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))")
  NEW_SUPERUSER_EXTRA=$(echo $OLD_SUPERUSER_EXTRA | jq -c '.provider = "lnbits"')
  sqlite3 ./data/database.sqlite3 <<EOF
  UPDATE accounts
  SET password_hash = "$PASS_HASH",
      username = 'admin',
      extra = '$NEW_SUPERUSER_EXTRA',
      updated_at = $CURRENT_DATETIME
  WHERE id = $SUPERUSER_ACCOUNT_ID;
EOF
  echo "Restarting LNbits to save Admin username and password"
  tini -s 2>/dev/null
fi

configurator &

# Set up a signal trap and wait for processes to finish
trap _term TERM
wait $lnbits_process
