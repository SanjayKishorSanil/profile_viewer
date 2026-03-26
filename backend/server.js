const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const profileRoutes = require('./routes/profileRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
