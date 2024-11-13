import express from "express";

// Import the user controllers
import { loginUser } from "../controllers/login.js";
import { registerUser } from "../controllers/register.js";
import { isTokenValid } from "../controllers/isTokenValid.js";
import { userProfile } from "../controllers/profile.js";
import { changePassword } from "../controllers/change-password.js";
import { deleteUser } from "../controllers/delete.js";
import { logoutUser } from "../controllers/logout.js";
import { authorizedRoutes } from "../auth/auth.js";

const router = express.Router();

// User login endpoint
router.post("/login", loginUser);

// User register endpoint
router.post("/register", registerUser);

// User token validation endpoint (requires auth)
router.post("/is-token-valid", authorizedRoutes, isTokenValid);

// User profile endpoint (requires auth)
router.get("/profile", authorizedRoutes, userProfile);

// User change password endpoint (requires auth)
router.post("/change-password", authorizedRoutes, changePassword);

// User delete account endpoint (requires auth)
router.delete("/delete-account/:id", authorizedRoutes, deleteUser);

//logout
router.post('/logout', logoutUser);


export default router;
