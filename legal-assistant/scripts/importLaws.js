// scripts/importLaws.js
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Law = require('../models/Law');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/legal-assistant';

function extractArticleNum(article) {
  const m = String(article || '').match(/Article\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const raw = fs.readFileSync('jordan_pdpl_2023_bilingual_articles_fixed_ar.json', 'utf8');
  const data = JSON.parse(raw).map(d => ({
    ...d,
    article_num: extractArticleNum(d.article)
  }));

  await Law.deleteMany({ title_en: 'Personal Data Protection Law No. (24) of 2023' });
  await Law.insertMany(data);

  console.log(`Imported ${data.length} law articles`);
  await mongoose.disconnect();
  console.log('Done');
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
