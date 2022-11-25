FROM python:3.9-slim

# arm64 or amd64
ARG PLATFORM
ARG ARCH

RUN apt-get update && apt-get install -y curl wget bash tini pkg-config gcc make sqlite3
RUN wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_${PLATFORM}.tar.gz -O - |\
  tar xz && mv yq_linux_${PLATFORM} /usr/bin/yq
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app/
COPY lnbits-legend/ .

ENV LNBITS_PORT 5000
ENV LNBITS_HOST lnbits.embassy

RUN poetry config virtualenvs.create false
RUN poetry install --no-dev --no-root
RUN poetry run python build.py
RUN pip install pyln-client

RUN mkdir -p ./data
ADD .env.example ./.env
RUN chmod a+x ./.env
ADD docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod a+x /usr/local/bin/*.sh
