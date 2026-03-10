import express from "express";
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protectAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

router.use(protectAdmin);

//  Create user
router.post("/users/create", createUser);

// list
router.get("/users", getAllUsers);

router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
