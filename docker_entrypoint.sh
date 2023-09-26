#!/bin/bash

set -e

export LND_PATH="/mnt/lnd/admin.macaroon"
export CLN_PATH="/mnt/c-lightning/"
export TOR_ADDRESS=$(yq e '.tor-address' /app/data/start9/config.yaml)
export LAN_ADDRESS=$(yq e '.lan-address' /app/data/start9/config.yaml)
export LNBITS_BACKEND_WALLET_CLASS=$(yq e '.implementation' /app/data/start9/config.yaml)
export FILE="/app/data/database.sqlite3"
export CONFIG_LN_IMPLEMENTATION=$(yq e '.implementation' /app/data/start9/config.yaml)
sleep 16
sed -i 's|LNBITS_ADMIN_USERS.*|LNBITS_ADMIN_USERS="'$LNBITS_USERNAME'"|' /app/.env
sed -i 's|LNBITS_BACKEND_WALLET_CLASS=.*|LNBITS_BACKEND_WALLET_CLASS='$LNBITS_BACKEND_WALLET_CLASS'|' /app/.env
sleep 5

if [ -f $FILE ] ; then
    echo "Checking if underlying LN implementation has changed..."
    LNBITS_SETTINGS=$(sqlite3 ./data/database.sqlite3 'select editable_settings from settings;')
    EXISTING_CONFIG_LN_IMPLEMENTATION=$(echo "$LNBITS_SETTINGS" | sed -n 's/.*"lnbits_backend_wallet_class": "\([^"]*\)".*/\1/p')

    if [ "$CONFIG_LN_IMPLEMENTATION" != "$EXISTING_CONFIG_LN_IMPLEMENTATION" ]; then
        echo "Configured LN implementation is not the same as the existing LN implementation"
        echo "Deleting previous LN implementation data"
        rm $FILE
        rm /app/data/start9/stats.yaml
    fi
fi

if [ -f $FILE ] ; then {
    echo "Looking for existing accounts and wallets..."
    sqlite3 ./data/database.sqlite3 'select id from accounts;' >> account.res
    mapfile -t LNBITS_ACCOUNTS <account.res
    echo "Found ${#LNBITS_ACCOUNTS[*]} existing LNBits account(s)."
    echo "Navigate to the following URLs to access these accounts:"
    # Properties Page showing password to be used for login
    echo 'version: 2' > /app/data/start9/stats.yaml
    echo 'data:' >> /app/data/start9/stats.yaml
    for val in "${LNBITS_ACCOUNTS[@]}";
    do
        ACCOUNT_URL="http://$TOR_ADDRESS/wallet?usr=$val"
        printf "$ACCOUNT_URL\n"
    done
} else {
    echo 'No LNBits accounts found.'
} 
fi
sleep 5
if ! [ -f $LND_PATH ] && ! [ -d $CLN_PATH ]; then
    echo "ERROR: A Lightning Node must be running on your Start9 server in order to use LNBits."
    exit 1
elif ! [ -f $LND_PATH ] && [ $LNBITS_BACKEND_WALLET_CLASS == "LndRestWallet" ]; then
    echo "ERROR: Cannot find LND macaroon."
    exit 1
elif ! [ -d $CLN_PATH ] && [ $LNBITS_BACKEND_WALLET_CLASS == "CLightningWallet" ]; then 
    echo "ERROR: Cannot find Core Lightning path."
    exit 1 
fi

while true; do {
    # Properties Page showing password to be used for login
    if [ -f $FILE ] ; then 
        SUPERUSER_ACCOUNT=$(sqlite3 ./data/database.sqlite3 'select super_user from settings;')
        SUPERUSER_ACCOUNT_URL_PROP="https://$LAN_ADDRESS/wallet?usr=$SUPERUSER_ACCOUNT"
        SUPERUSER_ACCOUNT_URL_TOR="http://$TOR_ADDRESS/wallet?usr=$SUPERUSER_ACCOUNT"
        echo 'version: 2' > /app/data/start9/stats.yaml
        echo 'data:' >> /app/data/start9/stats.yaml
        echo "  Superuser Account: " >> /app/data/start9/stats.yaml
            echo '    type: string' >> /app/data/start9/stats.yaml
            echo "    value: \"$SUPERUSER_ACCOUNT_URL_PROP\"" >> /app/data/start9/stats.yaml
            echo '    description: LNBits Superuser Account' >> /app/data/start9/stats.yaml
            echo '    copyable: true' >> /app/data/start9/stats.yaml
            echo '    masked: false' >> /app/data/start9/stats.yaml
            echo '    qr: true' >> /app/data/start9/stats.yaml
        echo "  (Tor) Superuser Account: " >> /app/data/start9/stats.yaml
            echo '    type: string' >> /app/data/start9/stats.yaml
            echo "    value: \"$SUPERUSER_ACCOUNT_URL_TOR\"" >> /app/data/start9/stats.yaml
            echo '    description: LNBits Superuser Account' >> /app/data/start9/stats.yaml
            echo '    copyable: true' >> /app/data/start9/stats.yaml
            echo '    masked: false' >> /app/data/start9/stats.yaml
            echo '    qr: true' >> /app/data/start9/stats.yaml
        
        sqlite3 ./data/database.sqlite3 'select id from accounts;' > account.res
        mapfile -t LNBITS_ACCOUNTS <account.res 
        # Iterate over the indices of the array in reverse order
        for i in $(seq $((${#LNBITS_ACCOUNTS[@]} - 1)) -1 0); do {
            # Access the array element at the current index
            val=${LNBITS_ACCOUNTS[$i]} 
            # get wallets for this user account
            sqlite3 ./data/database.sqlite3 'select id from wallets where user="'$val'";' > wallet.res
            mapfile -t LNBITS_WALLETS <wallet.res 
            # Iterate over the indices of the array in reverse order
            for j in $(seq $((${#LNBITS_WALLETS[@]} - 1)) -1 0); do {
                # Access the array element at the current index

                export val2=${LNBITS_WALLETS[$j]}
                export ACCOUNT_URL_PROP="https://$LAN_ADDRESS/wallet?usr=$val&wal=$val2"
                export ACCOUNT_URL_TOR="http://$TOR_ADDRESS/wallet?usr=$val&wal=$val2"
                export LNBITS_WALLET_NAME=$(sqlite3 ./data/database.sqlite3 'select name from wallets where id="'$val2'";')

                if ! [ "$SUPERUSER_ACCOUNT" = "$val" ] && ! [ "${val2:0:4}" = "del:" ] ; then
                    echo "  LNBits Account $val - Wallet $LNBITS_WALLET_NAME: " >> /app/data/start9/stats.yaml
                        echo '    type: string' >> /app/data/start9/stats.yaml
                        echo "    value: \"$ACCOUNT_URL_PROP\"" >> /app/data/start9/stats.yaml
                        echo '    description: LNBits Account' >> /app/data/start9/stats.yaml
                        echo '    copyable: true' >> /app/data/start9/stats.yaml
                        echo '    masked: false' >> /app/data/start9/stats.yaml
                        echo '    qr: true' >> /app/data/start9/stats.yaml
                    echo "  (Tor) LNBits Account $val - Wallet $LNBITS_WALLET_NAME: " >> /app/data/start9/stats.yaml
                        echo '    type: string' >> /app/data/start9/stats.yaml
                        echo "    value: \"$ACCOUNT_URL_TOR\"" >> /app/data/start9/stats.yaml
                        echo '    description: LNBits Account' >> /app/data/start9/stats.yaml
                        echo '    copyable: true' >> /app/data/start9/stats.yaml
                        echo '    masked: false' >> /app/data/start9/stats.yaml
                        echo '    qr: true' >> /app/data/start9/stats.yaml
                fi
            }   done 
        }   done
    else 
        echo 'No accounts to populate'
    fi
    sleep 10
} done &

echo "Starting LNBits..."

exec tini -p SIGTERM -- poetry run lnbits --port $LNBITS_PORT --host $LNBITS_HOST 
