#!/usr/bin/env node

/**
 * WhatsApp Bridge CLI
 * 
 * Commands:
 *   add <name>     - Add new WhatsApp account (generates QR)
 *   list           - List all accounts
 *   export <name>  - Export credentials as JSON
 *   delete <name>  - Delete account
 *   status <name>  - Check connection status
 */

const { addAccount } = require('./commands/add');
const { listAccounts } = require('./commands/list');
const { exportAccount } = require('./commands/export');
const { deleteAccount } = require('./commands/delete');
const { statusAccount } = require('./commands/status');
const { getDb } = require('./db');

const args = process.argv.slice(2);
const command = args[0];
const name = args[1];

async function main() {
  // Ensure DB is initialized
  getDb();

  switch (command) {
    case 'add':
      if (!name) {
        console.error('Usage: whatsapp-bridge add <name>');
        process.exit(1);
      }
      await addAccount(name, {
        outputQr: args.includes('--qr-file') ? args[args.indexOf('--qr-file') + 1] : null,
        printQr: !args.includes('--no-print-qr')
      });
      break;

    case 'list':
      listAccounts();
      break;

    case 'export':
      if (!name) {
        console.error('Usage: whatsapp-bridge export <name>');
        process.exit(1);
      }
      exportAccount(name);
      break;

    case 'delete':
      if (!name) {
        console.error('Usage: whatsapp-bridge delete <name>');
        process.exit(1);
      }
      deleteAccount(name);
      break;

    case 'status':
      if (!name) {
        console.error('Usage: whatsapp-bridge status <name>');
        process.exit(1);
      }
      await statusAccount(name);
      break;

    default:
      console.log(`WhatsApp Bridge CLI

Commands:
  add <name>              Add new WhatsApp account (generates QR code)
    --qr-file <path>      Save QR code as PNG image
    --no-print-qr         Don't print QR in terminal

  list                    List all stored accounts
  export <name>           Export credentials as JSON
  delete <name>           Delete account credentials
  status <name>           Check connection status

Examples:
  whatsapp-bridge add personal
  whatsapp-bridge add work --qr-file /tmp/qr.png
  whatsapp-bridge list
  whatsapp-bridge export personal > creds.json
`);
      process.exit(command ? 1 : 0);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
