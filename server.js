// Required Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Initialize App
const app = express();
const adapter = new FileSync('db.json'); // Database file
const db = low(adapter);

// Set up Default Database Structure
db.defaults({ passwords: [] }).write();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// API Routes
app.post('/check', (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    // Check if the password exists
    const passwordData = db.get('passwords').find({ password }).value();

    if (passwordData) {
        // Update existing password data
        passwordData.users += 1;
        passwordData.uses += 1;
        db.write();
    } else {
        // Add new password
        db.get('passwords').push({ password, users: 1, uses: 1 }).write();
    }

    // Fetch updated stats
    const updatedData = db.get('passwords').find({ password }).value();

    // Get top 5 most common passwords
    const commonPasswords = db.get('passwords')
        .orderBy(['uses'], ['desc'])
        .take(5)
        .value()
        .map(p => p.password);

    res.json({
        userCount: updatedData.users,
        usageCount: updatedData.uses,
        commonPasswords,
    });
});

// Serve HTML Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
