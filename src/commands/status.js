/**
 * Check WhatsApp account status
 */

const { makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { getAccount, updateLastConnected } = require('../db');

async function statusAccount(name) {
  const account = getAccount(name);

  if (!account) {
    console.error(`Account "${name}" not found.`);
    process.exit(1);
  }

  console.log(`Checking status for: ${name}`);
  console.log(`Phone: ${account.phone || 'unknown'}`);
  console.log(`Created: ${account.created_at}`);
  console.log(`Last connected: ${account.last_connected || 'never'}`);
  console.log('\nConnecting...');

  // Create temp directory and restore auth state
  const authDir = path.join('/tmp', `whatsapp-status-${name}-${Date.now()}`);
  fs.mkdirSync(authDir, { recursive: true });

  // Write credentials to temp dir
  for (const [filename, content] of Object.entries(account.credentials)) {
    const filePath = path.join(authDir, filename);
    fs.writeFileSync(filePath, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    printQRInTerminal: false,
    logger: pino({ level: 'silent' })
  });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('\n✗ Connection timeout');
      cleanup(authDir);
      sock.end();
      resolve();
    }, 30000);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        clearTimeout(timeout);
        
        if (statusCode === DisconnectReason.loggedOut) {
          console.log('\n✗ Session expired or logged out');
        } else {
          console.log(`\n✗ Connection failed (code: ${statusCode})`);
        }
        
        cleanup(authDir);
        resolve();
      }

      if (connection === 'open') {
        clearTimeout(timeout);
        console.log('\n✓ Connection OK');
        console.log(`Name: ${sock.user?.name || 'unknown'}`);
        
        updateLastConnected(name);
        
        await sock.logout().catch(() => {});
        cleanup(authDir);
        resolve();
      }
    });
  });
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

module.exports = { statusAccount };
