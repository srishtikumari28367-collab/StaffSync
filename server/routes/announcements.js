const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    res.json(await Announcement.find().populate('postedBy', 'name').sort('-pinned -createdAt'));
  } catch (e) {
    next(e);
  }
});

router.post('/', authorize('hr'), async (req, res, next) => {
  try {
    const { title, content, category, pinned } = req.body;
    const a = await Announcement.create({ title, content, category, pinned, postedBy: req.user._id });
    res.status(201).json(a);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', authorize('hr'), async (req, res, next) => {
  try {
    const { title, content, category, pinned } = req.body;
    const a = await Announcement.findByIdAndUpdate(req.params.id, { title, content, category, pinned }, { new: true, runValidators: true });
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(a);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authorize('hr'), async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
