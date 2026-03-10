import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {

    moduleName: {
      type: String,
      required: [true, "Module name is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Module ||
  mongoose.model("Module", ModuleSchema);