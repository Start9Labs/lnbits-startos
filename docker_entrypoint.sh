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

if [ -f $FILE ]; then
    echo "Checking if underlying LN implementation has changed..."
    LNBITS_SETTINGS=$(sqlite3 ./data/database.sqlite3 'select editable_settings from settings;')
    EXISTING_CONFIG_LN_IMPLEMENTATION=$(echo "$LNBITS_SETTINGS" | sed -n 's/.*"lnbits_backend_wallet_class": "\([^"]*\)".*/\1/p')

    if [ "$LNBITS_BACKEND_WALLET_CLASS" != "$EXISTING_CONFIG_LN_IMPLEMENTATION" ]; then
        echo "Configured LN implementation is not the same as the existing LN implementation"
        echo "Deleting previous LN implementation data"
        rm $FILE
        rm /app/data/start9/stats.yaml
    fi
fi

if [ -f $FILE ]; then {
    echo "Looking for existing accounts and wallets..."
    sqlite3 ./data/database.sqlite3 'select id from accounts;' >>account.res
    mapfile -t LNBITS_ACCOUNTS <account.res
    echo "Found ${#LNBITS_ACCOUNTS[*]} existing LNBits account(s)."
    echo "Navigate to the following URLs to access these accounts:"
    for USER_ID in "${LNBITS_ACCOUNTS[@]}"; do
        ACCOUNT_URL="http://$TOR_ADDRESS/wallet?usr=$USER_ID"
        printf "$ACCOUNT_URL\n"
    done
}; else
    {
        echo 'No LNBits accounts found.'
    }
fi

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
            SUPERUSER_ACCOUNT=$(sqlite3 ./data/database.sqlite3 'select super_user from settings;')
            SUPERUSER_ACCOUNT_URL_PROP="https://$LAN_ADDRESS/wallet?usr=$SUPERUSER_ACCOUNT"
            SUPERUSER_ACCOUNT_URL_TOR="http://$TOR_ADDRESS/wallet?usr=$SUPERUSER_ACCOUNT"
            LNBITS_SETTINGS=$(sqlite3 ./data/database.sqlite3 'select editable_settings from settings;')
            PUBLIC_UI=$(echo "$LNBITS_SETTINGS" | jq ".lnbits_public_node_ui")

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
        else
            echo 'No accounts to populate'
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

while ! [ -f $FILE ]; do {
  echo "Waiting for DB to be created..."
  sleep 10
}; done

SUPERUSER_ACCOUNT_ID=$(sqlite3 ./data/database.sqlite3 'select super_user from settings;')
SUPERUSER_NAME=$(sqlite3 ./data/database.sqlite3 "select username from accounts where id = '$SUPERUSER_ACCOUNT_ID'")

# Initialize Admin Auth
if [ "$SUPERUSER_NAME" == "" ]; then
  OLD_SUPERUSER_EXTRA=$(sqlite3 ./data/database.sqlite3 "select extra from accounts where id = '$SUPERUSER_ACCOUNT_ID'")
  CURRENT_DATETIME=$(date +%s)
  ADMIN_PASS=$(cat /dev/urandom | base64 | head -c 24)
  touch /app/data/start9/admin_password.txt
  echo "$ADMIN_PASS" > /app/data/start9/admin_password.txt
  PASS_HASH=$(python3 -c "import bcrypt; print(bcrypt.hashpw('$ADMIN_PASS'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'))")
  NEW_SUPERUSER_EXTRA=$(echo "$OLD_SUPERUSER_EXTRA" | jq -c '.provider = "lnbits"')
  sqlite3 ./data/database.sqlite3 <<EOF
  UPDATE accounts
  SET pass = "$PASS_HASH",
      username = 'admin',
      extra = '$NEW_SUPERUSER_EXTRA',
      updated_at = '$CURRENT_DATETIME'
  WHERE id = "$SUPERUSER_ACCOUNT_ID";
EOF
  tini -s
fi

ADMIN_PASS=$(cat /app/data/start9/admin_password.txt)

configurator &

# Set up a signal trap and wait for processes to finish
trap _term TERM
wait $lnbits_process
