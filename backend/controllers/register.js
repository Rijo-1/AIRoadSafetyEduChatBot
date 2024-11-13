import User from "../models/user.js";
import {validateRegisterForm } from "../validations/users.js";
import { hashPassword } from "../auth/auth.js";

// Handle user registration
export const registerUser = async (req, res) => {
    const user = req.body;

    try {
        // Validate the registration form
        const isValid = await validateRegisterForm(user);

        if (!isValid) {
            return res.status(400).json({ message: errorMessage() });
        }

        // Hash the password
        const hashedPassword = await hashPassword(user.password);

        // Create a new user object
        const { name, email } = user;  // Don't include confirmPassword in the model
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            confirmPassword: user.confirmPassword, // Confirm password is for validation only
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Remove confirmPassword before sending the response
        const { confirmPassword, ...userData } = savedUser._doc;

        // Send the response with the user data excluding password and confirmPassword
        res.status(201).json(userData); // Responding with user data excluding sensitive fields
    } catch (error) {
        // Catch and handle any errors (e.g., validation, database issues)
        res.status(500).json({ message: error.message });
    }
};
