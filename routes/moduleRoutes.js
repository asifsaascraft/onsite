// routes/moduleRoutes.js

import express from "express";
import {
  createModule,
  getAllModules,
  getAllActiveModules,
  getModuleById,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";

import { protectAdmin } from "../middlewares/adminAuth.js";
import { protectAdminOrUser } from "../middlewares/authAny.js";

const router = express.Router();


// Create ( ADMIN ONLY )
router.post("/", protectAdmin, createModule);

// Get all ( ADMIN ONLY )
router.get("/", protectAdmin, getAllModules);

// Get all active ( BOTH )
router.get("/active", protectAdminOrUser, getAllActiveModules);

// Get single ( BOTH )
router.get("/:id", protectAdminOrUser, getModuleById);

// Update ( ADMIN ONLY )
router.put("/:id", protectAdmin, updateModule);

// Delete ( ADMIN ONLY )
router.delete("/:id", protectAdmin, deleteModule);

export default router;