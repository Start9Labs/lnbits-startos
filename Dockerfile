FROM lnbits/lnbits:v1.2.1 AS builder

# arm64 or amd64
ARG PLATFORM

RUN apt-get update && apt-get install -y bash curl sqlite3 tini --no-install-recommends
RUN curl -sS https://webi.sh/yq | sh

FROM lnbits/lnbits:v1.2.1 AS final

COPY --from=builder /usr/bin/tini /usr/bin/tini
COPY --from=builder /usr/bin/sqlite3 /usr/bin/sqlite3
COPY --from=builder /root/.local/bin/yq /usr/local/bin/yq

RUN apt-get update && \
  apt-get install -y \
  xxd \
  curl \
  jq

RUN pip3 install bcrypt

WORKDIR /app/
