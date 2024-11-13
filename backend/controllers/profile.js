import User from "../models/user.js";

// Handle user profile retrieval
export const userProfile = async (req, res) => {
    const userID = req.user._id;  // Assuming user ID is attached to req.user from authentication middleware

    try {
        // Fetch the user from the database
        const user = await User.findById(userID);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Respond with user details (excluding `date` field since it's not in the schema)
        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        // Handle any other errors (e.g., database errors)
        return res.status(500).json({ message: error.message });
    }
};
