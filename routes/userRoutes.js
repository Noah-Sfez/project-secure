import express from "express";
import {
    registerUser,
    loginUser,
    getMyUser,
    getAllUsers,
} from "../controllers/userController.js";
import { authorize } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionsMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

router.get(
    "/my-user",
    authorize,
    checkPermission("can_get_my_user"),
    getMyUser
);
router.get("/users", authorize, checkPermission("can_get_users"), getAllUsers);

export default router;
