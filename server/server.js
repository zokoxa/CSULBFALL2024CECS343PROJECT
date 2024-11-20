// server/server.js
const express = require("express");
const bodyParser = require("body-parser");
const Reservation = require("./models/reservation");
const app = express();
const PORT = 3000;
const connectDB = require("../config/db");
const QRCode = require('qrcode');

connectDB();

// Serve static files from node_modules
app.use('/node_modules', express.static('node_modules'));

// Middleware
app.use(express.json()); // Parses JSON request bodies
app.use(bodyParser.json()); // Parses incoming JSON requests
app.use(express.static("public")); // Serves static files from 'public' directory

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Route to get the availability of reserved spots for a specific date
app.get("/api/availabilityReserved", async (req, res) => {
    try {
        const { reservationDate } = req.query;

        // Default to today's date if no date is provided
        const today = new Date();
        const parsedDate = reservationDate ? new Date(reservationDate) : today;

        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: "Invalid reservation date" });
        }

        const formattedDate = parsedDate.toISOString().split("T")[0];

        // Count only active reservations for the given date
        const reservationCount = await Reservation.countDocuments({
            reservationDate: formattedDate,
        });

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
        // Parse and validate the reservation date
        const parsedDate = new Date(reservationDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: "Invalid reservation date" });
        }

        // Format the date as 'YYYY-MM-DD'
        const formattedDate = parsedDate.toISOString().split("T")[0];

        // Check if capacity has been reached for the day
        const reservationCount = await Reservation.countDocuments({ reservationDate: formattedDate });
        if (reservationCount >= 300) {
            return res.status(400).json({ message: "Parking lot is full for the selected date." });
        }

        // Generate QR code
        const qrData = `Reservation for ${licensePlate} on ${formattedDate}`;
        const qrCode = await QRCode.toDataURL(qrData);

        // Save the new reservation
        const newReservation = new Reservation({
            licensePlate,
            lastName,
            reservationDate: formattedDate, // Save as a string in 'YYYY-MM-DD'
            qrCode
        });

        const savedReservation = await newReservation.save();
        res.json({
            message: "Reservation successful!",
            reservationId: savedReservation._id,
            qrCode
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

// Endpoint to mark reservation as 'entered'
app.post("/api/enter", async (req, res) => {
    const { reservationId } = req.body;

    try {
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        if (reservation.status !== "active") {
            return res.status(400).json({ message: "Reservation is not active." });
        }

        reservation.status = "entered";
        await reservation.save();

        res.json({ message: "Reservation marked as entered." });
    } catch (error) {
        console.error("Error marking reservation as entered:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

// Endpoint to handle QR code scans
app.post("/api/scanQRCode", async (req, res) => {
    const { qrCodeData } = req.body; // QR code data sent from scanner

    try {
        // Find reservation based on QR code data
        const reservation = await Reservation.findOne({ qrCode: qrCodeData });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found." });
        }

        // Handle state transitions
        if (reservation.status === "active") {
            reservation.status = "entered"; // Mark as entered
            await reservation.save();
            return res.json({ message: "Car entered the garage." });
        } else if (reservation.status === "entered") {
            reservation.status = "completed"; // Mark as exited
            await reservation.save();
            return res.json({ message: "Car exited the garage. Spot is now available." });
        } else if (reservation.status === "completed") {
            return res.status(400).json({ message: "Reservation has already been completed." });
        } else {
            return res.status(400).json({ message: "Invalid reservation status." });
        }
    } catch (error) {
        console.error("Error processing QR code scan:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});