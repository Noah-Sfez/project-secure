import express from "express";
import { authorize } from "../middlewares/authMiddleware.js";

import { testShopifyHmac } from "../controllers/webhookController.js";


const router = express.Router();
router.post(
    "/",
    express.raw({ type: "application/json" }),
    testShopifyHmac
);


export default router;
