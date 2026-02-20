```text
⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣿⣿⣿⣿⣿⣄⠀⠀⠀⠀⢀⣾⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣿⣿⣿⣿⠿⢿⣿⣿⣿⣿⣿⣿⠿⢿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣼⣿⣿⣿⣇⠀⢀⣿⣿⣿⣿⣿⣇⠀⢀⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠛⠿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣾⣿⣿⣿⣿⣿⣿⠿⠛⠀⠀⢀⣀⣤⠖⠀⣀⣀⣀⠀⠀⠀⠀⠀
⠘⢿⣿⣿⣿⣿⣿⣌⣛⣋⣭⣙⣛⣡⣿⣿⣿⣿⡿⠃⣠⣶⣿⣟⣡⣾⣿⣿⣿⣿⣿⣦⠀⠀⠀
⠀⠀⠀⠉⠙⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠟⠋⠀⣼⣿⣿⣿⣯⣿⣿⣿⣿⣿⣿⣿⣿⣿⣄⠀
⠀⠀⠀⠀⠀⠀⣀⣶⣿⣿⣿⣿⣿⣷⣆⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠛⠉⠙⠻
⠀⠀⠀⠀⠀⣮⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⢸⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣸⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠠⠀⠛⠛⠛⠛⠛⠛⠋⠀⠀⠛⠛⠛⠛⠛⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
```

# FoxNG VPN Bot

A Telegram bot that connects to you 3X-UI V2Ray VPN panel and let's you automate you misery.

Usage:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/rivethorn/foxng-bot/refs/heads/main/install.sh)
```

**IMPORTANT**
Be sure to adjust the .env file correctly.

```text
BOT_TOKEN=Your-Telegram-Bot-Token-From-BotFather
PANEL_ADDRESS=The-URL-To-Your-3X-UI-Panel
USERNAME=Your-Panel-Username
PASSWORD=Your-Panel-Password
ADMIN_ID=Your-Admins-Telegram-ID
```

To install dependencies:

```bash
bun install
```

To run locally:

```bash
bun run dev
```

To run in production environment:

```bash
bun run start
```