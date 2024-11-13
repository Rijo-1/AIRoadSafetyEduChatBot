import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";  // MongoDB connection logic
import userRoutes from "./routes/users.js";  // Import user routes

// Load environment variables from .env file
dotenv.config();

// Initialize the express app
const app = express();

// Middleware to parse JSON and handle URL-encoded data
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Enable CORS for all origins (you can restrict this to specific domains later)
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',  // React frontend URL
    methods: 'GET, POST',
    credentials: true,  // Allow cookies to be sent with requests
}));

// Connect to MongoDB
connectDB();  // This will connect to your MongoDB database

// Example route
app.get("/", (req, res) => {
    res.send("Hello, MongoDB connected!");
});

// Use user routes for all user-related actions
app.use("/", userRoutes);

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);  // Log the stack trace for debugging
    res.status(500).json({ message: "Something went wrong!" });  // Send a generic error message
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
