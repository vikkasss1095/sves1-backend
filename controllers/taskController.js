const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @route POST /api/tasks (admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      deadline,
    });

    await Notification.create({
      recipient: assignedTo,
      sender: req.user._id,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${title}". Priority: ${priority}.`,
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/tasks (admin sees all, vendor sees own)
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (req.user.role === 'vendor') query.assignedTo = req.user._id;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name companyName')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ tasks, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/tasks/:id/status (vendor updates own task status)
const updateTaskStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const query = { _id: req.params.id };
    if (req.user.role === 'vendor') query.assignedTo = req.user._id;

    const task = await Task.findOneAndUpdate(
      query,
      {
        status,
        remarks,
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/tasks/:id (admin only)
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTaskStatus, deleteTask };