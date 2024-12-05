const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all barbers
router.get('/barbers', auth, async (req, res) => {
    try {
        const barbers = await User.find({ role: 'barber' }).select('-password');
        res.json(barbers);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
