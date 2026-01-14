// LOCATION: backend/src/controllers/recoveryTaskController.js

const { RecoveryTask, Loan, User, Customer, Agent, Payment } = require('../models');
const { Op } = require('sequelize');
const {
  asyncHandler,
  NotFoundError,
  AuthorizationError
} = require('../utils/errorHandler');

exports.createRecoveryTask = asyncHandler(async (req, res) => {
  const {
    loanId,
    title,
    description,
    priority,
    taskType,
    dueDate,
    assignedTo,
    aiSuggestions,
    emiMonth
  } = req.body;

  const loan = await Loan.findByPk(loanId);
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  const task = await RecoveryTask.create({
    loanId,
    title,
    description,
    priority,
    taskType,
    dueDate,
    assignedTo,
    aiSuggestions,
    emiMonth
  });

  res.status(201).json({
    success: true,
    message: 'Recovery task created successfully',
    data: task
  });
});

// ✅ FIXED: GET ALL RECOVERY TASKS
exports.getRecoveryTasks = asyncHandler(async (req, res) => {
  const { loanId, status, assignedTo } = req.query;
  const where = {};

  if (loanId) where.loanId = parseInt(loanId);
  if (status) where.status = status;
  if (assignedTo) where.assignedTo = parseInt(assignedTo);

  // ✅ FETCH TASKS WITH ALL RELATIONS
  const tasks = await RecoveryTask.findAll({
    where,
    include: [
      {
        model: Loan,
        attributes: ['id', 'amount', 'customerId', 'status', 'recoveryStatus', 'agentId', 'termMonths', 'startDate'],
        include: [
          {
            model: Customer,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Agent,
            attributes: ['id', 'name', 'email']
          }
        ]
      },
      {
        model: User,
        as: 'Assignee',
        attributes: ['id', 'name', 'email', 'role'],
        required: false
      }
    ],
    order: [
      ['status', 'ASC'],
      ['priority', 'DESC'],
      ['createdAt', 'DESC']
    ]
  });

  console.log(`✅ Fetched ${tasks.length} recovery tasks from database`);

  // ✅ FILTER: Hide tasks for loans that are 'recovered' OR 'rejected'
  const filteredTasks = tasks.filter(task => {
    if (!task.Loan) return false;
    const loanStatus = (task.Loan.status || '').toLowerCase();
    const recoveryStatus = (task.Loan.recoveryStatus || '').toLowerCase();
    
    // Hide tasks if:
    // 1. Loan status is 'rejected' OR
    // 2. Recovery status is 'recovered' (admin marked as recovered)
    return loanStatus !== 'rejected' && recoveryStatus !== 'recovered';
  });

  console.log(`✅ Returning ${filteredTasks.length} filtered tasks to frontend`);

  res.json({
    success: true,
    count: filteredTasks.length,
    data: filteredTasks
  });
});


// ✅ NEW: Sync task status with loan status changes
exports.syncTaskStatusWithLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const { loanStatus } = req.body;
  
  const loan = await Loan.findByPk(loanId);
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }
  
  let taskStatus = 'PENDING';
  
  // Map loan status to task status
  if (loanStatus === 'active' || loanStatus === 'defaulted') {
    taskStatus = 'IN_PROGRESS';
  } else if (loanStatus === 'closed') {
    taskStatus = 'COMPLETED';
  } else if (loanStatus === 'rejected') {
    // Delete tasks for rejected loans
    const deletedCount = await RecoveryTask.destroy({
      where: { loanId: parseInt(loanId) }
    });
    
    console.log(`❌ Deleted ${deletedCount} recovery tasks for rejected Loan #${loanId}`);
    
    return res.json({
      success: true,
      message: `Deleted ${deletedCount} recovery task(s) for rejected loan`,
      data: { deletedCount }
    });
  }
  
  // Update all non-completed tasks
  const [updatedCount] = await RecoveryTask.update(
    { status: taskStatus },
    {
      where: {
        loanId: parseInt(loanId),
        taskType: 'EMI_TRACKING',
        status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] }
      }
    }
  );
  
  console.log(`✅ Updated ${updatedCount} task(s) to ${taskStatus} for Loan #${loanId}`);
  
  res.json({
    success: true,
    message: `Updated ${updatedCount} recovery task(s) to ${taskStatus}`,
    data: { updatedCount, newStatus: taskStatus }
  });
});


exports.updateRecoveryTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const task = await RecoveryTask.findByPk(id);
  if (!task) {
    throw new NotFoundError('Recovery task not found');
  }

  if (req.user.role === 'agent' && task.assignedTo !== req.user.id) {
    throw new AuthorizationError('You can only update tasks assigned to you');
  }

  if (updates.status === 'COMPLETED') {
    updates.completedDate = new Date();
  }

  await task.update(updates);

  res.json({
    success: true,
    message: 'Recovery task updated successfully',
    data: task
  });
});

exports.getTasksByLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;

  const tasks = await RecoveryTask.findAll({
    where: { loanId },
    include: [
      {
        model: User,
        as: 'Assignee',
        attributes: ['id', 'name', 'email']
      }
    ],
    order: [['priority', 'DESC'], ['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

module.exports = exports;
