const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set default structure for the database
db.defaults({ passwords: [] }).write();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to check passwords
app.post('/check', (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    // Check if the password exists in the database
    const passwordData = db.get('passwords').find({ password }).value();

    if (passwordData) {
        // Update the password's stats
        passwordData.users += 1;
        passwordData.uses += 1;
        db.write();
    } else {
        // Add a new password entry
        db.get('passwords').push({ password, users: 1, uses: 1 }).write();
    }

    // Fetch the updated password data
    const updatedData = db.get('passwords').find({ password }).value();

    // Get the top 5 most commonly used passwords
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

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
