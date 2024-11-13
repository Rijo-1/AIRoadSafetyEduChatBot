import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Handle token validation
export const isTokenValid = async (req, res) => {
    try {
        const userToken = req.header("Authorization")?.split("Bearer ")[1];

        // If token is not provided
        if (!userToken) {
            return res.status(403).json({ message: "Token not provided" });
        }

        // Verify token
        const verifyToken = jwt.verify(userToken, process.env.JWT_SECRET_KEY);

        // If token is invalid or expired
        if (!verifyToken) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Check if the user exists
        const user = await User.findById(verifyToken.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If everything is valid, return success
        return res.status(200).json({ message: "Token is valid" });

    } catch (err) {
        // Internal server error
        return res.status(500).json({ error: err.message });
    }
};
