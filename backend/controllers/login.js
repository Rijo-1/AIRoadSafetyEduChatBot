import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { validateLoginForm } from "../validations/users.js";
import { comparePassword } from "../auth/auth.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Handle user login
export const loginUser = async (req, res) => {
    const userInfo = req.body;

    try {
        // Validate the login form
        if (!validateLoginForm(userInfo)) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if user exists by email
        const user = await User.findOne({ email: userInfo.email });

        if (!user) {
            return res.status(404).json({ message: "An account with this email does not exist." });
        }

        // Check if password is correct
        const isPasswordCorrect = await comparePassword(userInfo.password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // Generate JWT token for the user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        // Set the JWT token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,  // Prevent client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (SSL required)
            sameSite: 'Strict', // Prevent sending cookies in cross-origin requests
            maxAge: 3600 * 1000  // 1 hour (matches JWT expiration)
        });

        // Respond with user details (without the token in the response body)
        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        // Catch any errors and send the error message
        return res.status(500).json({ message: error.message });
    }
};
