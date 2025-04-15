import crypto from "crypto";
import supabase from "../supabaseClient.js";

export const testShopifyHmac = async (req, res) => {
    try {
        const hmacHeader = req.headers["x-shopify-hmac-sha256"];
        const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

        if (!hmacHeader || !secret) {
            return res
                .status(400)
                .json({ error: "Missing HMAC header or secret." });
        }
        console.log("➡️ Est un buffer :", Buffer.isBuffer(req.body)); // on log d’abord

        const generatedHmac = crypto
            .createHmac("sha256", secret)
            .update(req.body)
            .digest(); // ici pas de base64, on garde en buffer

        const receivedHmac = Buffer.from(hmacHeader, "base64");

        const isValid =
            generatedHmac.length === receivedHmac.length &&
            crypto.timingSafeEqual(generatedHmac, receivedHmac);

        console.log("🔐 generatedHmac:", generatedHmac.toString("base64"));
        console.log("📩 hmacHeader   :", hmacHeader);
        console.log("➡️ Type req.body :", typeof req.body);
        console.log("➡️ Est un buffer :", Buffer.isBuffer(req.body));

        if (isValid) {
            return res
                .status(200)
                .json({ success: true, message: "Authentifié ✅" });
        } else {
            return res
                .status(401)
                .json({ success: false, message: "Faux webhook 🚫" });
        }
    } catch (err) {
        console.error("Erreur test HMAC :", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

export const handleShopifyWebhook = async (req, res) => {
    try {
        const hmacHeader = req.headers["x-shopify-hmac-sha256"];
        const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

        if (!hmacHeader || !secret) {
            return res.status(400).json({ error: "HMAC ou secret manquant." });
        }

        // Vérifier la signature HMAC ✅
        const generatedHmac = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(req.body), "utf8") // ⚠️ ici c'est du buffer brut, pas JSON.parse
            .digest("base64");

        if (generatedHmac !== hmacHeader) {
            return res
                .status(401)
                .json({ error: "Webhook non authentique 🚫" });
        }

        // Extraire le payload brut
        const payload = JSON.parse(req.body.toString());


        const lineItems = payload.line_items;

        for (const item of lineItems) {
            const productId = item.product_id;
            const quantity = item.quantity;

            const { error } = await supabase
                .from("products")
                .update({
                    sales_count: supabase.raw(`sales_count + ${quantity}`),
                })
                .eq("shopify_product_id", productId);

            if (error) {
                console.error(
                    `Erreur mise à jour produit ${productId}:`,
                    error
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Webhook traité avec succès ✅",
        });
    } catch (err) {
        console.error("Erreur traitement webhook:", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};
