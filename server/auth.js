const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// Initialize SQL table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
});

const register = (username, password) => {
    return new Promise((resolve, reject) => {
        const hash = bcrypt.hashSync(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, username });
        });
    });
};

const login = (username, password) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) reject(err);
            if (!user || !bcrypt.compareSync(password, user.password)) {
                reject(new Error('Geçersiz kullanıcı adı veya şifre'));
            } else {
                const token = jwt.sign({ id: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
                resolve({ token, user: { id: user.id, username: user.username } });
            }
        });
    });
};

module.exports = { register, login };
