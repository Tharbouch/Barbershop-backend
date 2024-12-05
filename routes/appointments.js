// routes/appointments.js
const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

const servicesList = [
    { name: 'Haircut', price: 20 },
    { name: 'Beard Trim', price: 15 },
    { name: 'Shave', price: 15 },
    { name: 'Hair Coloring', price: 40 },
    { name: 'Hair Styling', price: 25 },
    { name: 'Facial', price: 30 },
    { name: 'Hair Treatment', price: 35 },
];

// Create Appointment
router.post('/', auth, async (req, res) => {
    const { barberId, date, services } = req.body;

    if (!barberId || !date || !services || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ msg: 'Please provide barberId, date, and at least one service.' });
    }

    try {
        // Calculate total price
        let totalPrice = 0;
        services.forEach(service => {
            const foundService = servicesList.find(s => s.name === service);
            if (foundService) {
                totalPrice += foundService.price;
            } else {
                throw new Error(`Service "${service}" is not available.`);
            }
        });

        const appointment = new Appointment({
            user: req.user.userId,
            barber: barberId,
            date,
            services,
            totalPrice,
        });

        await appointment.save();
        res.json(appointment);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Get Appointments for User
router.get('/user', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user.userId })
            .populate('barber', 'name email');
        res.json(appointments);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get Appointments for Barber
router.get('/barber', auth, async (req, res) => {
    if (req.user.role !== 'barber') {
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const appointments = await Appointment.find({ barber: req.user.userId })
            .populate('user', 'name email');
        res.json(appointments);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update Appointment Status (Optional)
router.put('/:id', auth, async (req, res) => {
    const { status } = req.body;
    try {
        let appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        // Only the barber can update the appointment
        if (appointment.barber.toString() !== req.user.userId) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        appointment.status = status || appointment.status;
        await appointment.save();
        res.json(appointment);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
