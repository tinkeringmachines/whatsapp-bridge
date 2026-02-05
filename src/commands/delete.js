/**
 * Delete WhatsApp account
 */

const { deleteAccount: deleteAccountDb, getAccount } = require('../db');

function deleteAccount(name) {
  const account = getAccount(name);

  if (!account) {
    console.error(`Account "${name}" not found.`);
    process.exit(1);
  }

  deleteAccountDb(name);
  console.log(`Account "${name}" deleted.`);
}

module.exports = { deleteAccount };
