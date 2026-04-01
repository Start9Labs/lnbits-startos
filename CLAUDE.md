## How the upstream version is pulled
- `Dockerfile` FROM line: `FROM lnbits/lnbits:v<version>`
- Image is `dockerBuild` (no dockerTag in manifest to update)

> Dockerfile has multiple FROM stages — check both builder and final stage versions.
