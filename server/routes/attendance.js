const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const today = () => new Date().toISOString().slice(0, 10);

router.post('/checkin', async (req, res, next) => {
  try {
    const date = today();
    const existing = await Attendance.findOne({ user: req.user._id, date });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });
    const now = new Date();
    // Late if after 10:00 server time
    const status = now.getHours() >= 10 ? 'late' : 'present';
    const rec = await Attendance.create({ user: req.user._id, date, checkIn: now, status });
    res.status(201).json(rec);
  } catch (e) {
    next(e);
  }
});

router.post('/checkout', async (req, res, next) => {
  try {
    const rec = await Attendance.findOne({ user: req.user._id, date: today() });
    if (!rec) return res.status(400).json({ message: 'You have not checked in today' });
    if (rec.checkOut) return res.status(400).json({ message: 'Already checked out' });
    rec.checkOut = new Date();
    const hours = (rec.checkOut - rec.checkIn) / 3600000;
    if (hours < 4) rec.status = 'half-day';
    await rec.save();
    res.json(rec);
  } catch (e) {
    next(e);
  }
});

router.get('/mine', async (req, res, next) => {
  try {
    res.json(await Attendance.find({ user: req.user._id }).sort('-date').limit(60));
  } catch (e) {
    next(e);
  }
});

// HR: all. Manager: team. Optional ?date=YYYY-MM-DD
router.get('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      filter.user = { $in: team.map((t) => t._id) };
    }
    res.json(await Attendance.find(filter).populate('user', 'name department').sort('-date').limit(300));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
