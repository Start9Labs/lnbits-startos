# Zeus with LNbits

**WARNING:** This is not the same as connecting Zeus directly to your lightning node - using LNbits allows us to allocate a specific amount of funds to Zeus instead of giving it full access to your lightning node. We can also use LNbits to permit Zeus to **just receive** satoshis, or the ability to both **receive and spend** satoshis.

**NOTE:** This guide assumes you have already setup LNbits as per [this guide](../instructions.md).

**WARNING:** This will not work with CLN as your underlying LN implementation!


1. Zeus requires that we use the LndHub extension in order to connect to LNbits. To install this, click **Extensions**, in the **ALL** tab find LndHub, click **MANAGE**, find the latest version and click **INSTALL**. Once installed, click **ENABLE**

1. Click **OPEN** *or* **LndHub** under *Extensions*

1. Make sure the wallet you want to use is selected below the two QR codes, we will use these in a moment.


1. Install [Zeus](https://zeusln.app/) if you haven't already.

1. In Zeus, if you are using it for the first time, tap "Scan node config". Allow camera access, scan the QR code, and then tap 'Save node config'. Zeus will fill in your node details based on the information in the QR code. If you already have other nodes configured in Zeus, go to Settings > Connect a node > + . But before you scan anything...

1. *If you only want this wallet to be able to RECEIVE PAYMENTS, scan the "Invoice" QR code*
   *If you are happy for this wallet to be able to both receive and MAKE payments scan the "Admin" QR code*

1. Once scanned, name the wallet if you wish, then hit **SAVE NODE CONFIG**.


Congratulations! Zeus is set up and ready to use lightning via your own lightning node - furthermore it will only be able to use your node in the way you allow it, via LNbits.
