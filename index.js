import express from "express";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import webhookRoutes from "./routes/webhooksRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/webhooks/shopify-sales", express.raw({ type: "application/json" }));
app.use("/api/webhooks", webhookRoutes);

app.get("/health", (req, res) => {
    res.json({ test: "hello world" });
});

app.get("/", (req, res) => {
    res.send("Bienvenue sur ton serveur Node.js avec Express");
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
