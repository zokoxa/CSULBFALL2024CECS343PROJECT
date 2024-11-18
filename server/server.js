// server/server.js

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json()); // Parses incoming JSON requests
app.use(express.static("public")); // Serves static files from 'public' directory

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Reservation route
app.post("/api/reserve", (req, res) => {
    const { licensePlate, lastName } = req.body;
    
    // Log received data for debugging
    console.log("Reservation received:", { licensePlate, lastName });
    
    // Respond with a success message
    res.json({ message: "Reservation successful!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});