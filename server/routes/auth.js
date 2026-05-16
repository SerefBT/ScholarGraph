const express = require('express');
const router = express.Router();
const { register, login } = require('../auth');

router.post('/register', async (req, res) => {
    try {
        const user = await register(req.body.username, req.body.password);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const result = await login(req.body.username, req.body.password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

module.exports = router;
