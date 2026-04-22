const express = require('express');
const router = express.Router();
const { getAllTopics, getTopicById, createTopic, updateTopic, deleteTopic } = require('../controllers/topicController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getAllTopics);
router.get('/:id', getTopicById);
router.post('/', auth, isAdmin, createTopic);
router.put('/:id', auth, isAdmin, updateTopic);
router.delete('/:id', auth, isAdmin, deleteTopic);

module.exports = router;