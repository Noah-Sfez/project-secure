import express from "express";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import webhookRoutes from "./routes/webhooksRoutes.js";

const app = express();
const PORT = 3000;

app.use("/api/webhooks", webhookRoutes);
app.use(express.json()); // Pour toutes les routes standards

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.get("/health", (req, res) => {
    res.json({ test: "hello world" });
});

app.get("/", (req, res) => {
    res.send("Bienvenue sur ton serveur Node.js avec Express");
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
