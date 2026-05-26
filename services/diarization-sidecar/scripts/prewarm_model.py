"""
Pre-warm the pyannote model into the Hugging Face cache.

Run at Docker build time so the resulting image ships with the weights
baked in. Failures are non-fatal so the build does not break when no
HF_TOKEN is provided — the runtime container will retry at first request.
"""

from __future__ import annotations

import os
import sys

MODEL_ID = "pyannote/speaker-diarization-3.1"


def main() -> int:
    token = os.environ.get("HF_TOKEN")
    if not token:
        print("[prewarm] no HF_TOKEN — skipping")
        return 0

    print(f"[prewarm] downloading {MODEL_ID} …", flush=True)
    try:
        from pyannote.audio import Pipeline  # noqa: WPS433 — runtime import

        Pipeline.from_pretrained(MODEL_ID, use_auth_token=token)
    except Exception as exc:  # noqa: BLE001
        print(f"[prewarm] could not pre-download: {exc}", flush=True)
        # Do not fail the build — runtime will retry.
        return 0
    print("[prewarm] model cached", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
