import express from "express";
import {
  createRegister,
  searchRegisters,
  getAllRegisters,
  getRegisterById,
  printRegister,
  deleteRegister,
} from "../controllers/registerController.js";

import { protectAdmin } from "../middlewares/adminAuth.js";
import { protectAdminOrUser } from "../middlewares/authAny.js";

const router = express.Router();

// Create Register -> Admin only
router.post("/registers", protectAdmin, createRegister);

// Search Registers -> Admin or User
router.post("/registers/search", protectAdminOrUser, searchRegisters);

// Get All Registers -> Admin or User
router.get("/registers", protectAdminOrUser, getAllRegisters);

// Get Single Register -> Admin or User
router.get("/registers/:id", protectAdminOrUser, getRegisterById);

// Print Register -> Admin or User
router.patch("/registers/:id/print", protectAdminOrUser, printRegister);

// Delete Register -> Admin only
router.delete("/registers/:id", protectAdmin, deleteRegister);

export default router;