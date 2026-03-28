const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.handleChat);
router.post('/suggestions', chatController.getInitialSuggestions);

module.exports = router;
