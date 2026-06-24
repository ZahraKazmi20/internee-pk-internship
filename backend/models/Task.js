import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "submitted", "approved", "rejected"],
      default: "pending",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },

    // Submission details (intern fills these)
    submissionText: { type: String, default: "" },
    submissionLink: { type: String, default: "" },
    submittedAt: { type: Date },

    // Admin feedback
    feedback: { type: String, default: "" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
