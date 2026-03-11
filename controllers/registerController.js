import mongoose from "mongoose";
import Register from "../models/Register.js";
import Module from "../models/Module.js";

/* ======================================================
   Generate Random Reg Number (8 characters)
====================================================== */
const generateRegNum = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let regNum = "";

  for (let i = 0; i < 8; i++) {
    regNum += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return regNum;
};

/* ======================================================
   Create Register (Admin only)
====================================================== */
export const createRegister = async (req, res) => {
  try {
    const { name, mobile, note, modules } = req.body;

    if (!name || !mobile || !note || !modules || modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "name, mobile, note and modules are required",
      });
    }

    // validate modules exist
    const moduleExists = await Module.find({
      _id: { $in: modules },
    });

    if (moduleExists.length !== modules.length) {
      return res.status(400).json({
        success: false,
        message: "One or more module IDs are invalid",
      });
    }

    // generate unique reg number
    let regNum;
    let exists = true;

    while (exists) {
      regNum = generateRegNum();
      const regCheck = await Register.findOne({ regNum });
      if (!regCheck) exists = false;
    }

    const register = await Register.create({
      name,
      mobile,
      note,
      modules,
      regNum,
    });

    res.status(201).json({
      success: true,
      message: "Register created successfully",
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Get All Registers (Admin or User)
====================================================== */
export const getAllRegisters = async (req, res) => {
  try {
    const registers = await Register.find()
      .populate("modules", "moduleName status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registers.length,
      data: registers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Get Register By ID (Admin or User)
====================================================== */
export const getRegisterById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid register ID",
      });
    }

    const register = await Register.findById(id).populate(
      "modules",
      "moduleName status"
    );

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Register not found",
      });
    }

    res.json({
      success: true,
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Delete Register (Admin only)
====================================================== */
export const deleteRegister = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid register ID",
      });
    }

    const register = await Register.findById(id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Register not found",
      });
    }

    await register.deleteOne();

    res.json({
      success: true,
      message: "Register deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Search Registers (name / mobile / regNum) - POST (Admin or User)
====================================================== */
export const searchRegisters = async (req, res) => {
  try {
    const { name, mobile, regNum } = req.body;

    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (mobile) {
      filter.mobile = { $regex: mobile, $options: "i" };
    }

    if (regNum) {
      filter.regNum = regNum.toUpperCase();
    }

    const registers = await Register.find(filter)
      .populate("modules", "moduleName status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registers.length,
      data: registers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Mark Register as Printed (Admin or User)
====================================================== */
export const printRegister = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid register ID",
      });
    }

    const register = await Register.findById(id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Register not found",
      });
    }

    register.isPrinted = true;

    await register.save();

    res.json({
      success: true,
      message: "Register marked as printed",
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};