FROM lnbits/lnbits:v1.7.1

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  ca-certificates \
  sqlite3 && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN uv pip install --python /app/.venv/bin/python --no-cache 'pillow>=13.0.0,<14'

WORKDIR /app/
