
const mongoose = require('mongoose');

const LawSchema = new mongoose.Schema(
  {
    title_en: { type: String, index: true },
    title_ar: { type: String, index: true },
    article: { type: String, index: true }, // "Article 1 / المادة 1"
    article_num: { type: Number, index: true },
    content_en: String,
    content_ar: String
  },
  { timestamps: true }
);

LawSchema.index({ title_en: 1, article_num: 1 });

module.exports = mongoose.model('Law', LawSchema);
