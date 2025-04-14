import supabase from "../supabaseClient.js";

export const getUsers = async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
};
