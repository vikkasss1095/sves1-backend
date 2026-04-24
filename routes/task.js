const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTasks);
router.post('/', isAdmin, createTask);
router.put('/:id/status', updateTaskStatus);
router.delete('/:id', isAdmin, deleteTask);

module.exports = router;