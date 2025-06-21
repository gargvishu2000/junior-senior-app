
import { Router } from "express";
import { register, login, getCurrentUser } from "../controller/usercontroller.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

router.post('/register',register);

// Login user
router.post('/login', login);

// Get current user
router.get('/me',auth, getCurrentUser);

// Get all users (for chat user selection)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'username email avatar createdAt')
      .sort({ username: 1 })
      .limit(50); // Limit to prevent large responses

    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;