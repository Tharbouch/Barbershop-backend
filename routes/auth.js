const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password, role });
        await user.save();

        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token });
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token });
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
