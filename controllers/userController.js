// GET /api/users
const getUsers = (req, res) => {
    res.send("Liste des utilisateurs");
};

// POST /api/users
const createUser = (req, res) => {
    const { name } = req.body;
    res.send(`Utilisateur ${name} créé avec succès ! 🎉`);
};

module.exports = { getUsers, createUser };
