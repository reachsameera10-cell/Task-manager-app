import { prisma } from '../db/prisma.js';
import { taskSchema } from '../utils/validation.js';

const priorityRank = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const normalizeSortDirection = (value) => (value === 'asc' ? 'asc' : 'desc');

const sortTasks = (tasks, sortBy, direction) => {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'priority':
        comparison = priorityRank[a.priority] - priorityRank[b.priority];
        break;
      case 'dueDate': {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        comparison = dateA - dateB;
        break;
      }
      case 'updatedAt':
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
        break;
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
    }

    return direction === 'asc' ? comparison : comparison * -1;
  });

  return sorted;
};

export const getTasks = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Math.min(Number(req.query.limit ?? 10), 50);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy ?? 'createdAt';
    const order = normalizeSortDirection(req.query.order ?? 'desc');
    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).toUpperCase() : '';
    const priority = req.query.priority ? String(req.query.priority).toUpperCase() : '';
    const overdue = req.query.overdue === 'true';
    const dueDate = req.query.dueDate ? String(req.query.dueDate) : '';

    const where = {
      userId: req.user.id,
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    };

    const dueDateConditions = [];

    if (dueDate) {
      const selectedDate = new Date(dueDate);
      if (!Number.isNaN(selectedDate.getTime())) {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        dueDateConditions.push({ gte: start, lte: end });
      }
    }

    if (overdue) {
      dueDateConditions.push({ lt: new Date() });
    }

    if (dueDateConditions.length > 0) {
      where.dueDate = dueDateConditions.length === 1 ? dueDateConditions[0] : { AND: dueDateConditions };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    const sortedTasks = sortTasks(tasks, sortBy, order);

    return res.status(200).json({
      tasks: sortedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit) || 1),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    return res.status(500).json({ message: 'Failed to fetch task.' });
  }
};

export const createTask = async (req, res) => {
  try {
    const parsed = taskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? 'Task validation failed.',
      });
    }

    const { title, description = '', status, priority, dueDate } = parsed.data;
    const normalizedDueDate = dueDate ? new Date(dueDate) : null;

    if (normalizedDueDate && Number.isNaN(normalizedDueDate.getTime())) {
      return res.status(400).json({ message: 'Due date is invalid.' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? '',
        status: status ?? 'PENDING',
        priority: priority ?? 'MEDIUM',
        dueDate: normalizedDueDate,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Failed to create task.' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const parsed = taskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? 'Task validation failed.',
      });
    }

    const { title, description = '', status, priority, dueDate } = parsed.data;
    const normalizedDueDate = dueDate !== undefined && dueDate !== null ? new Date(dueDate) : null;

    if (normalizedDueDate && Number.isNaN(normalizedDueDate.getTime())) {
      return res.status(400).json({ message: 'Due date is invalid.' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title: title ?? existingTask.title,
        description: description ?? existingTask.description ?? '',
        status: status ?? existingTask.status,
        priority: priority ?? existingTask.priority,
        dueDate: dueDate === undefined ? existingTask.dueDate : normalizedDueDate,
      },
    });

    return res.status(200).json({
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Failed to update task.' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await prisma.task.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json({
      message: 'Task deleted successfully.',
      taskId: req.params.id,
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const [total, pending, inProgress, completed, overdue] = await Promise.all([
      prisma.task.count({ where: { userId: req.user.id } }),
      prisma.task.count({ where: { userId: req.user.id, status: 'PENDING' } }),
      prisma.task.count({ where: { userId: req.user.id, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId: req.user.id, status: 'COMPLETED' } }),
      prisma.task.count({
        where: {
          userId: req.user.id,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return res.status(200).json({
      stats: {
        total,
        pending,
        inProgress,
        completed,
        overdue,
        completionRate: Number(completionRate.toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
};
