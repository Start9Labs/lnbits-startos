# BlueWallet  with LNbits


**WARNING:** This is not the same as connecting BlueWallet directly to your lightning node - using LNbits allows us to allocate a specific amount of funds to BlueWallet instead of giving it full access to your lightning node. We can also use LNbits to permit BlueWallet to **just receive** satoshis, or the ability to both **receive and spend** satoshis.

**NOTE:** This guide assumes you have already setup LNbits as per [this guide](../instructions.md).

**WARNING:** This will not work with CLN as your underlying LN implementation!


1. BlueWallet requires that we use the LndHub extension in order to connect to LNbits. To install this, click **Extensions**, in the **ALL** tab find LndHub, click **MANAGE**, find the latest version and click **INSTALL**. Once installed, click **ENABLE**

1. Click **OPEN** *or* **LndHub** under *Extensions*

1. Make sure the wallet you want to use is selected below the two QR codes, we will use these in a moment.

1. Install [BlueWallet](https://bluewallet.io/) if you haven't already.

1. Go to Import wallet on BlueWallet, then click on *Scan or import a file*.

1. *If you only want this wallet to be able to RECEIVE PAYMENTS, scan the "Invoice" QR code*
   *If you are happy for this wallet to be able to both receive and MAKE payments scan the "Admin" QR code*


Congratulations! BlueWallet is set up and ready to use lightning via your own lightning node - furthermore it will only be able to use your node in the way you allow it, via LNbits.