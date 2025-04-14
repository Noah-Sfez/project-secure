import supabase from "../supabaseClient.js";
import bcrypt from "bcrypt";

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