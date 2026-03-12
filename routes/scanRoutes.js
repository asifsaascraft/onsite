import express from "express";
import {
  scanRegister,
  getAllScans,
  getScansByModule,
} from "../controllers/scanController.js";

import { protectAdminOrUser } from "../middlewares/authAny.js";

const router = express.Router();

/* Scan Register */
router.post("/", protectAdminOrUser, scanRegister);

/* Get All Scans */
router.get("/", protectAdminOrUser, getAllScans);

/* Get Scans By Module */
router.get("/module/:moduleId", protectAdminOrUser, getScansByModule);


export default router;