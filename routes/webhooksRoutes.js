import express from "express";
import { testShopifyHmac } from "../controllers/webhookController.js";

const router = express.Router();

router.post(
    "/shopify-sales",
    express.raw({ type: "application/json" }),
    testShopifyHmac
);

export default router;
