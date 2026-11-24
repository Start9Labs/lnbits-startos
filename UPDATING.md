# Updating the upstream version

## Determining the upstream version

**LNbits** — [lnbits/lnbits](https://github.com/lnbits/lnbits)

List stable version tags newest first, rather than following GitHub's Latest marker:

```sh
gh api --paginate 'repos/lnbits/lnbits/tags?per_page=100' --jq '.[].name' \
  | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -Vr
```

Choose the first tag with a published Docker image for both `linux/amd64` and `linux/arm64`:

```sh
tag='<candidate-tag>'
docker buildx imagetools inspect "lnbits/lnbits:$tag"
```

The current pin lives in `Dockerfile` on its `FROM lnbits/lnbits:v<version>` line.

## Applying the bump

Update the `FROM lnbits/lnbits:v<version>` line in `Dockerfile`.

The `uv pip install` replaces the Pillow upstream locks in `/app/.venv`. Read the selected tag's lock:

```sh
gh api -H 'Accept: application/vnd.github.raw' "repos/lnbits/lnbits/contents/uv.lock?ref=$tag" | grep -A1 '^name = "pillow"'
```

Once the lock and both architecture images' `/app/.venv` contain a version at or above the override's floor, delete the install line. Its upper bound would otherwise downgrade a newer upstream version.

Reset Password hashes with the `bcrypt` in `/app/.venv`; confirm the new tag's `uv.lock` still carries it.

Then read `check_funding_source` in the new version's `lnbits/app.py`. `fundingSourceMaxRetries` and `waitingRestartMs` in `startos/utils.ts` are derived from its retry budget (`funding_source_max_retries`) and its back-off (`min(0.25 * 2**n, 60)` seconds); if either changed, re-derive them. `main` sets the budget as `FUNDING_SOURCE_MAX_RETRIES`, which works only while LNbits lists the field among its read-only settings (`ReadOnlySettings` in `lnbits/settings.py`); if the field stops being read-only, the database row overrides the environment and `sync-funding-settings` has to pin it as well.

A backend whose constructor in `lnbits/wallets/` calls its node (Core Lightning's `CoreLightningWallet.__init__` does) falls back to a void wallet before `check_funding_source` retries anything, since `lnbits/app.py` catches the constructor's exception itself. Such a backend must not be launched until its node answers, as `primary`'s exec does for Core Lightning; check the constructors of all four managed backends.
