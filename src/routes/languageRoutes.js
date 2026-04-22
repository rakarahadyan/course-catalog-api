const express = require('express');
const router = express.Router();
const { getAllLanguages, getLanguageById, createLanguage, updateLanguage, deleteLanguage } = require('../controllers/languageController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getAllLanguages);
router.get('/:id', getLanguageById);
router.post('/', auth, isAdmin, createLanguage);
router.put('/:id', auth, isAdmin, updateLanguage);
router.delete('/:id', auth, isAdmin, deleteLanguage);

module.exports = router;