/**
 * Add new WhatsApp account
 */

const { makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { saveAccount, getAccount } = require('../db');

async function addAccount(name, options = {}) {
  // Check if account already exists
  const existing = getAccount(name);
  if (existing) {
    console.log(`Account "${name}" already exists. Use 'delete' first to re-add.`);
    process.exit(1);
  }

  // Create temp directory for auth state
  const authDir = path.join('/tmp', `whatsapp-auth-${name}-${Date.now()}`);
  fs.mkdirSync(authDir, { recursive: true });

  console.log(`Adding WhatsApp account: ${name}`);
  console.log('Waiting for QR code...\n');

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    printQRInTerminal: false,
    logger: pino({ level: 'silent' })
  });

  return new Promise((resolve, reject) => {
    let qrShown = false;

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && !qrShown) {
        qrShown = true;
        
        // Print QR in terminal
        if (options.printQr !== false) {
          console.log('Scan this QR code with WhatsApp:\n');
          qrcode.generate(qr, { small: true });
          console.log('');
        }

        // Save QR as PNG if requested
        if (options.outputQr) {
          await QRCode.toFile(options.outputQr, qr, {
            type: 'png',
            width: 512,
            margin: 2
          });
          console.log(`QR code saved to: ${options.outputQr}`);
        }

        console.log('Waiting for scan...');
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect) {
          console.log('Connection closed, retrying...');
          // Could retry here, but for initial setup we'll just fail
        } else {
          console.log('Logged out or failed to connect.');
          cleanup(authDir);
          reject(new Error('Failed to connect'));
        }
      }

      if (connection === 'open') {
        console.log('\n✓ Connected successfully!');
        
        // Get phone number from credentials
        const phone = sock.user?.id?.split(':')[0] || 'unknown';
        console.log(`Phone: ${phone}`);

        // Save credentials to database
        await saveCreds();
        
        // Read all auth files and store in DB
        const authFiles = fs.readdirSync(authDir);
        const credentials = {};
        for (const file of authFiles) {
          const content = fs.readFileSync(path.join(authDir, file), 'utf8');
          try {
            credentials[file] = JSON.parse(content);
          } catch {
            credentials[file] = content;
          }
        }

        saveAccount(name, phone, credentials);
        console.log(`✓ Credentials saved for "${name}"`);

        // Cleanup
        await sock.logout().catch(() => {});
        cleanup(authDir);
        resolve();
      }
    });

    sock.ev.on('creds.update', saveCreds);
  });
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

module.exports = { addAccount };
