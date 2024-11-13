import User from "../models/user.js";

// Password criteria validation
function checkPasswordCriteria(password) {
    // Password must contain: 
    // - At least 1 lowercase letter
    // - At least 1 uppercase letter
    // - At least 1 digit
    // - At least 1 special character
    // - Minimum 8 characters in length
    const passwordCriteria = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.{8,})/;

    return passwordCriteria.test(password); // returns true or false
}

// Common password validation
const validatePassword = (password, confirmPassword) => {
    const isPasswordValid = checkPasswordCriteria(password);

    if (!isPasswordValid) {
        return "Invalid Password! Password must contain: 1 lowercase and 1 uppercase letter, 1 digit, 1 special character, and must be a minimum of 8 characters.";
    }

    if (password !== confirmPassword) {
        return "Passwords don't match.";
    }

    return null;  // No error
}

// Login form validation
export const validateLoginForm = (formInfo) => {
    const { email, password } = formInfo;

    // Check if there is any missing field
    if (!email || !password) {
        return "All fields are required."; // Error message directly returned
    }

    return true; // Validation passed
};

// Register form validation
export const validateRegisterForm = async (formInfo) => {
    const { name, email, password, confirmPassword } = formInfo;

    // Check if there is any missing field
    if (!name || !email || !password || !confirmPassword) {
        return "All fields are required."; // Error message directly returned
    }

    // Check if email is already registered (check uniqueness of email in the database)
    const isEmailRegistered = await User.countDocuments({ email });
    if (isEmailRegistered > 0) {
        return "An account with this email already exists."; // Error message directly returned
    }

    // Validate password and confirmPassword
    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) return passwordError; // If there's an error in password validation, return it

    return true; // Validation passed
};

// Change password form validation
export const validateChangePasswordForm = (formInfo) => {
    const { password, confirmPassword } = formInfo;

    // Check if there is any missing field
    if (!password || !confirmPassword) {
        return "All fields are required."; // Error message directly returned
    }

    // Validate password and confirmPassword
    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) return passwordError; // If there's an error in password validation, return it

    return true; // Validation passed
};
