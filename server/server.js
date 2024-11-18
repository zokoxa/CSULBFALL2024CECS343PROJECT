// server/server.js
const express = require("express");
const bodyParser = require("body-parser");
const Reservation = require("./models/reservation");
const app = express();
const PORT = 3000;
const connectDB = require("../config/db");
const QRCode = require('qrcode');

connectDB();


// Middleware
app.use(express.json()); // Parses JSON request bodies
app.use(bodyParser.json()); // Parses incoming JSON requests
app.use(express.static("public")); // Serves static files from 'public' directory

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Route to get the availability of reserved spots
app.get("/api/availabilityReserved", async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0]; // Get today's date
        const reservationCount = await Reservation.countDocuments({ reservationDate: today });

        // Assuming total capacity is 300 spots
        const totalCapacity = 300;
        const availableSpots = totalCapacity - reservationCount;

        res.json({ availableSpots });
    } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: "An error occurred while fetching availability." });
    }
});

// Reservation route
app.post("/api/reserve", async (req, res) => {
    const { licensePlate, lastName, reservationDate } = req.body;

    try {
        // Parse reservationDate to ensure it's a valid Date object
        const parsedDate = new Date(reservationDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: "Invalid reservation date" });
        }

        // Generate a unique string or URL for the QR code
        const qrData = `Reservation for ${licensePlate} on ${reservationDate}`;

        // Generate QR code as a string (URL or base64 data)
        const qrCode = await QRCode.toDataURL(qrData);
        console.log("Generated QR Code:", qrCode); // Debugging log

        // Format the date for the capacity check
        const dateOnly = parsedDate.toISOString().split("T")[0];

        // Check if capacity has been reached (e.g., 300 spots for the day)
        const reservationCount = await Reservation.countDocuments({
            reservationDate: dateOnly
        });

        if (reservationCount >= 300) {
            return res.status(400).json({ message: "Parking lot is full for the selected date." });
        }

        // Save the new reservation
        const newReservation = new Reservation({
            licensePlate,
            lastName,
            reservationDate: parsedDate, // Ensure it's a valid Date object
            qrCode
        });

        const savedReservation = await newReservation.save();
        res.json({ 
            message: "Reservation successful!",
            reservationId: savedReservation._id, // Return the `_id` to the user
            qrCode: qrCode // Return the QR code to the frontend
        });

    } catch (error) {
        console.error("Error saving reservation:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});


app.delete("/api/reservation/:id", async (req, res) => {
    const reservationId = req.params.id;

    try {
        const result = await Reservation.findByIdAndDelete(reservationId);

        if (!result) {
            return res.status(404).json({ message: "Reservation not found or already canceled." });
        }

        res.json({ message: "Reservation canceled successfully." });
    } catch (error) {
        console.error("Error canceling reservation:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

app.post("/api/manageReservation", async (req, res) => {
    const { reservationId, licensePlate } = req.body;
    
    try {
        const reservation = await Reservation.findOne({ _id: reservationId, licensePlate });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        res.json(reservation);
    } catch (error) {
        console.error("Error retrieving reservation:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});