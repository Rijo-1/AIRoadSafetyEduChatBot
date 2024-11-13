import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const URI = "mongodb+srv://sand:1234@cluster1.gjlrj.mongodb.net/drivingSite?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        await mongoose.connect(URI); // No need for deprecated options now
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);  // Exit the application if MongoDB connection fails
    }
};

export default connectDB;
