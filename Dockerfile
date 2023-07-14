FROM python:3.10-slim

# arm64 or amd64
ARG PLATFORM

RUN apt-get clean
RUN apt-get update && apt-get install -y curl wget bash tini pkg-config sqlite3 build-essential
RUN wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_${PLATFORM} && chmod +x /usr/local/bin/yq
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

RUN echo "deb http://apt.postgresql.org/pub/repos/apt bullseye-pgdg main" > /etc/apt/sources.list.d/pgdg.list
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update
RUN apt-get install -y postgresql-client-14

WORKDIR /app/
COPY lnbits/ .

ENV LNBITS_PORT 5000
ENV LNBITS_HOST lnbits.embassy

RUN poetry config virtualenvs.create false
RUN poetry install --only main
RUN pip install pyln-client

RUN mkdir -p ./data
ADD .env.example ./.env
RUN chmod a+x ./.env
ADD docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD check-web.sh /usr/local/bin/check-web.sh
RUN chmod a+x /usr/local/bin/*.sh
