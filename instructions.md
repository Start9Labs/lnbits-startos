# Overview

LNbits is a robust and versatile platform, serving as a comprehensive hub for Lightning Network functionality. For a complete list of its extensive features and detailed guides, please visit [LNbits.com](https://LNbits.com/).

## Using LNbits

To use LNbits, simply click `LAUNCH UI` where you will be prompted to login or register. The first account registered will be the `Superuser Account` which has special privileges for managing the server (more on this below). StartOS automatically saves your wallet URLs and displays them in the `Properties` page of your LNbits service dashboard. If an existing LNbits account is already logged in, `LAUNCH UI` will open that account instead of prompting the user to login or register. If an account is already logged in and you would like to add another account, you will first need to log out of the other account. As a corollary, only one LNbits account can be logged into the same browser at a time. If an LNbits account is already logged in and the URL for a different account is opened you may encounter the error `Wallet not found` or the previously logged in account may be displayed - in either case hard refreshing the page will log in the account of the URL and log out the other account. 


## Superuser
LNbits includes a `Superuser Account` which can also be found in `Properties`. This account can be used to manage the server, allowing the user to add extensions, topup wallets, etc.

The `Superuser Account` can also change the authentication required to access accounts. By default authentication is not required, meaning accounts can be accessed via the URLs found in properties (`user-id-only` method under the `Server` > `Security` settings).

**Warning** If authentication is updated to only allow the `username-password` method, this will make any accounts which have not yet setup a username and password *inaccessible* until authentication is reverted to include the `user-id-only` method. If the Superuser does not have a username and password, this could result in the Superuser being locked out! When changing the allowed authentication methods, it is highly recommended to ensure any existing accounts **(especially the Superuser)** have been updated to include both a username and a password.

Documentation for using LNbits can be found [here](https://docs.start9.com/0.3.5.x/service-guides/lightning/connecting-lnbits#connecting-lnbits)
