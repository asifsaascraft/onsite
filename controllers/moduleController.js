// controllers/moduleController.js

import mongoose from "mongoose";
import Module from "../models/Module.js";

/* ======================================================
   Create Module
====================================================== */
export const createModule = async (req, res) => {
  try {
    const { moduleName, status } = req.body;

    if (!moduleName) {
      return res.status(400).json({
        success: false,
        message: "Module name is required",
      });
    }

    // check duplicate
    const exists = await Module.findOne({ moduleName });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Module already exists",
      });
    }

    const module = await Module.create({
      moduleName,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Get All Modules
====================================================== */
export const getAllModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Get All Active Modules
====================================================== */
export const getAllActiveModules = async (req, res) => {
  try {
    const modules = await Module.find({ status: "Active" })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Get Single Module
====================================================== */
export const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module = await Module.findById(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    res.json({
      success: true,
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Update Module
====================================================== */
export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module = await Module.findById(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    Object.assign(module, req.body);

    await module.save();

    res.json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Delete Module
====================================================== */
export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    const module = await Module.findById(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    await module.deleteOne();

    res.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};