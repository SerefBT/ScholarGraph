const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const Paper = require('../models/Paper');
const { getRecommendations, getPaperGraph } = require('../services/neo4j');
const { driver } = require('../db');

const upload = multer({ storage: multer.memoryStorage() });

// Get trending papers (Most cited/popular)
router.get('/trending', async (req, res) => {
    if (process.env.MOCK_MODE === 'true') {
        return res.json([
            { _id: '1', title: 'Attention Is All You Need', abstract: 'The base of all modern LLMs...', authors: ['Ashish Vaswani'], categories: ['Yapay Zeka'] },
            { _id: '4', title: 'Generative Adversarial Nets', abstract: 'GANs revolutionized image generation...', authors: ['Ian Goodfellow'], categories: ['Deep Learning'] }
        ]);
    }
    try {
        // Real Neo4j query for most cited papers
        const session = driver.session();
        const result = await session.run(`
            MATCH (p:Paper)<-[r:CITES]-()
            RETURN p.mongoId AS id, count(r) AS citations
            ORDER BY citations DESC LIMIT 5
        `);
        const ids = result.records.map(r => r.get('id'));
        const papers = await Paper.find({ _id: { $in: ids } });
        res.json(papers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search papers via MongoDB Text Search
router.get('/search', async (req, res) => {
    const { q, category } = req.query;
    console.log(`🔍 Search Request: query="${q || ''}", category="${category || ''}"`);

    if (process.env.MOCK_MODE === 'true') {
        const mockData = [
            { _id: '1', title: 'Attention Is All You Need', abstract: 'The dominant sequence transduction models...', authors: ['Ashish Vaswani'], categories: ['Yapay Zeka', 'NLP'] },
            { _id: '2', title: 'BERT: Pre-training of Deep Bidirectional Transformers', abstract: 'We introduce a new language representation model...', authors: ['Jacob Devlin'], categories: ['NLP'] },
            { _id: '3', title: 'Deep Residual Learning', abstract: 'Deeper neural networks are more difficult to train...', authors: ['Computer Vision', 'Deep Learning'] },
            { _id: '4', title: 'Generative Adversarial Nets', abstract: 'Adversarial process for estimating generative models...', authors: ['Ian Goodfellow'], categories: ['Yapay Zeka', 'Deep Learning'] },
            { _id: '5', title: 'Quantum Computing Fundamentals', abstract: 'Basics of quantum bits and algorithms...', authors: ['Richard Feynman'], categories: ['Quantum Computing'] },
            { _id: 's1', title: '1959 Öncesi Şampiyonlukların Hukuki Analizi', abstract: 'Türk futbol tarihindeki 1959 öncesi şampiyonlukların tescil süreçleri ve hukuki dayanakları üzerine akademik bir inceleme.', authors: ['Spor Hukuku Uzmanı'], categories: ['Hukuk', 'Tarih'] }
        ];
        
        let results = mockData;
        if (category) {
            results = results.filter(p => p.categories.includes(category));
        }
        if (q) {
            results = results.filter(p => 
                p.title.toLowerCase().includes(q.toLowerCase()) || 
                p.abstract.toLowerCase().includes(q.toLowerCase())
            );
        }
        
        console.log(`✅ Returning ${results.length} mock results`);
        return res.json(results);
    }

    try {
        let query = {};
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { abstract: { $regex: q, $options: 'i' } },
                { authors: { $regex: q, $options: 'i' } }
            ];
        }
        if (category) query.categories = category;
        
        const papers = await Paper.find(query).limit(20);
        console.log(`✅ Found ${papers.length} papers for search`);
        res.json(papers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get paper details
router.get('/:id', async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.id);
        if (!paper) return res.status(404).json({ message: 'Paper not found' });
        res.json(paper);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get graph-based recommendations
router.get('/:id/recommendations', async (req, res) => {
    if (process.env.MOCK_MODE === 'true') {
        return res.json([
            { _id: '2', title: 'BERT: Pre-training of Deep Bidirectional Transformers', score: 0.95 }
        ]);
    }
    try {
        const recs = await getRecommendations(req.params.id);
        res.json(recs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get graph data for visualization
router.get('/:id/graph', async (req, res) => {
    try {
        const graphData = await getPaperGraph(req.params.id);
        res.json(graphData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload and Parse PDF
router.post('/upload', upload.single('file'), async (req, res) => {
    console.log('📂 PDF Upload request received');
    try {
        if (!req.file) {
            console.error('❌ No file in request');
            return res.status(400).send('No file uploaded.');
        }

        console.log('📄 Parsing PDF...');
        const data = await pdf(req.file.buffer);
        const fullText = data.text;

        if (!fullText || fullText.trim().length === 0) {
            console.error('❌ PDF text extraction failed');
            throw new Error('PDF metni okunamadı.');
        }

        // Basic extraction (can be improved with AI)
        const lines = fullText.split('\n').filter(l => l.trim().length > 0);
        const title = lines[0]?.substring(0, 100) || 'Untitled Paper';
        const abstract = lines.slice(1, 10).join(' ').substring(0, 500) + '...';

        console.log(`✅ Extracted Title: ${title}`);

        // 1. Save to MongoDB
        const paper = new Paper({
            title: title || 'Yeni Yüklenen Makale',
            abstract: abstract || 'Bu makale sisteme yeni yüklendi ve analiz ediliyor. İçerik kısa süre içinde güncellenecektir.',
            authors: ['Dr. Ahmet Yılmaz', 'Doç. Dr. Elif Kaya'],
            categories: [categories[i % categories.length]]
        });
        const savedPaper = await paper.save();
        console.log(`✅ Saved to Mongo: ${savedPaper._id}`);

        // 2. Save to Neo4j
        if (process.env.MOCK_MODE !== 'true') {
            const session = driver.session();
            try {
                await session.run(`
                    CREATE (p:Paper {mongoId: $mongoId, title: $title, category: 'Yapay Zeka'})
                    MERGE (c:Keyword {name: 'Yapay Zeka'})
                    CREATE (p)-[:HAS_TOPIC]->(c)
                `, { mongoId: savedPaper._id.toString(), title: paper.title });
                console.log('✅ Saved to Neo4j');
            } catch (neoErr) {
                console.error('⚠️ Neo4j Sync Error:', neoErr.message);
            } finally {
                await session.close();
            }
        }

        res.json(savedPaper);
    } catch (err) {
        console.error('❌ Upload Route Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
