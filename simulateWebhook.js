import crypto from "crypto";
import axios from "axios";

// Ton payload brut (string exact !)
const rawBody = JSON.stringify({
    order_id: 1234,
    total: "42.00",
});

// Génère un HMAC avec ta clé secrète
const secret =
    "bd8d71a7fc3613c7698143c5173a5dfa17684b304770cf168211a1da0618e03e";
const hmac = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

// Envoie la requête simulée avec axios
const sendWebhook = async () => {
    try {
        const response = await axios.post(
            "http://localhost:3000/api/webhooks/shopify-sales",
            rawBody,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-shopify-hmac-sha256": hmac,
                },
            }
        );
        console.log("✅ Réponse :", response.data);
    } catch (err) {
        console.error("❌ Erreur :", err.response?.data || err.message);
    }
};

sendWebhook();
