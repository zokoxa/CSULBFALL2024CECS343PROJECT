// config/db.js
const mongoose = require("mongoose");

// Replace this with your MongoDB connection string
const mongoURI = "mongodb+srv://theuniverseequation:giAyR8wZsYsTutXK@parking-garage24.ofqvt.mongodb.net/parking_database?retryWrites=true&w=majority&appName=Parking-Garage24";

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure if there's an error
    }
};

module.exports = connectDB;
