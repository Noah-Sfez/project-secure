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

// Register un nouvel utilisateur
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifie que tous les champs sont là
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Merci de remplir tous les champs.' });
    }

    // Hash du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertion dans Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Utilisateur créé avec succès 🚀', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'inscription.' });
  }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier que tous les champs sont remplis
        if (!email || !password) {
            return res
                .status(400)
                .json({
                    error: "Merci de fournir un email et un mot de passe.",
                });
        }

        // Chercher l'utilisateur dans la base
        const { data: users, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Vérifier si l'utilisateur existe
        if (!users || users.length === 0) {
            return res
                .status(401)
                .json({ error: "Email ou mot de passe incorrect." });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ error: "Email ou mot de passe incorrect." });
        }

        // Créer le token JWT (expire dans 1h)
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Connexion réussie ✅", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Une erreur est survenue lors de la connexion.",
        });
    }
};

export const getMyUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: users, error } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("id", userId)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json({ user: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Une erreur est survenue lors de la récupération de vos informations.",
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from("users")
            .select("id, name, email");

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
