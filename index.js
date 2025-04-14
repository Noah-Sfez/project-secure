const express = require("express");
const app = express();
const PORT = 3000;

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
    res.json({ test: "hello world" });
});

app.get("/", (req, res) => {
    res.send("Bienvenue sur ton serveur Node.js avec Express");
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
