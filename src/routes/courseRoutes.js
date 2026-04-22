const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', auth, isAdmin, createCourse);
router.put('/:id', auth, isAdmin, updateCourse);
router.delete('/:id', auth, isAdmin, deleteCourse);

module.exports = router;