import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// helper: recompute an intern's overall progress from their tasks
async function recalcInternProgress(internId) {
  const tasks = await Task.find({ assignedTo: internId });
  if (tasks.length === 0) return;
  const avg = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);
  await User.findByIdAndUpdate(internId, { overallProgress: avg });
}

// @route GET /api/tasks  (admin: all tasks | intern: own tasks)
router.get("/", protect, async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name")
    .sort({ deadline: 1 });
  res.json(tasks);
});

// @route POST /api/tasks  (admin assigns a task)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, deadline, priority } = req.body;
    const task = await Task.create({
      title,
      description,
      assignedTo,
      deadline,
      priority,
      createdBy: req.user._id,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/tasks/:id
router.get("/:id", protect, async (req, res) => {
  const task = await Task.findById(req.params.id).populate("assignedTo", "name email");
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (req.user.role !== "admin" && task.assignedTo._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json(task);
});

// @route PUT /api/tasks/:id  (admin edits task details)
router.put("/:id", protect, adminOnly, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// @route DELETE /api/tasks/:id  (admin deletes task)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
});

// @route PUT /api/tasks/:id/progress  (intern updates their own progress %)
router.put("/:id/progress", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { progress } = req.body;
  task.progress = progress;
  if (progress > 0 && task.status === "pending") task.status = "in-progress";
  await task.save();
  await recalcInternProgress(req.user._id);
  res.json(task);
});

// @route PUT /api/tasks/:id/submit  (intern submits completed work)
router.put("/:id/submit", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { submissionText, submissionLink } = req.body;
  task.submissionText = submissionText || "";
  task.submissionLink = submissionLink || "";
  task.status = "submitted";
  task.progress = 100;
  task.submittedAt = new Date();
  await task.save();
  await recalcInternProgress(req.user._id);
  res.json(task);
});

// @route PUT /api/tasks/:id/review  (admin approves/rejects + leaves feedback)
router.put("/:id/review", protect, adminOnly, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  const { status, feedback } = req.body; // status: "approved" | "rejected"
  task.status = status;
  task.feedback = feedback || "";
  task.reviewedAt = new Date();
  if (status === "rejected") task.progress = Math.min(task.progress, 80);
  await task.save();
  await recalcInternProgress(task.assignedTo);
  res.json(task);
});

export default router;
