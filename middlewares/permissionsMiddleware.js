import supabase from "../supabaseClient.js";

export const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "Utilisateur non authentifié 🚫" });
            }

            const { data: roleData, error: roleError } = await supabase
                .from("roles")
                .select(permissionName)
                .eq("id", req.user.roleId)
                .single();

            if (roleError || !roleData) {
                console.error(roleError);
                return res.status(403).json({ error: "Accès interdit 🚫" });
            }

            if (!roleData[permissionName]) {
                return res.status(403).json({ error: "Permission refusée 🚫" });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erreur lors de la vérification des permissions 🚫",
            });
        }
    };
};
