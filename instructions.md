# Overview

LNbits is a robust and versatile platform, serving as a comprehensive hub for Lightning Network functionality. For a complete list of its extensive features and detailed guides, please visit [LNbits.com](https://LNbits.com/).

## Using LNbits

To use LNbits, simply click `LAUNCH UI` where you will be prompted to login or register. StartOS automatically saves your wallet URLs and displays them in the `Properties` page of your LNbits service dashboard. If an existing LNbits account is already logged in, `LAUNCH UI` will open that account instead of prompting the user to login or register. If an account is already logged in and you would like to register another account, you will first need to log out of the other account. As a corollary, only one LNbits account can be logged into the same browser at a time. If a LNbits account is already logged in and the URL for a different account is opened you may encounter the error `Wallet not found` or the previously logged in account may be displayed - in either case hard refreshing the page will log in the account of the URL entered and log out the other account. 


## Superuser
LNbits includes a `Superuser Account` which can also be found in `Properties` along with the default username and password. This account can be used to manage the server, allowing the user to add extensions, topup wallets, etc.

The `Superuser Account` can also change the authentication required to access accounts. By default authentication is not required for users updating to 0.12.2, meaning accounts remain accessible via the URLs found in properties; accounts can also be accessed using username/password (provided these have been set). For fresh installations of 0.12.2 username and password are required by default. Allowed authentication methods can be updated by opening the Superuser account and navivating to `Server` > `Security`.

**Warning** If authentication is updated to only allow the `username-password` method, this will make any accounts which have not yet setup a username and password *inaccessible* until authentication is reverted to include the `user-id-only` method. Before changing the allowed authentication methods, it is highly recommended to ensure any existing accounts have been updated to include both a username and a password; login credentials should be stored securely (i.e. within Vaultwarden).

Documentation for using LNbits can be found [here](https://docs.start9.com/0.3.5.x/service-guides/lightning/connecting-lnbits#connecting-lnbits)
