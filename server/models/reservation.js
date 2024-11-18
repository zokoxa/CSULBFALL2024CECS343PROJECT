// server/models/Reservation.js

const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    licensePlate: { type: String, required: true },
    lastName: { type: String, required: true },
    reservationDate: { type: Date, required: true },
    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null },
    status: { type: String, default: "Reserved" } // Options: "Reserved", "In Garage", "Exited", "Expired"
});

module.exports = mongoose.model("Reservation", reservationSchema);
