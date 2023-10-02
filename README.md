# Wrapper for lnbits

lnbits-startos contains the [lnbits](https://github.com/lnbits/lnbits) software packaged to run on StartOS. You can run lnbits on StartOS by installing a .s9pk file, or you can build your own .s9pk file by following the instuctions below.

## Build environment
Before building the lnbits package, your build environment must be setup for building StartOS services. Instructions for setting up the proper build environment can be found in the [Developer Docs](https://docs.start9.com/latest/developer-docs/packaging).

## Cloning

Clone the project locally. 

```
git clone https://github.com/Start9Labs/lnbits-wrapper.git
cd lnbits-wrapper
```

## Building

To build the **lnbits** service as a universal package, run the following command:

```
make
```

Alternatively the package can be built for individual architectures by specifying the architecture as follows:

```
make x86
```

or

```
make arm
```

## Installing (on StartOS)

Run the following commands to determine successful install:
> :information_source: Change server-name.local to your Start9 server address

```
start-cli auth login
#Enter your StartOS password
start-cli --host https://server-name.local package install lnbits.s9pk
```
**Tip:** You can also install the lnbits.s9pk using **Sideload Service** under the **StartOS > SETTINGS** section.
## Verify Install

Go to your StartOS Services page, select **lnbits**, configure and start the service.

**Done!** 
