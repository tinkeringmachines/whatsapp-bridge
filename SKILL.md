# WhatsApp Bridge Skill

Manage WhatsApp Web sessions with stored credentials.

## Commands

### Add new account (generates QR code)
```bash
whatsapp-bridge add <name>
whatsapp-bridge add <name> --qr-file /tmp/qr.png  # Save QR as image
```

### List accounts
```bash
whatsapp-bridge list
```

### Check connection status
```bash
whatsapp-bridge status <name>
```

### Export credentials
```bash
whatsapp-bridge export <name>
```

### Delete account
```bash
whatsapp-bridge delete <name>
```

## Workflow: Adding a new WhatsApp account

1. Run `whatsapp-bridge add <name> --qr-file /tmp/qr.png`
2. Send the QR image to user via Telegram
3. User scans QR with their WhatsApp
4. Credentials are saved to local SQLite database
5. Account can now be used for bot configuration

## Database Location

Default: `~/.whatsapp-bridge/credentials.db`

Override with: `WHATSAPP_BRIDGE_DB=/path/to/db.sqlite`

## Notes

- QR codes expire quickly, user must scan within ~20 seconds
- Sessions persist until user logs out from phone or WhatsApp revokes
- Each phone can link up to 4 devices
- Credentials are JSON, can be backed up and restored
