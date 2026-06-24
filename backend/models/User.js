import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "intern"], default: "intern" },

    // Intern-specific fields
    department: { type: String, default: "" },
    track: { type: String, default: "" }, // e.g. "MERN Stack Development"
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["active", "completed", "removed"], default: "active" },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
