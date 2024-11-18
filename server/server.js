// server/server.js
let availableFirstComeSpots = 200; // Initialize for 200 first-come, first-serve spots
const express = require("express");
const bodyParser = require("body-parser");
const Reservation = require("./models/reservation");
const app = express();
const PORT = 3000;
const connectDB = require("../config/db");

connectDB();


// Middleware
app.use(bodyParser.json()); // Parses incoming JSON requests
app.use(express.static("public")); // Serves static files from 'public' directory

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Route for entering the garage with a first-come, first-serve spot
app.post("/api/enterFirstCome", (req, res) => {
    if (availableFirstComeSpots > 0) {
        availableFirstComeSpots--; // Decrement available spots by 1
        res.json({ message: `Spot taken. Spots left: ${availableFirstComeSpots}` });
    } else {
        res.status(400).json({ message: "No first-come, first-serve spots available." });
    }
});

// Route for exiting the garage with a first-come, first-serve spot
app.post("/api/exitFirstCome", (req, res) => {
    if (availableFirstComeSpots < 200) {
        availableFirstComeSpots++; // Increment available spots by 1
        res.json({ message: `Spot freed. Spots available: ${availableFirstComeSpots}` });
    } else {
        res.status(400).json({ message: "No cars to exit from first-come, first-serve spots." });
    }
});

// Route to get the current number of available first-come, first-serve spots
app.get("/api/availabilityFirstCome", (req, res) => {
    res.json({ availableSpots: availableFirstComeSpots });
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

        // Format the date for the capacity check
        const dateOnly = parsedDate.toISOString().split("T")[0];

        // Check if capacity has been reached (e.g., 300 spots for the day)
        const reservationsForDate = await Reservation.countDocuments({
            reservationDate: dateOnly
        });

        if (reservationsForDate >= 300) {
            return res.status(400).json({ message: "Parking lot is full for the selected date." });
        }

        // Save the new reservation
        const newReservation = new Reservation({
            licensePlate,
            lastName,
            reservationDate: parsedDate  // Ensure it's a valid Date object
        });

        await newReservation.save();
        res.json({ message: "Reservation successful!" });

    } catch (error) {
        console.error("Error saving reservation:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});