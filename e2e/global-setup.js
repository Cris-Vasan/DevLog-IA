const { unlink } = require('fs/promises');
const path = require('path');

module.exports = async function globalSetup() {
  const dbPath = path.resolve(__dirname, '../data/e2e-test.db');
  await unlink(dbPath).catch(() => {});
};
