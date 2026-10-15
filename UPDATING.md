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

Then read `check_funding_source` in the new version's `lnbits/app.py`. `fundingSourceMaxRetries` and `waitingRestartMs` in `startos/utils.ts` are derived from its retry budget (`funding_source_max_retries`) and its back-off (`min(0.25 * 2**n, 60)` seconds); if either changed, re-derive them. `main` sets the budget as `FUNDING_SOURCE_MAX_RETRIES`, which works only while LNbits lists the field among its read-only settings (`ReadOnlySettings` in `lnbits/settings.py`); if the field stops being read-only, the database row overrides the environment and `sync-funding-settings` has to pin it as well.
