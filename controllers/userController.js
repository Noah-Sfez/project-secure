import supabase from "../supabaseClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
};
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ error: "Merci de remplir tous les champs." });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const roleName = role || "USER";

        const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("id")
            .eq("name", roleName)
            .maybeSingle();

        if (roleError || !roleData) {
            console.error(
                "Erreur récupération rôle:",
                roleError || `Rôle ${roleName} non trouvé`
            );
            return res
                .status(400)
                .json({ error: `Rôle ${roleName} non trouvé dans la base.` });
        }

        const roleId = roleData.id;

        const { data, error } = await supabase.from("users").insert([
            {
                name,
                email,
                password: hashedPassword,
                role: roleId,
            },
        ]);

        if (error) {
            console.error("Erreur insertion utilisateur:", error);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({
            message: "Utilisateur créé avec succès 🚀",
            data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Une erreur est survenue lors de l'inscription.",
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Merci de fournir email et mot de passe." });
        }

        const { data: user, error: userError } = await supabase
            .from("users")
            .select(
                `
        id,
        email,
        password,
        role (
          id,
          name
        )
      `
            )
            .eq("email", email)
            .single();

        if (userError || !user) {
            return res
                .status(401)
                .json({ error: "Utilisateur non authentifié 🚫" });
        }

        if (user.role.name === "PERMABAN") {
            return res
                .status(403)
                .json({ error: "Accès refusé : utilisateur banni 🚫" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Mot de passe incorrect 🚫" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Connexion réussie 🚀", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la connexion 🚫" });
    }
};

export const getMyUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: user, error } = await supabase
            .from("users")
            .select(
                `
                id,
                name,
                email,
                role (
                    id,
                    name
                )
            `
            )
            .eq("id", userId)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Une erreur est survenue lors de la récupération de vos informations.",
        });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase.from("users").select(`
                id,
                name,
                email,
                role (
                    id,
                    name
                )
            `);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Une erreur est survenue lors de la récupération des utilisateurs.",
        });
    }
};
