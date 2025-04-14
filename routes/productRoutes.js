import express from "express";
import { authorize } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionsMiddleware.js";
import {
    createProduct,
    getMyProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.post(
    "/products",
    authorize,
    checkPermission("can_post_products"),
    createProduct
);
router.get("/my-products", authorize, getMyProducts);

export default router;
