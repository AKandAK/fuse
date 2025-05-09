const express = require('express');
const cors = require('cors');
const v1Router = require('./api/v1'); // Import the v1 router

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/v1', v1Router);

app.get('/', (req, res) => {
  res.send('Hello fuse');
});

module.exports = app;
