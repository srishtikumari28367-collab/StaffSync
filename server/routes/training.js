const router = require('express').Router();
const Training = require('../models/Training');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const populate = (q) =>
  q.populate('createdBy', 'name').populate('participants.user', 'name department');

// HR: all. Manager: ones they created. Employee: ones they're assigned to.
router.get('/', async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'manager') filter = { createdBy: req.user._id };
    if (req.user.role === 'employee') filter = { 'participants.user': req.user._id };
    res.json(await populate(Training.find(filter).sort('-startDate')));
  } catch (e) {
    next(e);
  }
});

// Manager / HR create program. Managers can only assign their own team.
router.post('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, mode, participantIds = [] } = req.body;
    let ids = participantIds;
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      const allowed = new Set(team.map((t) => String(t._id)));
      ids = ids.filter((id) => allowed.has(String(id)));
    }
    const t = await Training.create({
      title,
      description,
      startDate,
      endDate,
      mode,
      createdBy: req.user._id,
      participants: ids.map((user) => ({ user })),
    });
    res.status(201).json(await populate(Training.findById(t._id)));
  } catch (e) {
    next(e);
  }
});

// Participant updates their own progress
router.put('/:id/progress', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['in-progress', 'completed'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const t = await Training.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    const p = t.participants.find((x) => String(x.user) === String(req.user._id));
    if (!p) return res.status(403).json({ message: 'You are not enrolled in this program' });
    p.status = status;
    await t.save();
    res.json(await populate(Training.findById(t._id)));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const t = await Training.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'manager' && String(t.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your program' });
    }
    await t.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
