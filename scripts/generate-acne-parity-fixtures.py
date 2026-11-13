#!/usr/bin/env python3
"""Generate synthetic inputs only; never claim these are Kotlin reference outputs.

Uses the already installed Pillow. No network, model inference or Android code.
--check verifies existing bytes and manifest without writing.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path

import PIL
from PIL import Image, features

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "tests/fixtures/acne-parity"
SPECS = [
    ("normal-square", 640, 640, "PNG", 1, "uniform RGB 114; no resize/padding"),
    ("portrait", 480, 800, "PNG", 1, "asymmetric chart; left/right padding"),
    ("landscape", 960, 540, "PNG", 1, "asymmetric chart; top/bottom padding"),
    ("odd-dimensions", 641, 479, "PNG", 1, "asymmetric chart; rounding and unequal padding"),
    ("orientation-sampling", 1801, 1201, "JPEG", 7,
     "asymmetric chart; EXIF transverse (mirror + rotation); >1600 sampling"),
]


def encode(fixture_id, width, height, encoding, orientation):
    image = Image.new("RGB", (width, height), (114, 114, 114))
    if fixture_id != "normal-square":
        # Integer-only ramp/checker chart and four unequal corner colors.
        pixels = bytearray(width * height * 3)
        for y in range(height):
            for x in range(width):
                offset = (y * width + x) * 3
                pixels[offset:offset + 3] = bytes((
                    x * 255 // (width - 1), y * 255 // (height - 1),
                    224 if ((x // 17 + y // 23) % 2) else 32))
        image = Image.frombytes("RGB", (width, height), bytes(pixels))
        for box, color in [
            ((0, 0, width // 5, height // 7), (255, 0, 0)),
            ((width * 4 // 5, 0, width, height // 6), (0, 255, 0)),
            ((0, height * 4 // 5, width // 6, height), (0, 0, 255)),
            ((width * 5 // 6, height * 5 // 6, width, height), (255, 255, 0)),
        ]:
            image.paste(color, box)
    output = io.BytesIO()
    if encoding == "JPEG":
        exif = Image.Exif()
        exif[274] = orientation
        image.save(output, format="JPEG", quality=95, subsampling=0,
                   optimize=False, progressive=False, exif=exif)
    else:
        image.save(output, format="PNG", compress_level=9, optimize=False)
    data = output.getvalue()
    # Verify encoded dimensions/type/tag; these are NOT Android decode results.
    with Image.open(io.BytesIO(data)) as decoded:
        assert decoded.size == (width, height) and decoded.mode == "RGB"
        assert decoded.getexif().get(274, 1) == orientation
        decoded.load()
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    files = {}
    entries = []
    for fixture_id, width, height, encoding, orientation, coverage in SPECS:
        name = fixture_id + (".jpg" if encoding == "JPEG" else ".png")
        data = encode(fixture_id, width, height, encoding, orientation)
        files[name] = data
        entries.append({
            "id": fixture_id, "file": name, "encoded_width": width,
            "encoded_height": height, "encoding": encoding,
            "exif_orientation": orientation, "coverage": coverage,
            "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
            "provenance": "synthetic integer chart generated locally; no photos",
            "kotlin_reference_status": "not_captured",
        })
    manifest = {
        "schema_version": 1, "kind": "synthetic_source_images_only",
        "license": "CC0-1.0", "generator": "scripts/generate-acne-parity-fixtures.py",
        "generator_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "encoding_environment": {"pillow": PIL.__version__,
                                 "libjpeg": features.version_codec("jpg"),
                                 "zlib": features.version_codec("zlib")},
        "fixtures": entries,
    }
    files["manifest.json"] = (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode()
    if not args.check:
        DEST.mkdir(parents=True, exist_ok=True)
    for name, data in files.items():
        path = DEST / name
        if args.check:
            if not path.exists() or path.read_bytes() != data:
                raise SystemExit(f"Mismatch/missing: {path}; use recorded encoding versions")
        else:
            path.write_bytes(data)
    print(f"{'Verified' if args.check else 'Generated'} 5 synthetic inputs and manifest; no Kotlin references.")


if __name__ == "__main__":
    main()
