FROM lnbits/lnbits:0.12.8 as builder

RUN apt-get update && apt-get install -y bash curl sqlite3 tini jq xxd --no-install-recommends
RUN curl -sS https://webi.sh/yq | sh
RUN pip3 install bcrypt

FROM python:3.10-slim-bookworm as final

# Install necessary runtime dependencies with missing libraries
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    jq \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy dependencies and application code from the builder stage
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app /app
COPY --from=builder /usr/bin/tini /usr/bin/tini
COPY --from=builder /usr/bin/sqlite3 /usr/bin/sqlite3
COPY --from=builder /root/.local/bin/yq /usr/local/bin/yq
COPY --from=builder /usr/bin/xxd /usr/local/bin/xxd
COPY --from=builder /root/.cache/pypoetry/virtualenvs /root/.cache/pypoetry/virtualenvs

# Ensure Poetry and virtual environment are in PATH
ENV PATH="/root/.local/bin:/root/.cache/pypoetry/virtualenvs/lnbits-*-py3.10/bin:$PATH"

ENV LNBITS_PORT 5000
ENV LNBITS_HOST lnbits.embassy

WORKDIR /app/

RUN mkdir -p ./data
ADD .env.example ./.env
ADD actions/*.sh /usr/local/bin/
RUN chmod a+x ./.env
ADD docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD check-web.sh /usr/local/bin/check-web.sh
RUN chmod a+x /usr/local/bin/*.sh
