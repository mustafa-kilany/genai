const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    relatedArticles: [String] // ["Article 6", "Article 12"]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Case', CaseSchema);
