const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
    title: { type: String, required: true, index: 'text' },
    abstract: { type: String, required: true, index: 'text' },
    authors: [{ type: String }],
    date: { type: Date, default: Date.now },
    doi: { type: String, unique: true },
    journal: { type: String },
    categories: [{ type: String }]
}, { timestamps: true });

// Add text index for searching
PaperSchema.index({ title: 'text', abstract: 'text' });

module.exports = mongoose.model('Paper', PaperSchema);
