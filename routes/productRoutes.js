import express from "express";
import { authorize } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionsMiddleware.js";
import {
    createProduct,
    getMyProducts,
    getAllProducts,
    createProductWithImage,
} from "../controllers/productController.js";
import { testShopifyHmac } from "../controllers/webhookController.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });



const router = express.Router();

router.post(
    "/products",
    authorize,
    checkPermission("can_post_products"),
    createProduct
);
router.post(
    "/products/with-image",
    authorize,
    checkPermission("can_post_image"),
    upload.single("image"),
    createProductWithImage
);
router.get("/my-products", authorize, getMyProducts);
router.get("/products", authorize, checkPermission("can_get_users"), getAllProducts);

router.post(
    "/test-webhook",
    express.raw({ type: "application/json" }),
    testShopifyHmac
);


export default router;
