const router = require('express').Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// HR: all users. Manager: own team. Employee: forbidden.
router.get('/', authorize('hr', 'manager'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'manager' ? { manager: req.user._id } : {};
    const users = await User.find(filter).select('-password').populate('manager', 'name').sort('name');
    res.json(users);
  } catch (e) {
    next(e);
  }
});

// Managers list (for HR assigning managers) - HR only
router.get('/managers', authorize('hr'), async (req, res, next) => {
  try {
    res.json(await User.find({ role: 'manager', active: true }).select('name department'));
  } catch (e) {
    next(e);
  }
});

// Own profile
router.put('/me/profile', async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (req.body.password) {
      if (req.body.password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = req.body.password;
    }
    await user.save();
    const out = user.toObject();
    delete out.password;
    res.json(out);
  } catch (e) {
    next(e);
  }
});

// HR creates user
router.post('/', authorize('hr'), async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const out = user.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
});

// HR updates user
router.put('/:id', authorize('hr'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const fields = ['name', 'email', 'role', 'department', 'designation', 'phone', 'address', 'manager', 'joinDate', 'leaveBalance', 'active'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f] === '' && f === 'manager' ? null : req.body[f];
    });
    if (req.body.password) user.password = req.body.password;
    await user.save();
    const out = user.toObject();
    delete out.password;
    res.json(out);
  } catch (e) {
    next(e);
  }
});

// HR deletes user
router.delete('/:id', authorize('hr'), async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
