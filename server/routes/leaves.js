const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const dayCount = (s, e) => Math.floor((new Date(e) - new Date(s)) / 86400000) + 1;

// Apply for leave
router.post('/', async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) return res.status(400).json({ message: 'Dates and reason are required' });
    const days = dayCount(startDate, endDate);
    if (days < 1) return res.status(400).json({ message: 'End date must be on or after start date' });
    if (type !== 'unpaid' && days > req.user.leaveBalance) {
      return res.status(400).json({ message: `Insufficient leave balance (${req.user.leaveBalance} days left)` });
    }
    const leave = await Leave.create({ user: req.user._id, type, startDate, endDate, days, reason });
    res.status(201).json(leave);
  } catch (e) {
    next(e);
  }
});

// My leaves
router.get('/mine', async (req, res, next) => {
  try {
    res.json(await Leave.find({ user: req.user._id }).populate('reviewedBy', 'name').sort('-createdAt'));
  } catch (e) {
    next(e);
  }
});

// Requests to review. HR: everyone's. Manager: direct reports'.
router.get('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      filter = { user: { $in: team.map((t) => t._id) } };
    }
    res.json(
      await Leave.find(filter)
        .populate('user', 'name department role')
        .populate('reviewedBy', 'name')
        .sort('-createdAt')
    );
  } catch (e) {
    next(e);
  }
});

// Approve / reject
router.put('/:id/status', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Leave already reviewed' });
    if (String(leave.user) === String(req.user._id)) return res.status(403).json({ message: 'You cannot review your own leave' });

    const applicant = await User.findById(leave.user);
    if (req.user.role === 'manager') {
      if (String(applicant.manager) !== String(req.user._id)) return res.status(403).json({ message: 'Not your team member' });
    }
    // Manager leave requests are reviewed by HR only (covered: manager only sees direct reports).

    if (status === 'approved' && leave.type !== 'unpaid') {
      if (applicant.leaveBalance < leave.days) return res.status(400).json({ message: 'Employee has insufficient balance' });
      applicant.leaveBalance -= leave.days;
      await applicant.save();
    }
    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    await leave.save();
    res.json(leave);
  } catch (e) {
    next(e);
  }
});

// Cancel own pending leave
router.delete('/:id', async (req, res, next) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, user: req.user._id });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
    await leave.deleteOne();
    res.json({ message: 'Leave cancelled' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
