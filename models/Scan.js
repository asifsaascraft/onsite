import mongoose from "mongoose";

const ScanSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    registerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      required: true,
    },

    regNum: {
      type: String,
      required: [true, "Reg Number is required"],
      trim: true,
      uppercase: true,
    },

    isScanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate scan for same module + regNum
ScanSchema.index({ moduleId: 1, regNum: 1 }, { unique: true });

export default mongoose.models.Scan || mongoose.model("Scan", ScanSchema);