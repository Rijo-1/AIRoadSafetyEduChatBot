import User from "../models/user.js";

// Handle user deletion
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if a user with that ID exists
        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({
                message: "There is no user with this ID",
                id,
            });
        }

        // Check if it's the account of the current logged-in user
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                message: "Cannot delete an account that is not yours.",
            });
        }

        // Delete user
        const deletedUser = await User.findByIdAndDelete(user._id);

        return res.status(200).json({
            message: "Account has been successfully deleted.",
            user: { name: deletedUser.name, email: deletedUser.email }, // Include relevant info for response
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
