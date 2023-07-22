FROM python:3.10-slim as builder

# arm64 or amd64
ARG PLATFORM

RUN apt-get update && apt-get install -y curl bash tini sqlite3 build-essential pkg-config --no-install-recommends
RUN curl -sSL https://install.python-poetry.org | python3 -
RUN curl -sL -o /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_${PLATFORM} && chmod +x /usr/local/bin/yq
WORKDIR /app/
COPY lnbits/ .

FROM python:3.10-slim

copy --from=builder /usr/bin/tini /usr/bin/tini
COPY --from=builder /usr/local/bin/yq /usr/local/bin/yq
COPY --from=builder /usr/bin/sqlite3 /usr/bin/sqlite3
COPY --from=builder /usr/bin/pkg-config /usr/bin/pkg-config
COPY --from=builder /app /app
COPY --from=builder /bin /bin
COPY --from=builder /lib /lib
COPY --from=builder /root/.local /root/.local

ENV PATH="/root/.local/bin:$PATH"
WORKDIR /app/

ENV LNBITS_PORT 5000
ENV LNBITS_HOST lnbits.embassy
RUN poetry config virtualenvs.create false
RUN poetry install --only main
RUN pip install pyln-client

RUN rm -rf /root/.cache/*

RUN mkdir -p ./data
ADD .env.example ./.env
RUN chmod a+x ./.env
ADD docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD check-web.sh /usr/local/bin/check-web.sh
RUN chmod a+x /usr/local/bin/*.sh
