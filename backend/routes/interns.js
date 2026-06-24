import express from "express";
import User from "../models/User.js";
import Task from "../models/Task.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// @route GET /api/interns  (admin: all interns)
router.get("/", protect, adminOnly, async (req, res) => {
  const interns = await User.find({ role: "intern" }).sort({ createdAt: -1 });
  res.json(interns);
});

// @route POST /api/interns  (admin onboards a new intern)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, department, track, startDate, endDate } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const intern = await User.create({
      name,
      email,
      password,
      role: "intern",
      department,
      track,
      startDate,
      endDate,
    });

    res.status(201).json(intern);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/interns/:id  (admin or the intern themself)
router.get("/:id", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const intern = await User.findById(req.params.id);
  if (!intern) return res.status(404).json({ message: "Intern not found" });
  res.json(intern);
});

// @route PUT /api/interns/:id  (admin updates intern profile/status)
router.put("/:id", protect, adminOnly, async (req, res) => {
  const { password, ...rest } = req.body; // prevent password update through this route
  const intern = await User.findByIdAndUpdate(req.params.id, rest, {
    new: true,
    runValidators: true,
  });
  if (!intern) return res.status(404).json({ message: "Intern not found" });
  res.json(intern);
});

// @route DELETE /api/interns/:id  (admin removes intern)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  const intern = await User.findByIdAndDelete(req.params.id);
  if (!intern) return res.status(404).json({ message: "Intern not found" });
  await Task.deleteMany({ assignedTo: req.params.id });
  res.json({ message: "Intern removed" });
});

export default router;
