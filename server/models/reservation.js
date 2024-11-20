// server/models/Reservation.js

const mongoose = require("mongoose");

const schemaOptions = {
    versionKey: false // Disable __v
};

const reservationSchema = new mongoose.Schema({
    licensePlate: { type: String, required: true },
    lastName: { type: String, required: true },
    reservationDate: { type: String, required: true },
    qrCode: { type: String }
}, schemaOptions);

module.exports = mongoose.model("Reservation", reservationSchema);
