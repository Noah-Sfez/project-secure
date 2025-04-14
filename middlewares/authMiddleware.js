import jwt from "jsonwebtoken";

export const authorize = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "Token manquant 🚫" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Token invalide 🚫" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // On ajoute les infos du user dans la requête

        next();
    } catch (error) {
        return res.status(401).json({ error: "Token invalide ou expiré 🚫" });
    }
};
