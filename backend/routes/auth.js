import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @route POST /api/auth/register
// Open registration is restricted: only admins can create intern accounts (onboarding).
// The very first admin can be created when no admin exists yet.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, track, startDate, endDate } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(403).json({ message: "Admin already exists. Ask an existing admin to onboard you." });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "intern",
      department,
      track,
      startDate,
      endDate,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
