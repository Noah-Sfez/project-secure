import express from "express";
import { getUsers, registerUser } from "../controllers/userController.js";


const router = express.Router();

// Routes
router.get("/", getUsers);
router.post("/register", registerUser);
export default router;
