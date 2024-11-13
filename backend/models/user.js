import mongoose from "mongoose";

// Create user schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    confirmPassword: {
        type: String,
        minlength: 6,
        required: true,
    },
});

const User = mongoose.model("users", UserSchema);

export default User;
