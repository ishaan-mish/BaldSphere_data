const express = require('express');
const mongoose = require('mongoose');
const { parse } = require('json2csv');
const path = require('path');

const app = express();

// MongoDB connection URI
const uri = "mongodb+srv://mishraishaan31:Mahi%40918117@cluster0.r1s1v.mongodb.net/baldsphere?retryWrites=true&w=majority";

// MongoDB connection
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Schema and Model
const datasetSchema = new mongoose.Schema({
  word: String,
  action: String,
  area_of_brain: String,
});
const Dataset = mongoose.model('Dataset', datasetSchema);

// Middleware to serve static files (CSS, JS)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve the 'public' folder

// Route to handle form submission
app.post('/submit', (req, res) => {
  const { word, action, area_of_brain } = req.body;

  if (!word || !action || !area_of_brain) {
    return res.status(400).send('All fields are required!');
  }

  // Create a new document in the "dataset" collection
  const newData = new Dataset({ word, action, area_of_brain });

  newData
    .save()
    .then(() => res.send('Data saved successfully!'))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error saving data!');
    });
});

// Route to extract data and generate CSV for download
app.get('/download', async (req, res) => {
  try {
    const data = await Dataset.find();
    if (!data.length) {
      return res.status(404).send('No data available to download!');
    }

    const formattedData = data.map(item => ({
      word: item.word,
      action: item.action,
      area_of_brain: item.area_of_brain,
    }));

    const csv = parse(formattedData);

    res.header('Content-Type', 'text/csv');
    res.attachment('data.csv');
    res.send(csv); // Send the CSV file as response
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating CSV!');
  }
});

// Route to serve index.html (make sure it's in the 'public' folder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the app for serverless function (Vercel)
module.exports = (req, res) => {
  app(req, res);  // Forward Vercel's request to your Express app
};
