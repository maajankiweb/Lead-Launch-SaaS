#!/bin/bash
# Lead & Launch SaaS Dashboard Runner (macOS / Linux)
# Powered by MaaJanki Web Tech
# Double-click this file in Finder to start the dashboard.

pause_on_exit() {
  echo ""
  echo "────────────────────────────────────────"
  echo "Press RETURN to close this window."
  read -r _
}

fail() {
  echo ""
  echo "❌  $1"
  pause_on_exit
  exit 1
}

cd "$(dirname "$0")" || fail "Could not find current folder."

echo ""
echo "════════════════════════════════════════"
echo "  Lead & Launch SaaS — Starting Dashboard"
echo "  Powered by MaaJanki Web Tech"
echo "════════════════════════════════════════"
echo ""

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
fi

if ! command -v npm >/dev/null 2>&1; then
  NVM_NODE_BIN="$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
  export PATH="$NVM_NODE_BIN:/opt/homebrew/bin:/usr/local/bin:$PATH"
fi

if ! command -v npm >/dev/null 2>&1; then
  fail "Node.js / npm not found. Install Node from https://nodejs.org (LTS), then double-click this file again."
fi

echo "Using Node $(node -v)  •  npm $(npm -v)"
echo ""

if [ ! -d "node_modules" ]; then
  echo "First-time setup — installing dependencies (1–2 minutes)…"
  npm install || fail "npm install failed. Check your internet connection and try again."
  echo ""
fi

(
  for _ in $(seq 1 60); do
    if curl -s -o /dev/null "http://localhost:3000/"; then
      open "http://localhost:3000"
      exit 0
    fi
    sleep 1
  done
) &

if lsof -iTCP:3000 -sTCP:LISTEN -P >/dev/null 2>&1; then
  echo "⚠  Port 3000 is already in use — another copy of this dashboard may already be running."
  echo "   Try http://localhost:3000 in your browser first."
  echo "   If that's not it, close the other Terminal window running it, then re-open this."
  pause_on_exit
  exit 1
fi

echo "Starting the dashboard server…"
echo "Your browser opens automatically once it's ready (first time can take 10–20s)."
echo ""
echo "▶  When it's running, the dashboard is at:  http://localhost:3000"
echo "■  To STOP: press  Control + C  here, or just close this window."
echo ""

npm run dev

echo ""
echo "The dashboard server has stopped."
pause_on_exit
