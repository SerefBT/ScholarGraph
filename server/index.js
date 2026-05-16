const express = require('express');
const cors = require('cors');
const { connectMongo, checkNeo4j } = require('./db');
const paperRoutes = require('./routes/papers');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/papers', paperRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Academic Recommendation System API is running...');
});

// Start Server
const start = async () => {
    if (process.env.MOCK_MODE === 'true') {
        console.log('⚠️ Running in MOCK MODE (No DB required)');
    } else {
        await connectMongo();
        await checkNeo4j();
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

start();
