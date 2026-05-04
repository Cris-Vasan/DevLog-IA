require('dotenv').config();
const path = require('path');
const { createDb } = require('./db');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/devlog.db');

const db = createDb(DB_PATH);
app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
