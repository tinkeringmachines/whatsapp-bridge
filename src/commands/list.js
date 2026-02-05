/**
 * List all WhatsApp accounts
 */

const { getAllAccounts } = require('../db');

function listAccounts() {
  const accounts = getAllAccounts();

  if (accounts.length === 0) {
    console.log('No accounts stored.');
    return;
  }

  console.log('Stored WhatsApp accounts:\n');
  console.log('Name'.padEnd(20) + 'Phone'.padEnd(20) + 'Last Connected');
  console.log('-'.repeat(60));

  for (const acc of accounts) {
    console.log(
      (acc.name || '').padEnd(20) +
      (acc.phone || 'unknown').padEnd(20) +
      (acc.last_connected || 'never')
    );
  }
}

module.exports = { listAccounts };
