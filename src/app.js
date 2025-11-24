const express = require('express');
const cors = require('cors');
const app = express();

const path = require('path');
const router = require(path.join(__dirname, 'routes'));

app.use(cors());
app.use(express.json());

app.use('/api', router);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));



module.exports = app;
