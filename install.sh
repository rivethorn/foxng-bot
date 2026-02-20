#!/usr/bin/env bash

set -e

### ===== CONFIG =====
REPO_URL="https://github.com/rivethorn/foxng-bot.git"
APP_NAME="FoxNG"
INSTALL_DIR="/opt/$APP_NAME"
SERVICE_NAME="$APP_NAME.service"
RUN_COMMAND="bun run start"
BUILD_COMMAND="bun run build"
### ==================

echo "========================================="
echo "      $APP_NAME Installer"
echo "========================================="
echo

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)."
  exit 1
fi

# ---- Check Git ----
if ! command -v git &> /dev/null; then
  echo "Installing git..."
  apt update
  apt install -y git
fi

# ---- Check Curl ----
if ! command -v curl &> /dev/null; then
  echo "Installing curl..."
  apt update
  apt install -y curl
fi

# ---- Install Bun if missing ----
if ! command -v bun &> /dev/null; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
else
  echo "Bun already installed."
fi

# ---- Clone Repo ----
if [ -d "$INSTALL_DIR" ]; then
  echo "Directory exists. Removing..."
  rm -rf "$INSTALL_DIR"
fi

echo "Cloning repository..."
git clone "$REPO_URL" "$INSTALL_DIR"

cd "$INSTALL_DIR"

# ---- Install Dependencies ----
echo "Installing dependencies..."
bun install

# ---- Build (if exists) ----
if bun run | grep -q build; then
  echo "Running build..."
  $BUILD_COMMAND
fi

# ---- Ask for ENV values ----
echo
echo "Configure environment variables:"
printf "  %s\n" "BOT_TOKEN: Your Telegram bot token (from BotFather)"
read BOT_TOKEN
printf "  %s\n" "PANEL_ADDRESS: URL of your FoxNG panel (e.g. https://panel.example.com)"
read "PANEL_ADDRESS: " PANEL_ADDRESS
printf "  %s\n" "PANEL_USERNAME: Username for panel login"
read "PANEL_USERNAME: " PANEL_USERNAME
printf "  %s\n" "PANEL_PASSWORD: Password for panel login"
read "PANEL_PASSWORD: " PANEL_PASSWORD
printf "  %s\n" "ADMIN_ID: Your Telegram user ID (for admin access)"
read "ADMIN_ID: " ADMIN_ID

# Write .env reliably
cat > "$INSTALL_DIR/.env" <<EOF
BOT_TOKEN=${BOT_TOKEN}
PANEL_ADDRESS=${PANEL_ADDRESS}
PANEL_USERNAME=${PANEL_USERNAME}
PANEL_PASSWORD=${PANEL_PASSWORD}
ADMIN_ID=${ADMIN_ID}
EOF

chmod 600 "$INSTALL_DIR/.env"

echo "Environment variables saved to $INSTALL_DIR/.env"

# ---- Create systemd service ----
echo "Creating systemd service..."

cat > "/etc/systemd/system/$SERVICE_NAME" <<EOF
[Unit]
Description=$APP_NAME Service
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
ExecStart=/root/.bun/bin/bun run start
Restart=on-failure
RestartSec=5
EnvironmentFile=$INSTALL_DIR/.env
User=root

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
EOF

# ---- Enable + Start ----
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

echo
echo "========================================="
echo " Installation Complete!"
echo "========================================="
echo
echo "Check status:"
echo "  systemctl status $SERVICE_NAME"
echo
echo "View logs:"
echo "  journalctl -u $SERVICE_NAME -f"