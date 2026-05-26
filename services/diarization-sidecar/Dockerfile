# syntax=docker/dockerfile:1.7
#
# Vought · Diarization Sidecar
#
# Two-stage build:
#   1. `builder` — install Python deps + pre-download the pyannote model
#      using a build-time HF_TOKEN. This bakes the weights into the image
#      so cold starts on Modal / Railway do not hit Hugging Face.
#   2. `runtime` — slim final layer that just copies the venv + the
#      pre-warmed cache.
#
# Build with:
#   docker build \
#     --secret id=hf_token,env=HF_TOKEN \
#     -t vought/diarization-sidecar:latest \
#     services/diarization-sidecar
#
# Run with:
#   docker run -p 8000:8000 -e HF_TOKEN=$HF_TOKEN vought/diarization-sidecar
#
# Notes:
#   - Base image is CPU torch. For GPU on Modal, swap to
#     `nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04` and reinstall torch
#     with the matching CUDA wheel.
#   - The model cache lives at /root/.cache/huggingface so it survives
#     across layers. We chmod it to be readable by any non-root runtime
#     user a deploy target might inject.

ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# System deps required by torch / pyannote (libsndfile for audio I/O,
# ffmpeg as a backup decoder, git for some HF artifact downloads).
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        ffmpeg \
        libsndfile1 \
        git \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first so they cache independently of source code.
COPY requirements.txt ./
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install -r requirements.txt
ENV PATH="/opt/venv/bin:${PATH}"

# Pre-download the pyannote 3.1 model so it ships inside the image.
# Falls back gracefully if no HF_TOKEN was provided at build time — the
# runtime container will then attempt the download on first request.
COPY scripts/prewarm_model.py /tmp/prewarm_model.py
RUN --mount=type=secret,id=hf_token \
    if [ -f /run/secrets/hf_token ]; then \
        HF_TOKEN="$(cat /run/secrets/hf_token)" python /tmp/prewarm_model.py; \
    else \
        echo "[build] no hf_token secret mounted — model will be fetched at runtime"; \
    fi \
    && rm -f /tmp/prewarm_model.py


FROM python:${PYTHON_VERSION}-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:${PATH}" \
    PORT=8000 \
    LOG_LEVEL=info

# Same minimal system libs at runtime as at build (torch + libsndfile).
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        libsndfile1 \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Bring over the prepared venv + cached model weights from the builder.
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /root/.cache/huggingface /root/.cache/huggingface

WORKDIR /app
COPY . /app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request,sys; \
sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3).status == 200 else 1)"

# uvicorn directly — no shell wrapper, signals propagate cleanly.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
