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
router.post("/modules", protectAdmin, createModule);

// Get all ( ADMIN ONLY )
router.get("/modules", protectAdmin, getAllModules);

// Get all active ( BOTH )
router.get("/modules/active", protectAdminOrUser, getAllActiveModules);

// Get single ( BOTH )
router.get("/modules/:id", protectAdminOrUser, getModuleById);

// Update ( ADMIN ONLY )
router.put("/modules/:id", protectAdmin, updateModule);

// Delete ( ADMIN ONLY )
router.delete("/modules/:id", protectAdmin, deleteModule);

export default router;