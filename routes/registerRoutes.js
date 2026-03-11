import express from "express";
import {
  createRegister,
  searchRegisters,
  getAllRegisters,
  getRegisterById,
  deleteRegister,
} from "../controllers/registerController.js";

import { protectAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

// Create Register
router.post("/registers", createRegister);

// Search Registers
router.get("/registers/search", searchRegisters);

// Get All Registers
router.get("/registers", getAllRegisters);

// Get Single Register
router.get("/registers/:id", getRegisterById);

// Delete Register
router.delete("/registers/:id", deleteRegister);

export default router;