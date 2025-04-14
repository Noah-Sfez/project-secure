import express from "express";
import { authorize } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionsMiddleware.js";
import {
    createProduct,
    getMyProducts,
    getAllProducts,
} from "../controllers/productController.js";
import { testShopifyHmac } from "../controllers/webhookController.js";


const router = express.Router();

router.post(
    "/products",
    authorize,
    checkPermission("can_post_products"),
    createProduct
);
router.get("/my-products", authorize, getMyProducts);
router.get("/products", authorize, checkPermission("can_get_users"), getAllProducts);

router.post(
    "/test-webhook",
    express.raw({ type: "application/json" }),
    testShopifyHmac
);


export default router;
