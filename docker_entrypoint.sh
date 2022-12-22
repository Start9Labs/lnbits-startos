#!/bin/bash

set -e

export LND_PATH="/mnt/lnd/admin.macaroon"
export CLN_PATH="/mnt/c-lightning/"
export TOR_ADDRESS=$(yq e '.tor-address' /app/data/start9/config.yaml)
export LAN_ADDRESS=$(yq e '.lan-address' /app/data/start9/config.yaml)
export LNBITS_BACKEND_WALLET_CLASS=$(yq e '.wallet.type' /app/data/start9/config.yaml)
export FILE="/app/data/database.sqlite3"

sed -i 's|LNBITS_ADMIN_USERS.*|LNBITS_ADMIN_USERS="'$LNBITS_USERNAME'"|' /app/.env
sed -i 's|LNBITS_BACKEND_WALLET_CLASS=.*|LNBITS_BACKEND_WALLET_CLASS='$LNBITS_BACKEND_WALLET_CLASS'|' /app/.env

if [ -f $FILE ] ; then {
    echo "Looking for existing accounts and wallets..."
    sqlite3 ./data/database.sqlite3 'select id from accounts;' >> account.res
    mapfile -t LNBITS_ACCOUNTS <account.res
    echo "Found ${#LNBITS_ACCOUNTS[*]} LNBits account(s) on Embassy."
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
    echo "ERROR: A Lightning Node must be running on your Embassy in order to use LNBits."
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
        sqlite3 ./data/database.sqlite3 'select id from accounts;' > account.res
        mapfile -t LNBITS_ACCOUNTS <account.res
        echo 'version: 2' > /app/data/start9/stats.yaml
        echo 'data:' >> /app/data/start9/stats.yaml
        echo "  Superuser Account: " >> /app/data/start9/stats.yaml
            echo '    type: string' >> /app/data/start9/stats.yaml
            echo "    value: \"$SUPERUSER_ACCOUNT_URL_PROP\"" >> /app/data/start9/stats.yaml
            echo '    description: LNBits Superuser Account' >> /app/data/start9/stats.yaml
            echo '    copyable: true' >> /app/data/start9/stats.yaml
            echo '    masked: false' >> /app/data/start9/stats.yaml
            echo '    qr: true' >> /app/data/start9/stats.yaml
        # Iterate over the indices of the array in reverse order
        for i in $(seq $((${#LNBITS_ACCOUNTS[@]} - 1)) -1 0); do
            # Access the array element at the current index
            val=${LNBITS_ACCOUNTS[$i]} 
            ACCOUNT_URL_PROP="https://$LAN_ADDRESS/wallet?usr=$val"
            if ! [ "$SUPERUSER_ACCOUNT" = "$val" ] ; then 
                echo "  LNBits Account $val: " >> /app/data/start9/stats.yaml
                    echo '    type: string' >> /app/data/start9/stats.yaml
                    echo "    value: \"$ACCOUNT_URL_PROP\"" >> /app/data/start9/stats.yaml
                    echo '    description: LNBits Account' >> /app/data/start9/stats.yaml
                    echo '    copyable: true' >> /app/data/start9/stats.yaml
                    echo '    masked: false' >> /app/data/start9/stats.yaml
                    echo '    qr: true' >> /app/data/start9/stats.yaml
            fi
        done
    else 
        echo 'No accounts to populate'
    fi
    sleep 10
} done &

echo "Starting LNBits v0.9.5.1"

exec tini -p SIGTERM -- poetry run lnbits --port $LNBITS_PORT --host $LNBITS_HOST 
