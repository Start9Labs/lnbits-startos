#!/bin/bash

DURATION=$(</dev/stdin)
if (($DURATION <= 9000)); then
    exit 60
else
    if ! curl --silent --fail lnbits.embassy:5000 &>/dev/null; then
        echo "LNBits Web interface is unreachable" >&2
        exit 1
    fi
fi
