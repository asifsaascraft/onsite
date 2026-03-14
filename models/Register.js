import mongoose from "mongoose";

const RegisterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    note: {
      type: String,
      required: [true, "Note is required"],
      trim: true,
    },

    regNum: {
      type: String,
      required: [true, "Reg Number is required"],
      unique: true,
    },

    isPrinted: {
      type: Boolean,
      default: false,
    },

    //  Multiple Module IDs
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Register ||
  mongoose.model("Register", RegisterSchema);