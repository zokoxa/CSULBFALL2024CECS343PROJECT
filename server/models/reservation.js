// server/models/Reservation.js

const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    licensePlate: { type: String, required: true },
    lastName: { type: String, required: true },
    reservationDate: { type: Date, required: true }
});

module.exports = mongoose.model("Reservation", reservationSchema);
