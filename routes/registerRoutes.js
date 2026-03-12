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
router.post("/", protectAdmin, createRegister);

// Search Registers -> Admin or User
router.post("/search", protectAdminOrUser, searchRegisters);

// Get All Registers -> Admin or User
router.get("/", protectAdminOrUser, getAllRegisters);

// Get Single Register -> Admin or User
router.get("/:id", protectAdminOrUser, getRegisterById);

// Print Register -> Admin or User
router.patch("/:id/print", protectAdminOrUser, printRegister);

// Delete Register -> Admin only
router.delete("/:id", protectAdmin, deleteRegister);

export default router;