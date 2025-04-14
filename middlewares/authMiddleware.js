import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";

export const authorize = async (req, res, next) => {
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

        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, name, email, role")
            .eq("id", decoded.id)
            .single();

        if (userError || !userData) {
            console.error(userError);
            return res.status(401).json({ error: "Utilisateur non trouvé 🚫" });
        }

        req.user = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            roleId: userData.role,
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: "Token invalide ou expiré 🚫" });
    }
};
