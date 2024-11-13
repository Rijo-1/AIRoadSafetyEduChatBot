import User from "../models/user.js";
import {validateChangePasswordForm } from "../validations/users.js";
import { hashPassword, comparePassword } from "../auth/auth.js";

// Handle password change
export const changePassword = async (req, res) => {
    const userInfo = req.body;

    try {
        // Validate change password form
        const isValid = validateChangePasswordForm(userInfo);
        if (!isValid) {
            return res.status(400).json({ message:  "Hello"});
        }

        // Logged-in user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if new password is the same as old password
        const isPasswordMatch = await comparePassword(userInfo.password, user.password);
        if (isPasswordMatch) {
            return res.status(400).json({ message: "The new password cannot be the same as the old password. Please choose a different one." });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(userInfo.password);

        // Update the password field
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        return res.status(200).json({ message: "Password has been successfully updated." });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
