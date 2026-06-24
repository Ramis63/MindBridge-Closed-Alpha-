# ── MindBridge Docker Image ──────────────────────────────────────────────────
# Minimal Python image — no extra dependencies needed (stdlib only)
FROM python:3.11-slim

# Metadata
LABEL maintainer="Ramis63"
LABEL description="MindBridge Student Mental Wellness Tracker"
LABEL version="1.0"

# Set working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY . .

# Create a dedicated volume directory for the SQLite database
# This ensures data persists when the container restarts
RUN mkdir -p /data

# Expose the app port
EXPOSE 8000

# Health check — Docker will mark the container as healthy once the server responds
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000')" || exit 1

# Override the DB path to use the persistent /data volume
ENV DB_PATH=/data/mindbridge.db

# Start the server
CMD ["python", "-u", "run.py"]
