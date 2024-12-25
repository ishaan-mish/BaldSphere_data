const express = require('express');
const mongoose = require('mongoose');
const { parse } = require('json2csv');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI
const uri = "mongodb+srv://mishraishaan31:Mahi%40918117@cluster0.r1s1v.mongodb.net/baldsphere?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Define Schema and Model
const datasetSchema = new mongoose.Schema({
  word: String,
  action: String,
  area_of_brain: String,
});

const Dataset = mongoose.model('Dataset', datasetSchema);

// Middleware to serve static files (CSS, JS)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // Serve the 'public' folder, where your index.html should reside

// Route to handle form submission
app.post('/submit', (req, res) => {
  const { word, action, area_of_brain } = req.body;

  if (!word || !action || !area_of_brain) {
    return res.status(400).send('All fields are required!');
  }

  // Create a new document in the "dataset" collection
  const newData = new Dataset({ word, action, area_of_brain });

  newData.save()
    .then(() => {
      res.send('Data saved successfully!');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error saving data!');
    });
});

// Route to extract data and generate CSV for download
app.get('/download', async (req, res) => {
  try {
    const data = await Dataset.find(); // Fetch data from the dataset collection
    if (!data.length) {
      return res.status(404).send('No data available to download!');
    }

    // Format the data to include 'word', 'action', and 'area_of_brain' fields
    const formattedData = data.map(item => ({
      word: item.word,
      action: item.action,
      area_of_brain: item.area_of_brain,
    }));

    // Convert to CSV using json2csv
    const csv = parse(formattedData);

    res.header('Content-Type', 'text/csv');
    res.attachment('data.csv');  // Suggested filename for the download
    res.send(csv);  // Send the CSV file as the response
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating CSV!');
  }
});

// Route to serve index.html (make sure it's in the 'public' folder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
