import express from "express";
import {
    getUsers,
    registerUser,
    loginUser,
    getMyUser,
    getAllUsers,
} from "../controllers/userController.js";
import { authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my-user", authorize, getMyUser);
router.get("/", authorize, getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", authorize, getAllUsers);
export default router;
