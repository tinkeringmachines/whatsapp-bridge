/**
 * Export WhatsApp account credentials
 */

const { getAccount } = require('../db');

function exportAccount(name) {
  const account = getAccount(name);

  if (!account) {
    console.error(`Account "${name}" not found.`);
    process.exit(1);
  }

  // Output credentials as JSON (can be piped to file)
  console.log(JSON.stringify(account.credentials, null, 2));
}

module.exports = { exportAccount };
