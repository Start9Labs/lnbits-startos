# Updating the upstream version

## Determining the upstream version

**LNbits** — [lnbits/lnbits](https://github.com/lnbits/lnbits)

```sh
gh release view -R lnbits/lnbits --json tagName -q .tagName
```

The current pin lives in `Dockerfile` on the two `FROM lnbits/lnbits:v<version>` lines (builder and final stages). Confirm a matching `v<version>` tag exists on Docker Hub:

```sh
curl -fsSL "https://hub.docker.com/v2/repositories/lnbits/lnbits/tags?page_size=20&ordering=last_updated" | jq -r '.results[].name'
```

## Applying the bump

Update both `FROM lnbits/lnbits:v<version>` lines in `Dockerfile` — the `builder` and `final` stages must stay on the same version.
