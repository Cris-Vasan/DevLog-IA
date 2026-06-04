require('dotenv').config();
const path = require('path');
const { createDb } = require('./db');
const createApp = require('./app');

const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/devlog.db');

let anthropicClient = null;
if (process.env.ANTHROPIC_API_KEY) {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const db = createDb(DB_PATH);
const app = createApp(db, anthropicClient);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
