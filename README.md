# WhatsApp Bridge

WhatsApp Web bridge with credential management. Store and manage WhatsApp session credentials in SQLite.

## Features

- Generate QR codes for WhatsApp Web pairing
- Store credentials in SQLite database
- Export/import credentials as JSON
- Check connection status
- NixOS integration via flake

## Installation

### With Nix

```bash
nix run github:tinkeringmachines/whatsapp-bridge -- --help
```

### Development

```bash
nix develop
npm install
node src/index.js --help
```

## Usage

```bash
# Add new account (generates QR code)
whatsapp-bridge add personal

# Save QR as image file
whatsapp-bridge add work --qr-file /tmp/qr.png

# List all accounts
whatsapp-bridge list

# Check if credentials still work
whatsapp-bridge status personal

# Export credentials as JSON
whatsapp-bridge export personal > backup.json

# Delete account
whatsapp-bridge delete personal
```

## Database

Credentials are stored in SQLite at `~/.whatsapp-bridge/credentials.db`

Override location with `WHATSAPP_BRIDGE_DB` environment variable.

## How it works

1. Uses [Baileys](https://github.com/WhiskeySockets/Baileys) for WhatsApp Web protocol
2. Generates QR code for pairing
3. After scan, stores session credentials in SQLite
4. Credentials can reconnect without re-scanning until revoked

## License

MIT
