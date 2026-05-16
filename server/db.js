require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');

// MongoDB Connection
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};

// Neo4j Driver
const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password')
);

const checkNeo4j = async () => {
    try {
        await driver.verifyConnectivity();
        console.log('✅ Neo4j Connected');
    } catch (err) {
        console.error('❌ Neo4j Connection Error:', err.message);
    }
};

module.exports = { connectMongo, driver, checkNeo4j };
