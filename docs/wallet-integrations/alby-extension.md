# Alby Browser Extension with LNbits

Alby is a browser extension that can be connected to your lightning node a number of ways. This guide will go over connecting Alby to your **LNbits wallet** which allows allocation of funds.


**NOTE:** This guide assumes you have already setup LNbits as per [this guide](../instructions.md).


1. Download the Alby extension by visiting the [Alby Github](https://github.com/getAlby/lightning-browser-extension#installation), selecting your browser, and installing.

1. Create a strong "unlock" password and store it somewhere safe, like your Vaultwarden password manager.

1. On the next screen, in **Bring Your Own Wallet**, click **Find Your Wallet**.

1. Click **StartOS** first, then **LNbits**.

1. You will be asked to add the *LNbits Admin Key*. 

1. Head back to LNbits and select the wallet you want to use then click on the arrow to the right of **Node URL, API keys and API docs** to expand the details.

1. Copy the **Admin key** and paste it into Alby.

1. If you have opened the LNbits web UI via your preferred interface (IP, .local, clearnet) you can copy the Node URL from the same section of LNbits. Otherwise head back to your StartOS LNbits service page, the Interfaces section, and choose the one you prefer.

1. Click **Continue**. Once the connection is completed you will see a success page that displays the balance of your LNbits wallet.

You’re now setup with Alby and LNbits!
