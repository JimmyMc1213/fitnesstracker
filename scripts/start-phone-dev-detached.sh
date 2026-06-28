#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$ROOT/apps/mobile"
PORT=8082
CF_LOG=/tmp/newyou-cf.log
METRO_LOG=/tmp/newyou-metro.log
LINK_FILE=/tmp/newyou-deeplink.txt

lsof -ti ":$PORT" | xargs kill -9 2>/dev/null || true
pkill -9 -f "cloudflared tunnel --url http://127.0.0.1:$PORT" 2>/dev/null || true
sleep 1

: > "$CF_LOG"
nohup cloudflared tunnel --url "http://127.0.0.1:$PORT" --no-autoupdate >> "$CF_LOG" 2>&1 &
CFPID=$!

TUNNEL_URL=""
for _ in $(seq 1 30); do
  TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$CF_LOG" | head -1 || true)
  if [ -n "$TUNNEL_URL" ]; then break; fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "cloudflared failed — see $CF_LOG" >&2
  exit 1
fi

HOST="${TUNNEL_URL#https://}"
DEEPLINK="exp+newyouai-mobile://expo-development-client/?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$TUNNEL_URL', safe=''))")"

cd "$MOBILE"
nohup env REACT_NATIVE_PACKAGER_HOSTNAME="$HOST" npx expo start --dev-client --port "$PORT" --host lan >> "$METRO_LOG" 2>&1 &

for _ in $(seq 1 20); do
  if curl -sf "http://127.0.0.1:$PORT/status" >/dev/null 2>&1; then break; fi
  sleep 1
done

{
  echo "Tunnel: $TUNNEL_URL"
  echo "Deep link: $DEEPLINK"
  echo "cloudflared pid: $CFPID"
} | tee "$LINK_FILE"

printf '%s\n' "$DEEPLINK" | pbcopy 2>/dev/null || true
