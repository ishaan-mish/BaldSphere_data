const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve frontend files from 'public' folder
app.use(cors()); // Enable CORS for API calls

// Route to handle form submission
app.post('/submit', (req, res) => {
    const { word, action, area_of_brain } = req.body;

    if (!word || !action || !area_of_brain) {
        return res.status(400).send('All fields are required!');
    }

    // Append data to a CSV file
    const data = `${word},${action},${area_of_brain}\n`;
    fs.appendFile('data.csv', data, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving data!');
        }

        res.send('Data saved successfully!');
    });
});

// Route to serve the CSV file for download
app.get('/download', (req, res) => {
    const filePath = path.resolve(__dirname, 'data.csv');
    
    // Check if the file exists before attempting to send it
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'data.csv', (err) => {
            if (err) {
                console.error('Error while sending file:', err);
            }
        });
    } else {
        res.status(404).send('File not found!');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
