import mongoose from "mongoose";
import Scan from "../models/Scan.js";
import Register from "../models/Register.js";
import Module from "../models/Module.js";

/* ======================================================
   Scan Register (Admin or User)
====================================================== */
export const scanRegister = async (req, res) => {
  try {
    const { regNum, moduleId } = req.body;

    if (!regNum || !moduleId) {
      return res.status(400).json({
        success: false,
        message: "regNum and moduleId are required",
      });
    }

    /* validate module id */
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    /* check register exists */
    const register = await Register.findOne({
      regNum: regNum.toUpperCase(),
    });

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Register not found",
      });
    }

    /* check register has this module */
    if (!register.modules.includes(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "This register is not assigned to this module",
      });
    }

    /* check if already scanned */
    const existingScan = await Scan.findOne({
      regNum: regNum.toUpperCase(),
      moduleId,
    });

    if (existingScan) {
      return res.status(400).json({
        success: false,
        message: "Already scanned for this module",
      });
    }

    const scan = await Scan.create({
      regNum: regNum.toUpperCase(),
      moduleId,
      isScanned: true,
    });

    res.status(201).json({
      success: true,
      message: "Scan successful",
      data: scan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Get All Scans
====================================================== */
export const getAllScans = async (req, res) => {
  try {
    const scans = await Scan.find()
      .populate("moduleId", "moduleName status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: scans.length,
      data: scans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Get All Scans By Module
====================================================== */
export const getScansByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // validate moduleId
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    // check module exists
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // find scans
    const scans = await Scan.find({ moduleId })
      .populate("moduleId", "moduleName status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      module: module.moduleName,
      count: scans.length,
      data: scans,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};