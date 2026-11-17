#!/bin/bash
set -euo pipefail

docker run --rm -i --entrypoint uv "${1:?built LNbits image required}" \
    --offline run --no-sync python - <<'PY'
from io import BytesIO
from pathlib import Path
import sys

import PIL
from PIL import Image
from lnbits.core.services.assets import (
    detect_image_mime_type,
    thumbnail_from_bytes,
    verify_pil_image,
)

assert Path(sys.prefix) == Path('/app/.venv'), sys.prefix
assert int(PIL.__version__.split('.')[0]) >= 13, PIL.__version__

for format, mime in [('PNG', 'image/png'), ('JPEG', 'image/jpeg')]:
    buffer = BytesIO()
    Image.new('RGB', (512, 384), (40, 80, 120)).save(buffer, format=format)
    contents = buffer.getvalue()
    assert detect_image_mime_type(contents) == mime
    verify_pil_image(contents, mime)
    thumbnail = thumbnail_from_bytes(contents)
    assert thumbnail is not None
    with Image.open(thumbnail) as decoded:
        decoded.load()
        assert 0 < decoded.width <= 256
        assert 0 < decoded.height <= 256
    try:
        verify_pil_image(contents, 'image/gif')
    except ValueError:
        pass
    else:
        raise AssertionError('Mismatched image type accepted')

try:
    verify_pil_image(b'not an image', 'image/png')
except ValueError:
    pass
else:
    raise AssertionError('Invalid image accepted')

print(f'LNbits runtime Pillow {PIL.__version__}: image validation/thumbnails passed')
PY
