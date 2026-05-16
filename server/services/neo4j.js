const { driver } = require('../db');

const getRecommendations = async (paperId) => {
    const session = driver.session();
    try {
        // Find papers cited by papers that cite this paper (2nd degree)
        // Or find papers with common authors/keywords
        const result = await session.run(`
            MATCH (p:Paper {mongoId: $paperId})
            MATCH (p)-[:CITES*1..2]-(rec:Paper)
            WHERE rec.mongoId <> $paperId
            RETURN rec.mongoId AS id, rec.title AS title, count(*) AS strength
            ORDER BY strength DESC
            LIMIT 5
        `, { paperId });
        
        return result.records.map(record => ({
            id: record.get('id'),
            title: record.get('title'),
            strength: record.get('strength').toNumber()
        }));
    } finally {
        await session.close();
    }
};

const getPaperGraph = async (paperId) => {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (p:Paper {mongoId: $paperId})-[r:CITES]-(target:Paper)
            RETURN p.mongoId AS source, p.title AS sourceTitle, p.category AS sourceCategory,
                   target.mongoId AS target, target.title AS targetTitle, target.category AS targetCategory
            LIMIT 30
        `, { paperId });
        
        const nodes = new Map();
        const links = [];
        
        result.records.forEach(record => {
            const sId = record.get('source');
            const sTitle = record.get('sourceTitle');
            const sCat = record.get('sourceCategory');
            const tId = record.get('target');
            const tTitle = record.get('targetTitle');
            const tCat = record.get('targetCategory');
            
            if (!nodes.has(sId)) nodes.set(sId, { id: sId, title: sTitle, category: sCat, main: true });
            if (!nodes.has(tId)) nodes.set(tId, { id: tId, title: tTitle, category: tCat });
            
            links.push({ source: sId, target: tId });
        });
        
        return {
            nodes: Array.from(nodes.values()),
            links
        };
    } finally {
        await session.close();
    }
};

module.exports = { getRecommendations, getPaperGraph };
