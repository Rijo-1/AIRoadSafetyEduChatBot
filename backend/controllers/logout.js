// controllers/logout.js
export const logoutUser = (req, res) => {
    // Clear the JWT cookie on logout
    res.clearCookie('token', { httpOnly: true, sameSite: 'Strict' });

    // Respond with a success message
    return res.status(200).json({ message: "Logged out successfully." });
};
