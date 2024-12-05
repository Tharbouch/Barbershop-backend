const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    barber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    services: [{ type: String, required: true }],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending','completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
