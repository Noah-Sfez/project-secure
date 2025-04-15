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

        const generatedHmac = crypto
            .createHmac("sha256", secret)
            .update(req.body)
            .digest(); // Buffer

        const receivedHmac = Buffer.from(hmacHeader, "base64");

        const isValid =
            generatedHmac.length === receivedHmac.length &&
            crypto.timingSafeEqual(generatedHmac, receivedHmac);

        console.log("🔐 generatedHmac:", generatedHmac.toString("base64"));
        console.log("📩 hmacHeader   :", hmacHeader);
        console.log("➡️ Type req.body :", typeof req.body);
        console.log("➡️ Est un buffer :", Buffer.isBuffer(req.body));

        if (!isValid) {
            return res
                .status(401)
                .json({ success: false, message: "Faux webhook 🚫" });
        }

        // ✅ HMAC est valide, on parse le body brut
        const payload = JSON.parse(req.body.toString("utf8"));
        const lineItems = payload.line_items || [];

        for (const item of lineItems) {
            const productId = item.product_id;
            const quantity = item.quantity;

            // Étape 1 : récupérer le produit existant
            const { data: existingProduct, error: fetchError } = await supabase
                .from("products")
                .select("id, sales_count")
                .eq("shopify_id", productId)
                .single();

            if (fetchError || !existingProduct) {
                console.error(
                    `❌ Produit avec shopify_id ${productId} introuvable`,
                    fetchError
                );
                continue;
            }

            // Étape 2 : incrémenter le sales_count
            const newCount = (existingProduct.sales_count || 0) + quantity;

            const { error: updateError } = await supabase
                .from("products")
                .update({ sales_count: newCount })
                .eq("shopify_id", productId);

            if (updateError) {
                console.error(
                    `❌ Échec mise à jour du produit ${productId}`,
                    updateError
                );
            } else {
                console.log(
                    `✅ Produit ${productId} mis à jour avec sales_count = ${newCount}`
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Authentifié et produits mis à jour ✅",
        });
    } catch (err) {
        console.error("💥 Erreur traitement webhook :", err);
        return res.status(500).json({ error: "Erreur serveur." });
    }
};
